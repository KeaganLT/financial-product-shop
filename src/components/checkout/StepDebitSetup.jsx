import { useState } from 'react';
import { BANKS, ACCOUNT_TYPES, DEBIT_DAYS } from '../../constants/checkout.js';

export default function StepDebitSetup({ existingBankDetails, onNext }) {
    const [bankName, setBankName]       = useState(existingBankDetails?.bankName ?? '');
    const [accountNo, setAccountNo]     = useState('');
    const [accountType, setAccountType] = useState(existingBankDetails?.accountType ?? ACCOUNT_TYPES[0]);
    const [debitDay, setDebitDay]       = useState(existingBankDetails?.debitDay ?? 1);
    const [errors, setErrors]           = useState({});

    function validate() {
        const e = {};
        if (!bankName) e.bankName = 'Please select a bank';
        if (!accountNo || accountNo.length < 6) e.accountNo = 'Enter a valid account number';
        return e;
    }

    function handleContinue() {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        onNext({ bankName, last4: accountNo.slice(-4), accountType, debitDay });
    }

    return (
        <div className="flex flex-col gap-5 px-6 pt-4 pb-8">
            <div>
                <h2 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 22, fontWeight: 700, color: '#1C1C1C' }}>
                    Set up your debit order
                </h2>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#8E8E93', marginTop: 4 }}>
                    Your monthly premium will be debited from this account.
                </p>
            </div>

            <div className="flex flex-col gap-1">
                <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C' }}>Bank</label>
                <select
                    value={bankName}
                    onChange={(e) => { setBankName(e.target.value); setErrors((p) => ({ ...p, bankName: '' })); }}
                    className="w-full h-[46px] rounded-[10px] px-3 border bg-white"
                    style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: errors.bankName ? '#C51C13' : '#C7C7CC' }}
                >
                    <option value="">Select your bank</option>
                    {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                {errors.bankName && <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#C51C13' }}>{errors.bankName}</p>}
            </div>

            <div className="flex flex-col gap-1">
                <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C' }}>Account number</label>
                <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={16}
                    value={accountNo}
                    onChange={(e) => { setAccountNo(e.target.value.replace(/\D/g, '')); setErrors((p) => ({ ...p, accountNo: '' })); }}
                    placeholder="e.g. 1234567890"
                    className="w-full h-[46px] rounded-[10px] px-3 border"
                    style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: errors.accountNo ? '#C51C13' : '#C7C7CC' }}
                />
                {errors.accountNo && <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#C51C13' }}>{errors.accountNo}</p>}
            </div>

            <div className="flex flex-col gap-1">
                <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C' }}>Account type</label>
                <div className="flex gap-2">
                    {ACCOUNT_TYPES.map((type) => (
                        <button
                            key={type}
                            onClick={() => setAccountType(type)}
                            className="flex-1 h-[36px] rounded-full border text-center"
                            style={{
                                fontFamily: 'Roboto, sans-serif',
                                fontSize: 12,
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

            <div className="flex flex-col gap-1">
                <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C' }}>Debit date</label>
                <div className="flex gap-3">
                    {DEBIT_DAYS.map((day) => (
                        <button
                            key={day}
                            onClick={() => setDebitDay(day)}
                            className="w-[64px] h-[64px] rounded-[12px] flex flex-col items-center justify-center border"
                            style={{ borderColor: debitDay === day ? '#1860BF' : '#C7C7CC', background: debitDay === day ? '#EFF4FF' : 'white' }}
                        >
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 22, fontWeight: 700, color: debitDay === day ? '#1860BF' : '#1C1C1C' }}>{day}</span>
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#8E8E93' }}>of month</span>
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleContinue}
                className="w-full h-[50px] rounded-[100px] font-semibold text-white mt-2"
                style={{ background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)', fontFamily: 'Roboto, sans-serif', fontSize: 17 }}
            >
                Continue
            </button>
        </div>
    );
}
