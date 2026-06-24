const STORAGE_PREFIX = 'kyc_doc_';

export function getKycStatus(customerId) {
    return {
        proofOfResidence: window.localStorage.getItem(`${STORAGE_PREFIX}${customerId}_proof-of-residence`) === 'true',
        selfie: window.localStorage.getItem(`${STORAGE_PREFIX}${customerId}_selfie`) === 'true',
    };
}

export function markDocumentUploaded(customerId, docType) {
    window.localStorage.setItem(`${STORAGE_PREFIX}${customerId}_${docType}`, 'true');
}
