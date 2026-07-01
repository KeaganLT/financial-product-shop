import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

initializeApp();
const db = getFirestore();

const VAULT_COLLECTION = 'credentialVault';

// 32-byte base64 key, e.g. generated with: openssl rand -base64 32
const LEGACY_VAULT_KEY = defineSecret('LEGACY_VAULT_KEY');
// Public base URL of the legacy backend (Cloud Functions can't reach a
// dev-only relative "/v1" path or localhost — this must be a real host).
const LEGACY_BACKEND_URL = defineSecret('LEGACY_BACKEND_URL');

function encrypt(plaintext, base64Key) {
    const key = Buffer.from(base64Key, 'base64');
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return {
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        ciphertext: ciphertext.toString('base64'),
    };
}

function decrypt({ iv, authTag, ciphertext }, base64Key) {
    const key = Buffer.from(base64Key, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));
    const plaintext = Buffer.concat([
        decipher.update(Buffer.from(ciphertext, 'base64')),
        decipher.final(),
    ]);
    return plaintext.toString('utf8');
}

function decodeCustomerId(token) {
    const payload = token.split('.')[1];
    const json = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(json).sub;
}

// Called once, right after the legacy backend account is created during
// sign-up. Stores the legacy username/password so we can replay the login
// later on the user's behalf — the legacy DB itself is never touched again.
export const vaultLegacyCredentials = onCall({ secrets: [LEGACY_VAULT_KEY] }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { legacyUsername, legacyPassword } = request.data ?? {};
    if (!legacyUsername || !legacyPassword) {
        throw new HttpsError('invalid-argument', 'legacyUsername and legacyPassword are required.');
    }

    const docRef = db.collection(VAULT_COLLECTION).doc(request.auth.uid);
    const existing = await docRef.get();
    if (existing.exists) {
        // Already vaulted for this user — never overwrite.
        return { status: 'already-vaulted' };
    }

    await docRef.set({
        legacyUsername,
        legacyPassword: encrypt(legacyPassword, LEGACY_VAULT_KEY.value()),
        createdAt: new Date().toISOString(),
    });

    return { status: 'vaulted' };
});

// Looks up the vaulted legacy credentials for the calling user and replays
// the login against the legacy backend, so the plaintext password never
// reaches the browser at all — only the resulting session token does.
export const legacyLogin = onCall(
    { secrets: [LEGACY_VAULT_KEY, LEGACY_BACKEND_URL] },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be signed in.');
        }

        const docRef = db.collection(VAULT_COLLECTION).doc(request.auth.uid);
        const snapshot = await docRef.get();
        if (!snapshot.exists) {
            throw new HttpsError('not-found', 'No vaulted credentials for this account.');
        }

        const { legacyUsername, legacyPassword } = snapshot.data();
        const password = decrypt(legacyPassword, LEGACY_VAULT_KEY.value());

        const response = await fetch(`${LEGACY_BACKEND_URL.value()}/v1/token`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${Buffer.from(`${legacyUsername}:${password}`).toString('base64')}`,
            },
        });

        if (!response.ok) {
            throw new HttpsError('internal', 'Legacy backend login failed.');
        }

        const data = await response.json();
        const token = data.loginAccessKey;
        if (!token) {
            throw new HttpsError('internal', 'Legacy backend did not return a token.');
        }

        return { token, customerId: decodeCustomerId(token) };
    }
);

// Dev-only endpoint explorer — hits every known backend endpoint and returns
// the full response from each. Only works in the emulator (blocked in prod).
export const debugEndpoints = onCall(
    { secrets: [LEGACY_BACKEND_URL] },
    async (request) => {
        if (process.env.FUNCTIONS_EMULATOR !== 'true') {
            throw new HttpsError('permission-denied', 'Only available in the emulator.');
        }

        const base = LEGACY_BACKEND_URL.value();
        const { username, password } = request.data ?? {};

        async function hit(label, url, options = {}) {
            try {
                const res = await fetch(url, options);
                let body;
                try { body = await res.json(); } catch { body = await res.text(); }
                return { label, url, status: res.status, ok: res.ok, body };
            } catch (err) {
                return { label, url, error: err.message };
            }
        }

        const results = {};

        // ── No-auth endpoints ────────────────────────────────────────────────
        results.products        = await hit('GET /client/v1/products',    `${base}/client/v1/products`);
        results.productById     = await hit('GET /client/v1/products/1',  `${base}/client/v1/products/1`);
        results.customerTypes   = await hit('GET /client/v1/types',       `${base}/client/v1/types`);

        // ── Auth: get a token ────────────────────────────────────────────────
        if (!username || !password) {
            results._note = 'Pass { username, password } in request data to test authenticated endpoints.';
            return results;
        }

        const tokenRes = await hit(
            'POST /v1/token',
            `${base}/v1/token`,
            { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}` } }
        );
        results.token = tokenRes;

        if (!tokenRes.ok) {
            results._note = 'Login failed — authenticated endpoints skipped.';
            return results;
        }

        const jwt = tokenRes.body?.loginAccessKey;
        const authHeader = { Authorization: `Bearer ${jwt}` };

        // ── Authenticated endpoints ──────────────────────────────────────────
        results.profile      = await hit('GET /client/v1/profile',              `${base}/client/v1/profile`,              { headers: authHeader });
        results.accounts     = await hit('GET /client/v1/profile/accounts',     `${base}/client/v1/profile/accounts`,     { headers: authHeader });
        results.documents    = await hit('GET /client/v1/profile/documents',    `${base}/client/v1/profile/documents`,    { headers: authHeader });
        results.subscriptions = await hit('GET /client/v1/subscriptions',       `${base}/client/v1/subscriptions`,        { headers: authHeader });

        results.eligibility  = await hit(
            'POST /client/v1/subscriptions/eligibility',
            `${base}/client/v1/subscriptions/eligibility`,
            { method: 'POST', headers: { ...authHeader, 'Content-Type': 'application/json' }, body: JSON.stringify({ productIds: [1, 2, 3, 4, 5, 6, 7, 8, 9] }) }
        );

        return results;
    }
);
