import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBankDetails, saveBankDetails } from '../services/bankingService';
import { upsertBankAccountByLast4 } from '../services/bankAccountsService';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import InfoBanner from '../components/InfoBanner.jsx';

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

    async function handleSave() {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        setSaving(true);
        const details = {
            bankName,
            last4: keepingExistingAccount ? existing.last4 : accountNo.slice(-4),
            accountType,
            debitDay,
        };
        try {
            saveBankDetails(auth.customerId, details);
            await upsertBankAccountByLast4(auth.customerId, details).catch(() => {});
            showToast('Bank account updated successfully.', 'success');
            setTimeout(() => navigate(-1), 600);
        } catch {
            setSaving(false);
            showToast('Could not save bank details. Please try again.', 'error');
        }
    }

    return (
        <div className="min-h-screen bg-[var(--surface-page)]">
            <Header />

            <main className="max-w-[480px] md:max-w-2xl mx-auto pt-[80px] pb-[100px] px-6 flex flex-col gap-6">
                <div>
                    <h1 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Debit order account
                    </h1>
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                        This account is used for all your active debit orders. Changing it will apply to future debits.
                    </p>
                </div>

                {/* Current account display */}
                {existing && (
                    <InfoBanner
                        variant="info"
                        title={`Current: ${existing.bankName}`}
                        icon={(
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <rect x="2" y="6" width="16" height="12" rx="2" stroke="var(--brand-100)" strokeWidth="1.5" />
                                <path d="M2 10h16" stroke="var(--brand-100)" strokeWidth="1.5" />
                                <rect x="5" y="13" width="4" height="2" rx="1" fill="var(--brand-100)" />
                            </svg>
                        )}
                    >
                        {existing.accountType} ••••{existing.last4} · {existing.debitDay}{existing.debitDay === 1 ? 'st' : 'th'} of month
                    </InfoBanner>
                )}

                {!isLoggedIn && (
                    <div className="flex flex-col items-center gap-4 pt-8 text-center">
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: 'var(--text-secondary)' }}>
                            Sign in to manage your debit order account.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full h-[42px] rounded-full font-semibold text-white"
                            style={{ background: 'var(--gradient-brand)', fontFamily: 'Roboto, sans-serif', fontSize: 17 }}
                        >
                            Sign in
                        </button>
                    </div>
                )}

                {isLoggedIn && (
                    <div className="flex flex-col gap-5">
                        {/* Bank */}
                        <div className="flex flex-col gap-1">
                            <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Bank</label>
                            <select
                                value={bankName}
                                onChange={(e) => { setBankName(e.target.value); setErrors((p) => ({ ...p, bankName: '' })); }}
                                className="w-full h-[46px] rounded-[10px] px-3 border bg-[var(--surface-page)]"
                                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: errors.bankName ? '#C51C13' : 'var(--neutral-400)', outline: 'none' }}
                            >
                                <option value="">Select your bank</option>
                                {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                            </select>
                            {errors.bankName && <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#C51C13' }}>{errors.bankName}</p>}
                        </div>

                        {/* Account number */}
                        <div className="flex flex-col gap-1">
                            <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
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
                                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: errors.accountNo ? '#C51C13' : 'var(--neutral-400)', outline: 'none' }}
                            />
                            {errors.accountNo && <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#C51C13' }}>{errors.accountNo}</p>}
                            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'var(--text-secondary)' }}>Only the last 4 digits are stored.</p>
                        </div>

                        {/* Account type */}
                        <div className="flex flex-col gap-2">
                            <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Account type</label>
                            <div className="flex gap-2">
                                {ACCOUNT_TYPES.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setAccountType(type)}
                                        className="flex-1 h-[36px] rounded-full border text-center"
                                        style={{
                                            fontFamily: 'Roboto, sans-serif', fontSize: 12,
                                            fontWeight: accountType === type ? 700 : 400,
                                            borderColor: accountType === type ? 'var(--brand-100)' : 'var(--neutral-400)',
                                            background: accountType === type ? '#EFF4FF' : 'var(--neutral-100)',
                                            color: accountType === type ? 'var(--brand-100)' : 'var(--neutral-700)',
                                        }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Debit day */}
                        <div className="flex flex-col gap-2">
                            <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Debit date</label>
                            <div className="flex gap-3">
                                {DEBIT_DAYS.map((day) => (
                                    <button
                                        key={day}
                                        onClick={() => setDebitDay(day)}
                                        className="w-[64px] h-[64px] rounded-[12px] flex flex-col items-center justify-center border"
                                        style={{
                                            borderColor: debitDay === day ? 'var(--brand-100)' : 'var(--neutral-400)',
                                            background: debitDay === day ? '#EFF4FF' : 'var(--neutral-100)',
                                        }}
                                    >
                                        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 22, fontWeight: 700, color: debitDay === day ? 'var(--brand-100)' : 'var(--text-primary)' }}>{day}</span>
                                        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: 'var(--text-secondary)' }}>of month</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <InfoBanner variant="warning">
                            Changing your bank account does not affect already-processed debit orders. New debit date applies from the next cycle.
                        </InfoBanner>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full h-[50px] rounded-[100px] font-semibold text-white"
                            style={{
                                background: saving ? '#A0AEC0' : 'var(--gradient-brand)',
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
