import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getBankDetails } from './bankingService';

function accountsRef(customerId) {
    return doc(db, 'bankAccounts', String(customerId));
}

function makeId() {
    return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `acc-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getBankAccounts(customerId) {
    const snap = await getDoc(accountsRef(customerId));
    if (snap.exists()) {
        const data = snap.data();
        return { accounts: data.accounts ?? [], assignments: data.assignments ?? {} };
    }

    const legacy = getBankDetails(customerId);
    if (legacy) {
        const seeded = { id: makeId(), ...legacy };
        await setDoc(accountsRef(customerId), {
            accounts: [seeded],
            assignments: {},
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return { accounts: [seeded], assignments: {} };
    }

    return { accounts: [], assignments: {} };
}

export async function addBankAccount(customerId, details) {
    const { accounts, assignments } = await getBankAccounts(customerId);
    const account = { id: makeId(), ...details };
    await setDoc(accountsRef(customerId), {
        accounts: [...accounts, account],
        assignments,
        updatedAt: serverTimestamp(),
    }, { merge: true });
    return account;
}

export async function upsertBankAccountByLast4(customerId, details) {
    const { accounts, assignments } = await getBankAccounts(customerId);
    const idx = accounts.findIndex((a) => a.last4 === details.last4 && a.bankName === details.bankName);
    const next = [...accounts];
    let account;
    if (idx >= 0) {
        account = { ...next[idx], ...details };
        next[idx] = account;
    } else {
        account = { id: makeId(), ...details };
        next.push(account);
    }
    await setDoc(accountsRef(customerId), {
        accounts: next,
        assignments,
        updatedAt: serverTimestamp(),
    }, { merge: true });
    return account;
}

export async function assignAccountToProduct(customerId, productId, accountId) {
    await setDoc(accountsRef(customerId), {
        assignments: { [String(productId)]: accountId },
        updatedAt: serverTimestamp(),
    }, { merge: true });
}

export function resolveAccountForProduct(accountsData, productId) {
    const { accounts, assignments } = accountsData;
    if (accounts.length === 0) return null;
    const assignedId = assignments[String(productId)];
    return accounts.find((a) => a.id === assignedId) ?? accounts[0];
}
