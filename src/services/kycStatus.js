const STORAGE_PREFIX = 'kyc_doc_';
import { listAll, ref } from 'firebase/storage';
import { storage } from './firebase.js';

export async function getKycStatus(customerId) {
    let items = [];
    try {
        const folderRef = ref(storage, `kyc/${customerId}`);
        ({ items } = await listAll(folderRef));
    } catch {
        // Treat as "nothing uploaded" if the folder doesn't exist or isn't listable.
    }

    const names = items.map((item) => item.name);
    return {
        proofOfResidence: names.some((name) => name.startsWith('proof-of-residence-')),
        selfie: names.some((name) => name.startsWith('selfie-')),
    };
}

export function markDocumentUploaded(customerId, docType) {
    window.localStorage.setItem(`${STORAGE_PREFIX}${customerId}_${docType}`, 'true');
}
