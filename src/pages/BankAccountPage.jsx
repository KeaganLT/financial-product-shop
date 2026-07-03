import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBankDetails, saveBankDetails } from '../services/bankingService';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const BANKS = [
    'ABSA Bank', 'Capitec Bank', 'FNB (First National Bank)', 'Nedbank',
    'Standard Bank', 'African Bank', 'Investec', 'TymeBank',
];
const ACCOUNT_TYPES = ['Cheque / Current', 'Savings', 'Transmission'];
const DEBIT_DAYS = [1, 15, 25];

export default function BankAccountPage() {
    const navigate       = useNavigate();
    const { auth, isLoggedIn } = useAuth();
    const { showToast }  = useToast();

    const existing = isLoggedIn ? getBankDetails(auth?.customerId) : null;

    const [bankName, setBankName]       = useState(existing?.bankName ?? '');
    const [accountNo, setAccountNo]     = useState('');
    const [accountType, setAccountType] = useState(existing?.accountType ?? ACCOUNT_TYPES[0]);
    const [debitDay, setDebitDay]       = useState(existing?.debitDay ?? 1);
    const [errors, setErrors]           = useState({});
    const [saving, setSaving]           = useState(false);

    const keepingExistingAccount = !!existing && accountNo.length === 0;

    function validate() {
        const e = {};
        if (!bankName) e.bankName = 'Please select a bank';
        if (!keepingExistingAccount && (!accountNo || accountNo.length < 6)) {
            e.accountNo = 'Enter a valid account number (min 6 digits)';
        }
        return e;
    }

    function handleSave() {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        setSaving(true);
        try {
            saveBankDetails(auth.customerId, {
                bankName,
                last4: keepingExistingAccount ? existing.last4 : accountNo.slice(-4),
                accountType,
                debitDay,
            });
            showToast('Bank account updated successfully.', 'success');
            setTimeout(() => navigate(-1), 600);
        } catch {
            setSaving(false);
            showToast('Could not save bank details. Please try again.', 'error');
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-[480px] md:max-w-2xl mx-auto pt-[80px] pb-[100px] px-6 flex flex-col gap-6">
                <div>
                    <h1 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 22, fontWeight: 700, color: '#1C1C1C' }}>
                        Debit order account
                    </h1>
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#8E8E93', marginTop: 4 }}>
                        This account is used for all your active debit orders. Changing it will apply to future debits.
                    </p>
                </div>

                {/* Current account display */}
                {existing && (
                    <div
                        className="flex items-center gap-3 px-4 py-3 rounded-[10px]"
                        style={{ background: '#F0F4FF', border: '1px solid #C7D9FF' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="2" y="6" width="16" height="12" rx="2" stroke="#1860BF" strokeWidth="1.5" />
                            <path d="M2 10h16" stroke="#1860BF" strokeWidth="1.5" />
                            <rect x="5" y="13" width="4" height="2" rx="1" fill="#1860BF" />
                        </svg>
                        <div>
                            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C' }}>
                                Current: {existing.bankName}
                            </p>
                            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#3C3C43' }}>
                                {existing.accountType} ••••{existing.last4} · {existing.debitDay}{existing.debitDay === 1 ? 'st' : 'th'} of month
                            </p>
                        </div>
                    </div>
                )}

                {!isLoggedIn && (
                    <div className="flex flex-col items-center gap-4 pt-8 text-center">
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#8E8E93' }}>
                            Sign in to manage your debit order account.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full h-[42px] rounded-full font-semibold text-white"
                            style={{ background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)', fontFamily: 'Roboto, sans-serif', fontSize: 17 }}
                        >
                            Sign in
                        </button>
                    </div>
                )}

                {isLoggedIn && (
                    <div className="flex flex-col gap-5">
                        {/* Bank */}
                        <div className="flex flex-col gap-1">
                            <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C' }}>Bank</label>
                            <select
                                value={bankName}
                                onChange={(e) => { setBankName(e.target.value); setErrors((p) => ({ ...p, bankName: '' })); }}
                                className="w-full h-[46px] rounded-[10px] px-3 border bg-white"
                                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: errors.bankName ? '#C51C13' : '#C7C7CC', outline: 'none' }}
                            >
                                <option value="">Select your bank</option>
                                {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                            </select>
                            {errors.bankName && <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#C51C13' }}>{errors.bankName}</p>}
                        </div>

                        {/* Account number */}
                        <div className="flex flex-col gap-1">
                            <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C' }}>
                                {existing ? 'New account number (optional)' : 'Account number'}
                            </label>
                            <input
                                type="tel"
                                inputMode="numeric"
                                maxLength={16}
                                value={accountNo}
                                onChange={(e) => { setAccountNo(e.target.value.replace(/\D/g, '')); setErrors((p) => ({ ...p, accountNo: '' })); }}
                                placeholder={existing ? `Keep current ••••${existing.last4} or enter a new number` : 'Enter account number'}
                                className="w-full h-[46px] rounded-[10px] px-3 border"
                                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: errors.accountNo ? '#C51C13' : '#C7C7CC', outline: 'none' }}
                            />
                            {errors.accountNo && <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#C51C13' }}>{errors.accountNo}</p>}
                            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#8E8E93' }}>Only the last 4 digits are stored.</p>
                        </div>

                        {/* Account type */}
                        <div className="flex flex-col gap-2">
                            <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C' }}>Account type</label>
                            <div className="flex gap-2">
                                {ACCOUNT_TYPES.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setAccountType(type)}
                                        className="flex-1 h-[36px] rounded-full border text-center"
                                        style={{
                                            fontFamily: 'Roboto, sans-serif', fontSize: 12,
                                            fontWeight: accountType === type ? 700 : 400,
                                            borderColor: accountType === type ? '#1860BF' : '#C7C7CC',
                                            background: accountType === type ? '#EFF4FF' : 'white',
                                            color: accountType === type ? '#1860BF' : '#3C3C43',
                                        }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Debit day */}
                        <div className="flex flex-col gap-2">
                            <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C' }}>Debit date</label>
                            <div className="flex gap-3">
                                {DEBIT_DAYS.map((day) => (
                                    <button
                                        key={day}
                                        onClick={() => setDebitDay(day)}
                                        className="w-[64px] h-[64px] rounded-[12px] flex flex-col items-center justify-center border"
                                        style={{
                                            borderColor: debitDay === day ? '#1860BF' : '#C7C7CC',
                                            background: debitDay === day ? '#EFF4FF' : 'white',
                                        }}
                                    >
                                        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 22, fontWeight: 700, color: debitDay === day ? '#1860BF' : '#1C1C1C' }}>{day}</span>
                                        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#8E8E93' }}>of month</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div
                            className="flex items-start gap-2 px-3 py-2 rounded-[8px]"
                            style={{ background: '#FFF8E6', border: '1px solid #FFD97A' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                                <circle cx="8" cy="8" r="8" fill="#F5A623" />
                                <rect x="7" y="4" width="2" height="5" rx="1" fill="white" />
                                <circle cx="8" cy="11.5" r="1" fill="white" />
                            </svg>
                            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#7A4F00' }}>
                                Changing your bank account does not affect already-processed debit orders. New debit date applies from the next cycle.
                            </p>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full h-[50px] rounded-[100px] font-semibold text-white"
                            style={{
                                background: saving ? '#A0AEC0' : 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)',
                                fontFamily: 'Roboto, sans-serif', fontSize: 17,
                            }}
                        >
                            {saving ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
