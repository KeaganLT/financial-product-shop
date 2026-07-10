import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { takeUpProducts } from '../services/subscriptionService';

// ── Card brand logos (inline SVG approximations) ────────────────────────────

const VisaLogo = () => (
    <svg width="42" height="14" viewBox="0 0 42 14" fill="none">
        <text x="0" y="12" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="14" fill="#1A1F71">VISA</text>
    </svg>
);

const MastercardLogo = () => (
    <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
        <circle cx="12" cy="10" r="10" fill="#EB001B" />
        <circle cx="20" cy="10" r="10" fill="#F79E1B" />
        <path d="M16 4.8a10 10 0 0 1 0 10.4A10 10 0 0 1 16 4.8z" fill="#FF5F00" />
    </svg>
);

// ── Shared header ─────────────────────────────────────────────────────────────

function PageHeader({ title, onBack }) {
    return (
        <div className="flex items-center px-1 bg-[var(--surface-page)] md:hidden" style={{ height: 64, borderBottom: '1px solid var(--neutral-300)' }}>
            <div className="max-w-[411px] mx-auto w-full flex items-center gap-1">
                <button onClick={onBack} className="w-12 h-12 flex items-center justify-center" aria-label="Go back">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="var(--neutral-700)" />
                    </svg>
                </button>
                <h1 className="flex-1" style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 400, lineHeight: '28px', letterSpacing: '0.35px', color: 'var(--text-primary)' }}>
                    {title}
                </h1>
            </div>
        </div>
    );
}

// ── Credit card tile (used in type-select and saved-cards views) ──────────────

function CreditCardTile({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between px-4 py-3 rounded-[8px]"
            style={{ background: 'var(--surface-field)' }}
        >
            <div className="flex flex-col items-start gap-[9px]">
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, fontWeight: 600, lineHeight: '20px', color: 'var(--text-primary)' }}>
                    Credit card
                </span>
                <div className="flex items-center gap-4">
                    <VisaLogo />
                    <MastercardLogo />
                    <svg width="55" height="18" viewBox="0 0 55 18" fill="none">
                        <rect width="55" height="18" rx="2" fill="#2E77BC" />
                        <text x="5" y="13" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="8" fill="white">AMERICAN EXPRESS</text>
                    </svg>
                </div>
            </div>
            <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                <path d="M1 1l10 9-10 9" stroke="var(--brand-100)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    );
}

// ── Shared footer (total + pay button) ────────────────────────────────────────

