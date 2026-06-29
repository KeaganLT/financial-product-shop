import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase.js';

// Stores the legacy backend username/password once, server-side, so a
// future Google sign-in can recover them without the browser ever holding
// the legacy password again. Safe to call more than once — the Cloud
// Function no-ops if credentials are already vaulted for this user.
export async function vaultLegacyCredentials(legacyUsername, legacyPassword) {
    const callable = httpsCallable(functions, 'vaultLegacyCredentials');
    await callable({ legacyUsername, legacyPassword });
}

// Replays the legacy login server-side using the vaulted credentials and
// returns the resulting session — the legacy password itself never reaches
// the browser.
export async function legacyLogin() {
    const callable = httpsCallable(functions, 'legacyLogin');
    const { data } = await callable();
    return data;
}
