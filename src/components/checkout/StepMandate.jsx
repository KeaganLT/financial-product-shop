import { useState } from 'react';

const MANDATE_POINTS = [
    "This instruction may be cancelled by me by giving 30 days' written notice to FinShop.",
    'I understand that amounts debited may not always be the same if the premium changes, and I will be notified in advance.',
    'I confirm that I am the account holder and have the authority to sign this mandate.',
];

export default function StepMandate({ product, bankDetails, onNext }) {
    const [signature, setSignature] = useState('');
    const [agreed, setAgreed]       = useState(false);
    const [error, setError]         = useState('');

    const today = new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' });
    const daySuffix = bankDetails.debitDay === 1 ? 'st' : 'th';

    function handleConfirm() {
        if (!agreed) { setError('Please accept the debit order mandate.'); return; }
        if (!signature.trim()) { setError('Please type your full name as a signature.'); return; }
        setError('');
        onNext({ signature: signature.trim() });
    }

    return (
        <div className="flex flex-col gap-5 px-6 pt-4 pb-8">
            <div>
                <h2 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Debit order mandate
                </h2>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Please read and accept the terms below.
                </p>
            </div>

            <div className="rounded-[12px] p-4 flex flex-col gap-4" style={{ border: '1.5px solid #1860BF', background: '#F8FAFF' }}>
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid #D0DDEE' }}>
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #1860BF 0%, #1AB0DE 100%)' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 2L2 7h16L10 2z" fill="white" />
                            <rect x="3" y="8" width="2" height="7" fill="white" />
                            <rect x="9" y="8" width="2" height="7" fill="white" />
                            <rect x="15" y="8" width="2" height="7" fill="white" />
                            <rect x="2" y="16" width="16" height="2" fill="white" />
                        </svg>
                    </div>
                    <div>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>FinShop Bank</p>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'var(--text-secondary)' }}>FSP Licence No. 12345 | Authorised Financial Services Provider</p>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Debit Order Mandate
                    </p>
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: 'var(--neutral-700)', lineHeight: '18px' }}>
                        I, the account holder, hereby authorise <strong>FinShop (Pty) Ltd</strong> to debit my account at <strong>{bankDetails.bankName}</strong> (ending <strong>••••{bankDetails.last4}</strong>) with the amount of <strong>R{Number(product.price).toFixed(2)}</strong> on the <strong>{bankDetails.debitDay}{daySuffix} of each month</strong>, commencing on the next available debit date.
                    </p>
                </div>

                <ul className="flex flex-col gap-2">
                    {MANDATE_POINTS.map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <span
                                className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white mt-0.5"
                                style={{ background: '#1860BF', fontSize: 9, fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}
                            >
                                {i + 1}
                            </span>
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: 'var(--neutral-700)', lineHeight: '17px' }}>{point}</span>
                        </li>
                    ))}
                </ul>

                <div style={{ height: 1, background: '#D0DDEE' }} />

                <div className="flex flex-col gap-1">
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'var(--text-secondary)' }}>Date: {today}</p>
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'var(--text-secondary)' }}>Reference: {product.name}</p>
                </div>
            </div>

            <button
                onClick={() => { setAgreed((v) => !v); setError(''); }}
                className="flex items-start gap-3"
            >
                <div
                    className="w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border-2"
                    style={{ borderColor: agreed ? '#1860BF' : 'var(--neutral-400)', background: agreed ? '#1860BF' : 'var(--neutral-100)' }}
                >
                    {agreed && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: 'var(--neutral-700)', lineHeight: '19px', textAlign: 'left' }}>
                    I have read and accept the debit order mandate above and authorise the debit to my account.
                </span>
            </button>

            <div className="flex flex-col gap-1">
                <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Type your full name as signature
                </label>
                <input
                    type="text"
                    value={signature}
                    onChange={(e) => { setSignature(e.target.value); setError(''); }}
                    placeholder="e.g. John Smith"
                    className="w-full h-[46px] rounded-[10px] px-3 border"
                    style={{
                        fontFamily: '"Brush Script MT", cursive, Roboto, sans-serif',
                        fontSize: 18,
                        borderColor: error && !signature ? '#C51C13' : 'var(--neutral-400)',
                        color: '#1860BF',
                    }}
                />
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'var(--text-secondary)' }}>
                    By typing your name, you are digitally signing this mandate.
                </p>
            </div>

            {error && <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#C51C13' }}>{error}</p>}

            <button
                onClick={handleConfirm}
                className="w-full h-[50px] rounded-[100px] font-semibold text-white"
                style={{ background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)', fontFamily: 'Roboto, sans-serif', fontSize: 17 }}
            >
                Accept & Continue
            </button>
        </div>
    );
}
