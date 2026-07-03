import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProductById } from '../services/productService';
import { takeUpProducts } from '../services/subscriptionService';
import { getBankDetails, saveBankDetails } from '../services/bankingService';
import { useToast } from '../context/ToastContext';
import { getProductPlaceholder } from '../assets/placeholders/index.js';

const BANKS = [
    'ABSA Bank',
    'Capitec Bank',
    'FNB (First National Bank)',
    'Nedbank',
    'Standard Bank',
    'African Bank',
    'Investec',
    'TymeBank',
];

const ACCOUNT_TYPES = ['Cheque / Current', 'Savings', 'Transmission'];
const DEBIT_DAYS = [1, 15, 25];

function StepIndicator({ current, total }) {
    return (
        <div className="flex items-center gap-2 px-6 pb-4">
            {Array.from({ length: total }, (_, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                    <div
                        className="h-1.5 w-full rounded-full transition-all"
                        style={{ background: i < current ? '#1860BF' : '#E5E5EA' }}
                    />
                </div>
            ))}
        </div>
    );
}

// ─── Step 1: Product review ────────────────────────────────────────────────────
function StepProductReview({ product, onNext }) {
    const isInsurance = product?.name?.toLowerCase().includes('insurance');
    const isInvestment = !isInsurance && (
        product?.name?.toLowerCase().includes('investment') ||
        product?.name?.toLowerCase().includes('annuity') ||
        product?.name?.toLowerCase().includes('fund')
    );

    const coverPoints = isInsurance
        ? ['Accidental damage', 'Theft & loss', 'International coverage', 'No excess on first claim']
        : isInvestment
            ? ['Competitive interest rates', 'Flexible terms', 'Tax-efficient returns', 'Monthly interest payments']
            : ['Full coverage', 'Easy claims process', 'Dedicated support'];

    return (
        <div className="flex flex-col gap-6 px-6 pt-4 pb-8">
            <div>
                <h2 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 22, fontWeight: 700, color: '#1C1C1C' }}>
                    Review your product
                </h2>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#8E8E93', marginTop: 4 }}>
                    Here's what you're signing up for.
                </p>
            </div>

            {/* Product card */}
            <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: '#E5E5EA' }}>
                <div className="w-full overflow-hidden bg-[#D9D9D9]" style={{ height: 160 }}>
                    <img
                        src={product.imageUrl || getProductPlaceholder(product.name)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="px-4 py-4 flex flex-col gap-3">
                    <div>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 18, fontWeight: 700, color: '#1C1C1C' }}>
                            {product.name}
                        </p>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#8E8E93', marginTop: 2 }}>
                            {product.description?.slice(0, 120)}{product.description?.length > 120 ? '…' : ''}
                        </p>
                    </div>

                    <div className="flex items-baseline gap-1">
                        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 24, fontWeight: 700, color: '#1860BF' }}>
                            R{Number(product.price).toFixed(2)}
                        </span>
                        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#8E8E93' }}>/ month</span>
                    </div>

                    <div style={{ height: 1, background: '#E5E5EA' }} />

                    <div>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C', marginBottom: 8 }}>
                            What's covered
                        </p>
                        <ul className="flex flex-col gap-2">
                            {coverPoints.map((point) => (
                                <li key={point} className="flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="8" r="8" fill="#E6F9ED" />
                                        <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#168C34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#3C3C43' }}>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <button
                onClick={onNext}
                className="w-full h-[50px] rounded-[100px] font-semibold text-white"
                style={{ background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)', fontFamily: 'Roboto, sans-serif', fontSize: 17 }}
            >
                Continue
            </button>
        </div>
    );
}

// ─── Step 2: Debit order setup ─────────────────────────────────────────────────
function StepDebitSetup({ existingBankDetails, onNext }) {
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
        onNext({
            bankName,
            last4: accountNo.slice(-4),
            accountType,
            debitDay,
        });
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

            {/* Bank selector */}
            <div className="flex flex-col gap-1">
                <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C' }}>
                    Bank
                </label>
                <select
                    value={bankName}
                    onChange={(e) => { setBankName(e.target.value); setErrors((prev) => ({ ...prev, bankName: '' })); }}
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
                    Account number
                </label>
                <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={16}
                    value={accountNo}
                    onChange={(e) => { setAccountNo(e.target.value.replace(/\D/g, '')); setErrors((prev) => ({ ...prev, accountNo: '' })); }}
                    placeholder="e.g. 1234567890"
                    className="w-full h-[46px] rounded-[10px] px-3 border"
                    style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: errors.accountNo ? '#C51C13' : '#C7C7CC', outline: 'none' }}
                />
                {errors.accountNo && <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#C51C13' }}>{errors.accountNo}</p>}
            </div>

            {/* Account type */}
            <div className="flex flex-col gap-1">
                <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C' }}>
                    Account type
                </label>
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

            {/* Debit day */}
            <div className="flex flex-col gap-1">
                <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C' }}>
                    Debit date
                </label>
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

// ─── Step 3: Debit order mandate / signature ───────────────────────────────────
function StepMandate({ product, bankDetails, onNext }) {
    const [signature, setSignature] = useState('');
    const [agreed, setAgreed]       = useState(false);
    const [error, setError]         = useState('');

    const today = new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' });

    function handleConfirm() {
        if (!agreed) { setError('Please accept the debit order mandate.'); return; }
        if (!signature.trim()) { setError('Please type your full name as a signature.'); return; }
        setError('');
        onNext({ signature: signature.trim() });
    }

    return (
        <div className="flex flex-col gap-5 px-6 pt-4 pb-8">
            <div>
                <h2 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 22, fontWeight: 700, color: '#1C1C1C' }}>
                    Debit order mandate
                </h2>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#8E8E93', marginTop: 4 }}>
                    Please read and accept the terms below.
                </p>
            </div>

            {/* Fake bank mandate card */}
            <div
                className="rounded-[12px] p-4 flex flex-col gap-4"
                style={{ border: '1.5px solid #1860BF', background: '#F8FAFF' }}
            >
                {/* Bank header */}
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
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1C' }}>FinShop Bank</p>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#8E8E93' }}>FSP Licence No. 12345 | Authorised Financial Services Provider</p>
                    </div>
                </div>

                {/* Mandate text */}
                <div className="flex flex-col gap-2">
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, color: '#1C1C1C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Debit Order Mandate
                    </p>
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#3C3C43', lineHeight: '18px' }}>
                        I, the account holder, hereby authorise <strong>FinShop (Pty) Ltd</strong> to debit my account at <strong>{bankDetails.bankName}</strong> (ending <strong>••••{bankDetails.last4}</strong>) with the amount of <strong>R{Number(product.price).toFixed(2)}</strong> on the <strong>{bankDetails.debitDay}{bankDetails.debitDay === 1 ? 'st' : bankDetails.debitDay === 15 ? 'th' : 'th'} of each month</strong>, commencing on the next available debit date.
                    </p>
                </div>

                <ul className="flex flex-col gap-2">
                    {[
                        'This instruction may be cancelled by me by giving 30 days\' written notice to FinShop.',
                        'I understand that amounts debited may not always be the same if the premium changes, and I will be notified in advance.',
                        'I confirm that I am the account holder and have the authority to sign this mandate.',
                    ].map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <span
                                className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white mt-0.5"
                                style={{ background: '#1860BF', fontSize: 9, fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}
                            >
                                {i + 1}
                            </span>
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#3C3C43', lineHeight: '17px' }}>{point}</span>
                        </li>
                    ))}
                </ul>

                <div style={{ height: 1, background: '#D0DDEE' }} />

                <div className="flex flex-col gap-1">
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#8E8E93' }}>Date: {today}</p>
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#8E8E93' }}>Reference: {product.name}</p>
                </div>
            </div>

            {/* Agree checkbox */}
            <button
                onClick={() => { setAgreed((v) => !v); setError(''); }}
                className="flex items-start gap-3"
            >
                <div
                    className="w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border-2"
                    style={{ borderColor: agreed ? '#1860BF' : '#C7C7CC', background: agreed ? '#1860BF' : 'white' }}
                >
                    {agreed && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#3C3C43', lineHeight: '19px', textAlign: 'left' }}>
                    I have read and accept the debit order mandate above and authorise the debit to my account.
                </span>
            </button>

            {/* Typed signature */}
            <div className="flex flex-col gap-1">
                <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C' }}>
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
                        borderColor: error && !signature ? '#C51C13' : '#C7C7CC',
                        outline: 'none',
                        color: '#1860BF',
                    }}
                />
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#8E8E93' }}>
                    By typing your name, you are digitally signing this mandate.
                </p>
            </div>

            {error && (
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#C51C13' }}>{error}</p>
            )}

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

