import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Firestore path: contracts/{customerId}/products/{productId}
function contractRef(customerId, productId) {
    return doc(db, 'contracts', String(customerId), 'products', String(productId));
}

/**
 * Save (or overwrite) a contract record after signing/uploading.
 * Fields stored:
 *   signedAt        — client timestamp (ms) when the user signed
 *   signature       — the typed name used as digital signature
 *   downloadUrl     — Firebase Storage URL of the signed PDF
 *   productId       — numeric/string product ID
 *   productName     — display name
 *   productPrice    — monthly premium
 *   bankName        — bank display name
 *   last4           — last 4 digits of account number
 *   accountType     — e.g. "Cheque / Current"
 *   debitDay        — day of month for debit order
 *   createdAt       — server timestamp (set once on first save)
 *   updatedAt       — server timestamp (updated on every save)
 */
export async function saveContractRecord(customerId, productId, {
    signature,
    signedAt,
    downloadUrl,
    productName,
    productPrice,
    bankName,
    last4,
    accountType,
    debitDay,
}) {
    const ref  = contractRef(customerId, productId);
    const snap = await getDoc(ref);

    await setDoc(ref, {
        productId:    String(productId),
        productName:  productName ?? '',
        productPrice: productPrice ?? 0,
        bankName:     bankName     ?? '',
        last4:        last4        ?? '',
        accountType:  accountType  ?? '',
        debitDay:     debitDay     ?? null,
        signature:    signature    ?? '',
        signedAt:     signedAt     ?? null,
        downloadUrl:  downloadUrl  ?? '',
        updatedAt:    serverTimestamp(),
        // Only set createdAt on first write
        ...(snap.exists() ? {} : { createdAt: serverTimestamp() }),
    }, { merge: true });
}

/**
 * Fetch the contract record for a customer + product.
 * Returns null if no record exists yet.
 */
export async function getContractRecord(customerId, productId) {
    const snap = await getDoc(contractRef(customerId, productId));
    return snap.exists() ? snap.data() : null;
}
