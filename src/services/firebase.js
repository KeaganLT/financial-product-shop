import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAnalytics, isSupported as isAnalyticsSupported, logEvent } from 'firebase/analytics';
import {
    getAuth,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    GoogleAuthProvider,
    signInWithPopup,
    reauthenticateWithCredential,
    reauthenticateWithPopup,
    EmailAuthProvider,
    updatePassword,
    verifyBeforeUpdateEmail,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const storage    = getStorage(firebaseApp);
export const auth       = getAuth(firebaseApp);
export const functions  = getFunctions(firebaseApp);
export const db         = getFirestore(firebaseApp);

if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
    connectFunctionsEmulator(functions, 'localhost', 5001);
    connectFirestoreEmulator(db, 'localhost', 8085);
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
}

const EMAIL_FOR_SIGN_IN_KEY = 'emailForSignIn';
const PASSWORD_FOR_SIGN_IN_KEY = 'passwordForSignIn';

// Sends a real "click to verify" email via Firebase's own infrastructure.
// The link sends the user back to /signup, where we detect and complete it.
// The link click reloads the page (fresh React state), so we also stash the
// legacy-account password the user just chose — otherwise it's lost and the
// later /v1/token login during KYC submit fails with Bad credentials.
export async function sendVerificationEmail(email, password) {
    const actionCodeSettings = {
        url: `${window.location.origin}/signup`,
        handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
    window.localStorage.setItem(PASSWORD_FOR_SIGN_IN_KEY, password);
}

// Same Firebase email mechanism as sendVerificationEmail, but for an email
// that's already registered — the link lands on /login instead of /signup.
// Uses the identical Firebase template, so the email itself doesn't reveal
// to anyone other than the inbox owner whether the account already existed.
export async function sendExistingAccountEmail(email) {
    const actionCodeSettings = {
        url: `${window.location.origin}/login?email=${encodeURIComponent(email)}`,
        handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
}

export function isEmailVerificationLink() {
    return isSignInWithEmailLink(auth, window.location.href);
}

export function getStoredVerificationEmail() {
    return window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);
}

export function getStoredVerificationPassword() {
    return window.localStorage.getItem(PASSWORD_FOR_SIGN_IN_KEY);
}

// Completes the passwordless sign-in started by sendVerificationEmail().
// Returns the verified email address.
export async function completeEmailVerification(email) {
    if (!email) {
        throw new Error('Missing email to complete verification');
    }
    await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
    window.localStorage.removeItem(PASSWORD_FOR_SIGN_IN_KEY);
    return email;
}

const googleProvider = new GoogleAuthProvider();

// Opens the Google account picker and returns the signed-in user's
// (already verified) email address.
export async function signInWithGoogle() {
    const { user } = await signInWithPopup(auth, googleProvider);
    return user.email;
}

// Analytics only works in a real browser (not SSR/Node), so guard it
export const analyticsPromise = isAnalyticsSupported().then((supported) => {
    if (!supported) return null;
    const analytics = getAnalytics(firebaseApp);
    if (import.meta.env.DEV) {
        window.gtag?.('set', { debug_mode: true });
    }
    return analytics;
});

// Fire-and-forget analytics event. Safe to call even if Analytics didn't load.
export async function trackEvent(eventName, params) {
    const analytics = await analyticsPromise;
    if (analytics) {
        logEvent(analytics, eventName, params);
    }
}

// Uploads a KYC document for a given customer and returns its public download URL.
// docType is e.g. 'selfie' or 'proof-of-residence'.
export async function uploadKycDocument(customerUsername, docType, file) {
    const ext = file.name.includes('.') ? `.${file.name.split('.').pop()}` : '';
    const path = `kyc/${customerUsername}/${docType}${ext}`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
}

// Sends a Firebase password reset email to the given address.
export async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
}

// ─── Credential management ────────────────────────────────────────────────────

// Returns the sign-in provider for the currently signed-in Firebase user.
// 'google.com' | 'password' | null
export function getSignInProvider() {
    const user = auth.currentUser;
    if (!user) return null;
    return user.providerData?.[0]?.providerId ?? null;
}

// Re-authenticates the current user.
// For email/password accounts: pass currentPassword.
// For Google accounts: pass null — triggers a Google popup.
export async function reAuthenticate(currentPassword) {
    const user = auth.currentUser;
    if (!user) throw new Error('No user signed in');
    const provider = getSignInProvider();
    if (provider === 'google.com') {
        await reauthenticateWithPopup(user, googleProvider);
    } else {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
    }
}

// Changes the Firebase Auth password after re-authenticating.
export async function changePassword(currentPassword, newPassword) {
    await reAuthenticate(currentPassword);
    await updatePassword(auth.currentUser, newPassword);
}

// Sends a verification email to newEmail. The change only takes effect once
// the user clicks the link in that email. Safe: current email stays active
// until confirmed.
export async function changeEmail(currentPassword, newEmail) {
    await reAuthenticate(currentPassword);
    await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
}

// Uploads a signed contract PDF blob for a given customer + product.
export async function uploadSignedContract(customerId, productId, blob) {
    const path = `contracts/${customerId}/${productId}_signed.pdf`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, blob, { contentType: 'application/pdf' });
    return getDownloadURL(fileRef);
}
