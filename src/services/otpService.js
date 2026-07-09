import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase.js';

const requestOtpFn = httpsCallable(functions, 'requestOtp');
const verifyOtpFn  = httpsCallable(functions, 'verifyOtp');

export async function requestOtp(email) {
    await requestOtpFn({ email });
}

export async function verifyOtp(email, code) {
    await verifyOtpFn({ email, code });
}
