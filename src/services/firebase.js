import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAnalytics, isSupported as isAnalyticsSupported, logEvent } from 'firebase/analytics';
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';

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
export const storage = getStorage(firebaseApp);

export const auth = getAuth(firebaseApp);

const EMAIL_FOR_SIGN_IN_KEY = 'emailForSignIn';

// Sends a real "click to verify" email via Firebase's own infrastructure.
// The link sends the user back to /signup, where we detect and complete it.
export async function sendVerificationEmail(email) {
    const actionCodeSettings = {
        url: `${window.location.origin}/signup`,
        handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
}


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

// Completes the passwordless sign-in started by sendVerificationEmail().
// Returns the verified email address.
export async function completeEmailVerification(email) {
    if (!email) {
        throw new Error('Missing email to complete verification');
    }
    await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
    return email;
}

// Analytics only works in a real browser (not SSR/Node), so guard it
export const analyticsPromise = isAnalyticsSupported().then((supported) =>
    supported ? getAnalytics(firebaseApp) : null
);

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
    const path = `kyc/${customerUsername}/${docType}-${Date.now()}-${file.name}`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
}