function CheckoutFooter({ monthlyTotal, onceOffTotal = 0, onPay, loading, disabled = false, disabledHint = '' }) {
    const isBlocked = disabled || loading;
    return (
        <>
            {/* Mobile: fixed bottom bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-[var(--surface-page)] md:hidden" style={{ borderTop: '1px solid var(--neutral-300)' }}>
                <div className="max-w-[411px] mx-auto px-7 pt-4 pb-6 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <span className="font-semibold text-[var(--text-primary)]" style={{ fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}>Total</span>
                        <div className="flex flex-col gap-[5px] items-end">
                            <div className="flex items-center gap-5">
                                <span className="text-[var(--text-secondary)]" style={{ fontSize: 13, lineHeight: '18px', letterSpacing: '0.41px', fontFamily: 'Roboto, sans-serif' }}>Once off</span>
                                <span className="font-semibold text-[var(--text-primary)]" style={{ fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}>R {onceOffTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="text-[var(--text-secondary)]" style={{ fontSize: 13, lineHeight: '18px', letterSpacing: '0.41px', fontFamily: 'Roboto, sans-serif' }}>Monthly</span>
                                <span className="font-semibold text-[var(--text-primary)]" style={{ fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}>R {monthlyTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onPay} disabled={isBlocked} className="w-full h-[42px] rounded-[100px] font-semibold text-white disabled:opacity-60" style={{ background: disabled ? '#E5E5EA' : 'var(--gradient-brand)', color: disabled ? '#AEAEB2' : '#fff', fontSize: 17, letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}>
                        {loading ? 'Processing…' : `Pay now (R${monthlyTotal.toFixed(2)})`}
                    </button>
                    {disabled && disabledHint && (
                        <p className="text-center" style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: 'var(--text-secondary)' }}>{disabledHint}</p>
                    )}
                </div>
            </div>
            {/* Desktop: inline pay button */}
            <div className="hidden md:block max-w-3xl mx-auto w-full px-6 pb-12 pt-4">
                <div className="h-px bg-[var(--neutral-300)] mb-4" />
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-[var(--text-secondary)]" style={{ fontSize: 13, fontFamily: 'Roboto, sans-serif' }}>Monthly total</span>
                        <span className="font-bold text-[var(--text-primary)]" style={{ fontSize: 22, fontFamily: 'Roboto, sans-serif' }}>R {monthlyTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <button onClick={onPay} disabled={isBlocked} className="h-[42px] px-8 rounded-[100px] font-semibold disabled:opacity-60" style={{ background: disabled ? '#E5E5EA' : 'var(--gradient-brand)', color: disabled ? '#AEAEB2' : '#fff', fontSize: 17, letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}>
                            {loading ? 'Processing…' : `Pay now (R${monthlyTotal.toFixed(2)})`}
                        </button>
                        {disabled && disabledHint && (
                            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: 'var(--text-secondary)' }}>{disabledHint}</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// ── Text field component ──────────────────────────────────────────────────────

function CardField({ label, value, onChange, placeholder, type = 'text', half = false }) {
    const [focused, setFocused] = useState(false);
    const hasValue = value.length > 0;
    return (
        <div className={`relative ${half ? 'flex-1' : 'w-full'}`} style={{ height: 56 }}>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={!hasValue && !focused ? '' : placeholder}
                className="w-full h-full px-4 pt-4 pb-1 outline-none rounded-[4px] text-[var(--text-primary)]"
                style={{
                    border: `${focused ? 3 : 1}px solid ${focused ? 'var(--brand-200)' : 'var(--neutral-400)'}`,
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: 16,
                    letterSpacing: '0.5px',
                    background: 'var(--neutral-100)',
                }}
            />
            <span
                className="absolute pointer-events-none transition-all"
                style={{
                    left: focused || hasValue ? 12 : 16,
                    top: focused || hasValue ? -8 : 16,
                    fontSize: focused || hasValue ? 12 : 16,
                    lineHeight: focused || hasValue ? '16px' : '24px',
                    color: focused ? 'var(--brand-200)' : 'var(--text-secondary)',
                    background: focused || hasValue ? 'var(--neutral-100)' : 'transparent',
                    padding: focused || hasValue ? '0 4px' : '0',
                    fontFamily: 'Roboto, sans-serif',
                }}
            >
                {label}
            </span>
        </div>
    );
}

// ── Order review view ─────────────────────────────────────────────────────────

function StatusBadge({ fulfilmentType }) {
    const isImmediate = (fulfilmentType || '').toLowerCase().includes('immediate');
    return (
        <span
            style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 100,
                fontSize: 11,
                fontFamily: 'Roboto, sans-serif',
                lineHeight: '16px',
                fontWeight: 500,
                background: isImmediate ? '#E6F9ED' : '#FFF4E5',
                color: isImmediate ? '#1A7A3C' : '#995900',
            }}
        >
            {isImmediate ? 'Active: Immediate' : 'Active: Pending signed contract'}
        </span>
    );
}

import { getProductPlaceholder } from '../assets/placeholders/index.js';

function OrderReviewView({ items, monthlyTotal, onceOffTotal, savedCard, onChangeMethod, onPay, loading, error }) {
    return (
        <>
            <main className="flex-1 max-w-[411px] md:max-w-3xl mx-auto w-full px-6 pt-7 pb-40 md:pb-8 flex flex-col gap-6">
                {/* Items */}
                <div className="flex flex-col gap-4">
                    {items.map((product) => (
                        <div key={product.id} className="flex items-start gap-4">
                            <div className="flex-shrink-0 rounded-[8px] overflow-hidden bg-[var(--neutral-300)]" style={{ width: 72, height: 62 }}>
                                <img src={product.imageUrl || getProductPlaceholder(product.name)} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, fontWeight: 600, lineHeight: '20px', color: 'var(--text-primary)' }}>{product.name}</p>
                                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, lineHeight: '13px', letterSpacing: '0.41px', color: 'var(--text-secondary)' }}>
                                    from R{Number(product.price).toFixed(0)} p/m
                                </p>
                                <StatusBadge fulfilmentType={product.fulfilmentType} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-[var(--neutral-300)]" />

                {/* Payment method */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                            <rect x="0.5" y="0.5" width="19" height="13" rx="1.5" stroke="var(--brand-100)" />
                            <rect x="0" y="3" width="20" height="3" fill="var(--brand-100)" />
                            <rect x="2" y="8" width="5" height="2" rx="0.5" fill="var(--brand-100)" />
                        </svg>
                        <span className="font-semibold text-[var(--text-primary)]" style={{ fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}>
                            Payment method
                        </span>
                    </div>
                    {savedCard ? (
                        <div className="flex items-center gap-3 py-1">
                            <div className="w-4 h-4 rounded-full border-2 border-[var(--brand-100)] flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-[var(--brand-100)]" />
                            </div>
                            <div className="flex-1">
                                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: 'var(--text-primary)' }}>Visa</span>
                                <span className="text-[var(--text-secondary)] ml-2" style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>••••••••{savedCard.last4}</span>
                            </div>
                            <VisaLogo />
                            <button
                                onClick={onChangeMethod}
                                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: 'var(--brand-100)', marginLeft: 8 }}
                            >
                                Change
                            </button>
                        </div>
                    ) : (
                        <button onClick={onChangeMethod} className="flex items-center gap-[9px] text-left">
                            <span style={{ fontSize: 18, color: 'var(--brand-200)' }}>+</span>
                            <span style={{ fontSize: 15, lineHeight: '20px', fontFamily: 'Roboto, sans-serif', color: 'var(--brand-200)' }}>Add payment method</span>
                        </button>
                    )}
                </div>

                {error && (
                    <p className="text-red-500 text-sm text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>{error}</p>
                )}
            </main>
            <CheckoutFooter
                monthlyTotal={monthlyTotal}
                onceOffTotal={onceOffTotal}
                onPay={onPay}
                loading={loading}
                disabled={!savedCard}
                disabledHint="Add a payment method to continue"
            />
        </>
    );
}

