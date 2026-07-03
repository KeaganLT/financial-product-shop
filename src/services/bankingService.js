const STORAGE_KEY = 'finshop_bank_details';

export function getBankDetails(userId) {
    try {
        const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function saveBankDetails(userId, details) {
    // details: { bankName, last4, accountType, debitDay }
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(details));
}

export function clearBankDetails(userId) {
    localStorage.removeItem(`${STORAGE_KEY}_${userId}`);
}