// ─── Step 4: Confirm & activate ────────────────────────────────────────────────
function StepConfirm({ product, bankDetails, submitting, error, onConfirm }) {
    const nextDebitDate = (() => {
        const now = new Date();
        const target = new Date(now.getFullYear(), now.getMonth(), bankDetails.debitDay);
        if (target <= now) target.setMonth(target.getMonth() + 1);
        return target.toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' });
    })();

    return (
        <div className="flex flex-col gap-6 px-6 pt-4 pb-8">
            <div>
                <h2 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 22, fontWeight: 700, color: '#1C1C1C' }}>
                    Confirm & activate
                </h2>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#8E8E93', marginTop: 4 }}>
                    Review your details before activating.
                </p>
            </div>

            {/* Summary card */}
            <div className="rounded-[12px] border flex flex-col divide-y" style={{ borderColor: '#E5E5EA' }}>
                {[
                    { label: 'Product', value: product.name },
                    { label: 'Monthly premium', value: `R${Number(product.price).toFixed(2)}` },
                    { label: 'Bank', value: bankDetails.bankName },
                    { label: 'Account', value: `${bankDetails.accountType} ••••${bankDetails.last4}` },
                    { label: 'First debit date', value: nextDebitDate },
                ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-3">
                        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#8E8E93' }}>{label}</span>
                        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
                    </div>
                ))}
            </div>

            {error && (
                <div className="px-4 py-3 rounded-[10px]" style={{ background: '#FFF5F5', border: '1px solid #FFB3B3' }}>
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#C51C13' }}>{error}</p>
                </div>
            )}

            <button
                onClick={onConfirm}
                disabled={submitting}
                className="w-full h-[50px] rounded-[100px] font-semibold text-white"
                style={{
                    background: submitting ? '#A0AEC0' : 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: 17,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                }}
            >
                {submitting ? 'Activating…' : 'Activate now'}
            </button>
        </div>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function SubscribeCheckoutPage() {
    const { productId } = useParams();
    const navigate      = useNavigate();
    const { auth, isLoggedIn } = useAuth();

    const { showToast } = useToast();
    const [product, setProduct]           = useState(null);
    const [loading, setLoading]           = useState(true);
    const [step, setStep]                 = useState(1); // 1–4
    const [bankDetails, setBankDetails]   = useState(null);
    const [submitting, setSubmitting]     = useState(false);
    const [submitError, setSubmitError]   = useState('');

    useEffect(() => {
        if (!isLoggedIn) { navigate('/login'); return; }
        getProductById(productId)
            .then(setProduct)
            .catch(() => navigate('/products'))
            .finally(() => setLoading(false));
    }, [productId, isLoggedIn]);

    useEffect(() => {
        if (auth?.customerId) {
            const saved = getBankDetails(auth.customerId);
            if (saved) setBankDetails(saved);
        }
    }, [auth?.customerId]);

    async function handleActivate() {
        setSubmitting(true);
        setSubmitError('');
        try {
            saveBankDetails(auth.customerId, bankDetails);
            const result = await takeUpProducts([Number(productId)], auth.token);
            if (result.success) {
                showToast(`${product.name} activated successfully!`, 'success');
                navigate('/checkout/result?type=subscription', { state: { product, bankDetails } });
            } else {
                setSubmitError('Activation failed. Please check your eligibility and try again.');
            }
        } catch (err) {
            setSubmitError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    const TOTAL_STEPS = 4;
    const stepLabels = ['Review', 'Bank details', 'Mandate', 'Confirm'];

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#1860BF] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div
                className="fixed top-0 left-0 right-0 bg-white z-50"
                style={{ borderBottom: '1px solid #E5E5EA' }}
            >
                <div className="max-w-[480px] md:max-w-2xl mx-auto px-4 flex items-center" style={{ height: 64 }}>
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : navigate(`/products/${productId}`)}
                        className="w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#49454F" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 17, fontWeight: 600, color: '#1C1C1C' }}>
                            {stepLabels[step - 1]}
                        </p>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#8E8E93' }}>
                            Step {step} of {TOTAL_STEPS}
                        </p>
                    </div>
                </div>
                <div className="max-w-[480px] md:max-w-2xl mx-auto">
                    <StepIndicator current={step} total={TOTAL_STEPS} />
                </div>
            </div>

            {/* Content */}
            <div className="pt-[104px] max-w-[480px] md:max-w-2xl mx-auto">
                {step === 1 && (
                    <StepProductReview product={product} onNext={() => setStep(2)} />
                )}
                {step === 2 && (
                    <StepDebitSetup
                        existingBankDetails={bankDetails}
                        onNext={(details) => { setBankDetails(details); setStep(3); }}
                    />
                )}
                {step === 3 && bankDetails && (
                    <StepMandate
                        product={product}
                        bankDetails={bankDetails}
                        onNext={() => setStep(4)}
                    />
                )}
                {step === 4 && bankDetails && (
                    <StepConfirm
                        product={product}
                        bankDetails={bankDetails}
                        submitting={submitting}
                        error={submitError}
                        onConfirm={handleActivate}
                    />
                )}
            </div>
        </div>
    );
}