// ── Views ─────────────────────────────────────────────────────────────────────

function MainView({ monthlyTotal, onceOffTotal, onAddMethod, onPay, loading, error, savedCard }) {
    return (
        <>
            <main className="flex-1 max-w-[411px] md:max-w-3xl mx-auto w-full px-6 pt-7 pb-40 md:pb-8">
                <div className="flex flex-col gap-4">
                    {/* Payment method heading */}
                    <div className="flex items-center gap-3">
                        <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                            <rect x="0.5" y="0.5" width="19" height="13" rx="1.5" stroke="var(--brand-100)" />
                            <rect x="0" y="3" width="20" height="3" fill="var(--brand-100)" />
                            <rect x="2" y="8" width="5" height="2" rx="0.5" fill="var(--brand-100)" />
                        </svg>
                        <span className="font-semibold text-[var(--text-primary)]" style={{ fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}>
                            Payment method
                        </span>
                    </div>

                    {/* Saved card (shown after one has been added) */}
                    {savedCard && (
                        <div className="flex items-center gap-3 py-2">
                            <div className="w-4 h-4 rounded-full border-2 border-[var(--brand-100)] flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-[var(--brand-100)]" />
                            </div>
                            <div className="flex-1">
                                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: 'var(--text-primary)' }}>Visa</span>
                                <span className="text-[var(--text-secondary)] ml-2" style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>••••••••{savedCard.last4}</span>
                            </div>
                            <VisaLogo />
                        </div>
                    )}

                    {/* Add payment method */}
                    <div className="flex flex-col gap-3">
                        {savedCard && (
                            <span className="font-semibold text-[var(--text-primary)]" style={{ fontSize: 15, fontFamily: 'Roboto, sans-serif' }}>Add payment method</span>
                        )}
                        {!savedCard && (
                            <button onClick={onAddMethod} className="flex items-center gap-[9px] text-left">
                                <span style={{ fontSize: 18, color: 'var(--brand-200)' }}>+</span>
                                <span style={{ fontSize: 15, lineHeight: '20px', letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif', color: 'var(--brand-200)' }}>
                                    Add payment method
                                </span>
                            </button>
                        )}
                        {savedCard && <CreditCardTile onClick={onAddMethod} />}
                    </div>
                </div>

                {error && (
                    <p className="mt-6 text-red-500 text-sm text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>{error}</p>
                )}
            </main>
            <CheckoutFooter
                monthlyTotal={monthlyTotal}
                onceOffTotal={onceOffTotal}
                onPay={onPay}
                loading={loading}
                disabled={!savedCard}
                disabledHint="Add a payment method to continue"
            />
        </>
    );
}

function TypeSelectView({ onSelectCard }) {
    return (
        <main className="flex-1 max-w-[411px] md:max-w-3xl mx-auto w-full px-6 pt-7 pb-10">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                        <rect x="0.5" y="0.5" width="19" height="13" rx="1.5" stroke="var(--brand-100)" />
                        <rect x="0" y="3" width="20" height="3" fill="var(--brand-100)" />
                        <rect x="2" y="8" width="5" height="2" rx="0.5" fill="var(--brand-100)" />
                    </svg>
                    <span className="font-semibold text-[var(--text-primary)]" style={{ fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}>
                        Payment method
                    </span>
                </div>
                <CreditCardTile onClick={onSelectCard} />
            </div>
        </main>
    );
}

function isValidExpiry(expiry) {
    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    const month = Number(match[1]);
    if (month < 1 || month > 12) return false;
    const year = 2000 + Number(match[2]);
    const now = new Date();
    return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

function CardFormView({ onNext }) {
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [formError, setFormError] = useState('');

    const digits = number.replace(/\s/g, '');
    const isNumberValid = /^\d{13,19}$/.test(digits);
    const isExpiryValid = isValidExpiry(expiry);
    const isCvcValid    = /^\d{3,4}$/.test(cvc);
    const isComplete    = name.trim() && number && expiry && cvc;

    function handleNumberChange(value) {
        const cleaned = value.replace(/[^\d\s]/g, '').slice(0, 23);
        setNumber(cleaned);
        setFormError('');
    }

    function handleExpiryChange(value) {
        let cleaned = value.replace(/[^\d/]/g, '').slice(0, 5);
        if (cleaned.length === 2 && !cleaned.includes('/') && expiry.length < cleaned.length) {
            cleaned = `${cleaned}/`;
        }
        setExpiry(cleaned);
        setFormError('');
    }

    function handleNext() {
        if (!isComplete) return;
        if (!isNumberValid) { setFormError('Please enter a valid card number (13–19 digits).'); return; }
        if (!isExpiryValid) { setFormError('Please enter a valid expiry date (MM/YY) in the future.'); return; }
        if (!isCvcValid)    { setFormError('Please enter a valid CVC (3–4 digits).'); return; }
        onNext({ last4: digits.slice(-4) });
    }

    return (
        <main className="flex-1 max-w-[411px] md:max-w-3xl mx-auto w-full px-6 pt-7 pb-10 flex flex-col gap-2">
            <CardField label="Name of card holder" value={name} onChange={(v) => { setName(v); setFormError(''); }} placeholder="John" />
            <CardField label="Card number" value={number} onChange={handleNumberChange} placeholder="4242 4242 4242 4242" type="tel" />
            <div className="flex gap-2">
                <CardField label="MM/YY" value={expiry} onChange={handleExpiryChange} placeholder="11/26" type="tel" half />
                <CardField label="CVC" value={cvc} onChange={(v) => { setCvc(v.replace(/\D/g, '').slice(0, 4)); setFormError(''); }} placeholder="545" type="tel" half />
            </div>

            {formError && (
                <p role="alert" className="text-red-500 text-sm mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>{formError}</p>
            )}

            <button
                onClick={handleNext}
                disabled={!isComplete}
                className="mt-4 w-full h-[42px] rounded-[100px] font-semibold"
                style={{
                    background: isComplete ? 'var(--gradient-brand)' : '#E5E5EA',
                    color: isComplete ? '#fff' : '#AEAEB2',
                    fontSize: 17,
                    letterSpacing: '0.0035em',
                    fontFamily: 'Roboto, sans-serif',
                }}
            >
                Next
            </button>
        </main>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { items, clearCart } = useCart();
    const { auth } = useAuth();

    // view: 'main' | 'type-select' | 'card-form' | 'order-review'
    const [view, setView] = useState('main');
    const [savedCard, setSavedCard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const monthlyTotal = items.reduce((sum, p) => sum + Number(p.price || 0), 0);
    const onceOffTotal = items.reduce((sum, p) => sum + Number(p.onceOffPrice || 0), 0);

    async function handlePayNow() {
        if (!auth?.token) { navigate('/login'); return; }
        if (!savedCard) { setError('Please add a payment method before paying.'); return; }
        setLoading(true);
        setError(null);
        try {
            const productIds = items.map((p) => p.id);
            const result = await takeUpProducts(productIds, auth.token);
            if (!result.success) {
                const failed = (result.fulfilmentResultList ?? [])
                    .filter((r) => r.isEligible === false || r.success === false)
                    .map((r) => {
                        const item = items.find((p) => String(p.id) === String(r.productId));
                        return item?.name ?? `Product ${r.productId}`;
                    });
                setError(
                    failed.length > 0
                        ? `Could not complete your order. You are not currently eligible for: ${failed.join(', ')}. Your cart has been kept.`
                        : 'Could not complete your order. Please check your eligibility and try again. Your cart has been kept.'
                );
                return;
            }
            clearCart();
            navigate('/checkout/result', { state: { result } });
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    function handleBack() {
        if (view === 'main') navigate(-1);
        else if (view === 'type-select') setView('main');
        else if (view === 'card-form') setView('type-select');
        else if (view === 'order-review') setView('main');
    }

    function handleCardSaved(card) {
        setSavedCard(card);
        setView('main');
    }

    const titles = {
        main: 'Confirm and…',
        'type-select': 'Confirm and…',
        'card-form': 'Confirm and…',
        'order-review': 'Order summary',
    };

    return (
        <div className="min-h-screen bg-[var(--surface-page)] flex flex-col">
            <PageHeader title={titles[view]} onBack={handleBack} />
            {/* Desktop heading */}
            <div className="hidden md:block max-w-3xl mx-auto w-full px-6 pt-10 pb-2">
                <h1 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{titles[view]}</h1>
            </div>

            {view === 'main' && (
                <MainView
                    monthlyTotal={monthlyTotal}
                    onceOffTotal={onceOffTotal}
                    onAddMethod={() => setView('type-select')}
                    onPay={() => setView('order-review')}
                    loading={loading}
                    error={error}
                    savedCard={savedCard}
                />
            )}
            {view === 'type-select' && (
                <TypeSelectView onSelectCard={() => setView('card-form')} />
            )}
            {view === 'card-form' && (
                <CardFormView onNext={handleCardSaved} />
            )}
            {view === 'order-review' && (
                <OrderReviewView
                    items={items}
                    monthlyTotal={monthlyTotal}
                    onceOffTotal={onceOffTotal}
                    savedCard={savedCard}
                    onChangeMethod={() => setView('main')}
                    onPay={handlePayNow}
                    loading={loading}
                    error={error}
                />
            )}
        </div>
    );
}
