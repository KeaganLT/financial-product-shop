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

const AmexLogo = () => (
    <svg width="50" height="16" viewBox="0 0 50 16" fill="none">
        <rect width="50" height="16" rx="2" fill="#2E77BC" />
        <text x="4" y="12" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="9" fill="white">AMERICAN</text>
        <text x="4" y="12" dy="0" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="9" fill="white" />
    </svg>
);

// ── Shared header ─────────────────────────────────────────────────────────────

function PageHeader({ title, onBack }) {
    return (
        <div className="flex items-center px-1 bg-white md:hidden" style={{ height: 64, borderBottom: '1px solid #E5E5EA' }}>
            <div className="max-w-[411px] mx-auto w-full flex items-center gap-1">
                <button onClick={onBack} className="w-12 h-12 flex items-center justify-center" aria-label="Go back">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#49454F" />
                    </svg>
                </button>
                <h1 className="flex-1" style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 400, lineHeight: '28px', letterSpacing: '0.35px', color: '#1D1B20' }}>
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
            style={{ background: '#F2F2F7' }}
        >
            <div className="flex flex-col items-start gap-[9px]">
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, fontWeight: 600, lineHeight: '20px', color: '#000' }}>
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
                <path d="M1 1l10 9-10 9" stroke="#1860BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    );
}

// ── Shared footer (total + pay button) ────────────────────────────────────────

function CheckoutFooter({ monthlyTotal, onPay, loading }) {
    return (
        <>
            {/* Mobile: fixed bottom bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white md:hidden" style={{ borderTop: '1px solid #E5E5EA' }}>
                <div className="max-w-[411px] mx-auto px-7 pt-4 pb-6 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <span className="font-semibold text-black" style={{ fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}>Total</span>
                        <div className="flex flex-col gap-[5px] items-end">
                            <div className="flex items-center gap-5">
                                <span className="text-[#8E8E93]" style={{ fontSize: 13, lineHeight: '18px', letterSpacing: '0.41px', fontFamily: 'Roboto, sans-serif' }}>Once off</span>
                                <span className="font-semibold text-black" style={{ fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}>R 0.00</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="text-[#8E8E93]" style={{ fontSize: 13, lineHeight: '18px', letterSpacing: '0.41px', fontFamily: 'Roboto, sans-serif' }}>Monthly</span>
                                <span className="font-semibold text-black" style={{ fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}>R {monthlyTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onPay} disabled={loading} className="w-full h-[42px] rounded-[100px] font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)', fontSize: 17, letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}>
                        {loading ? 'Processing…' : `Pay now (R${monthlyTotal.toFixed(2)})`}
                    </button>
                </div>
            </div>
            {/* Desktop: inline pay button */}
            <div className="hidden md:block max-w-3xl mx-auto w-full px-6 pb-12 pt-4">
                <div className="h-px bg-[#E5E5EA] mb-4" />
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-[#8E8E93]" style={{ fontSize: 13, fontFamily: 'Roboto, sans-serif' }}>Monthly total</span>
                        <span className="font-bold text-black" style={{ fontSize: 22, fontFamily: 'Roboto, sans-serif' }}>R {monthlyTotal.toFixed(2)}</span>
                    </div>
                    <button onClick={onPay} disabled={loading} className="h-[42px] px-8 rounded-[100px] font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)', fontSize: 17, letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}>
                        {loading ? 'Processing…' : `Pay now (R${monthlyTotal.toFixed(2)})`}
                    </button>
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
                className="w-full h-full px-4 pt-4 pb-1 outline-none rounded-[4px] text-[#1C1C1C]"
                style={{
                    border: `${focused ? 3 : 1}px solid ${focused ? '#1AAFDE' : '#C7C7CC'}`,
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: 16,
                    letterSpacing: '0.5px',
                    background: 'white',
                }}
            />
            <span
                className="absolute pointer-events-none transition-all"
                style={{
                    left: focused || hasValue ? 12 : 16,
                    top: focused || hasValue ? -8 : 16,
                    fontSize: focused || hasValue ? 12 : 16,
                    lineHeight: focused || hasValue ? '16px' : '24px',
                    color: focused ? '#1AAFDE' : '#8E8E93',
                    background: focused || hasValue ? 'white' : 'transparent',
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
            {isImmediate ? 'Active: Immediate' : 'Active: Pending approval'}
        </span>
    );
}

import { getProductPlaceholder } from '../assets/placeholders/index.js';

function OrderReviewView({ items, monthlyTotal, savedCard, onChangeMethod, onPay, loading, error }) {
    return (
        <>
            <main className="flex-1 max-w-[411px] md:max-w-3xl mx-auto w-full px-6 pt-7 pb-40 md:pb-8 flex flex-col gap-6">
                {/* Items */}
                <div className="flex flex-col gap-4">
                    {items.map((product) => (
                        <div key={product.id} className="flex items-start gap-4">
                            <div className="flex-shrink-0 rounded-[8px] overflow-hidden bg-[#D9D9D9]" style={{ width: 72, height: 62 }}>
                                <img src={product.imageUrl || getProductPlaceholder(product.name)} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, fontWeight: 600, lineHeight: '20px', color: '#000' }}>{product.name}</p>
                                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, lineHeight: '13px', letterSpacing: '0.41px', color: '#8E8E93' }}>
                                    from R{Number(product.price).toFixed(0)} p/m
                                </p>
                                <StatusBadge fulfilmentType={product.fulfilmentType} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-[#E5E5EA]" />

                {/* Payment method */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                            <rect x="0.5" y="0.5" width="19" height="13" rx="1.5" stroke="#1860BF" />
                            <rect x="0" y="3" width="20" height="3" fill="#1860BF" />
                            <rect x="2" y="8" width="5" height="2" rx="0.5" fill="#1860BF" />
                        </svg>
                        <span className="font-semibold text-black" style={{ fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}>
                            Payment method
                        </span>
                    </div>
                    {savedCard ? (
                        <div className="flex items-center gap-3 py-1">
                            <div className="w-4 h-4 rounded-full border-2 border-[#1860BF] flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-[#1860BF]" />
                            </div>
                            <div className="flex-1">
                                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#000' }}>Visa</span>
                                <span className="text-[#8E8E93] ml-2" style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>••••••••{savedCard.last4}</span>
                            </div>
                            <VisaLogo />
                            <button
                                onClick={onChangeMethod}
                                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#1860BF', marginLeft: 8 }}
                            >
                                Change
                            </button>
                        </div>
                    ) : (
                        <button onClick={onChangeMethod} className="flex items-center gap-[9px] text-left">
                            <span style={{ fontSize: 18, color: '#1AAFDE' }}>+</span>
                            <span style={{ fontSize: 15, lineHeight: '20px', fontFamily: 'Roboto, sans-serif', color: '#1AAFDE' }}>Add payment method</span>
                        </button>
                    )}
                </div>

                {error && (
                    <p className="text-red-500 text-sm text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>{error}</p>
                )}
            </main>
            <CheckoutFooter monthlyTotal={monthlyTotal} onPay={onPay} loading={loading} />
        </>
    );
}

// ── Views ─────────────────────────────────────────────────────────────────────

function MainView({ monthlyTotal, onAddMethod, onPay, loading, error, savedCard }) {
    return (
        <>
            <main className="flex-1 max-w-[411px] md:max-w-3xl mx-auto w-full px-6 pt-7 pb-40 md:pb-8">
                <div className="flex flex-col gap-4">
                    {/* Payment method heading */}
                    <div className="flex items-center gap-3">
                        <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                            <rect x="0.5" y="0.5" width="19" height="13" rx="1.5" stroke="#1860BF" />
                            <rect x="0" y="3" width="20" height="3" fill="#1860BF" />
                            <rect x="2" y="8" width="5" height="2" rx="0.5" fill="#1860BF" />
                        </svg>
                        <span className="font-semibold text-black" style={{ fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}>
                            Payment method
                        </span>
                    </div>

                    {/* Saved card (shown after one has been added) */}
                    {savedCard && (
                        <div className="flex items-center gap-3 py-2">
                            <div className="w-4 h-4 rounded-full border-2 border-[#1860BF] flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-[#1860BF]" />
                            </div>
                            <div className="flex-1">
                                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#000' }}>Visa</span>
                                <span className="text-[#8E8E93] ml-2" style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>••••••••{savedCard.last4}</span>
                            </div>
                            <VisaLogo />
                        </div>
                    )}

                    {/* Add payment method */}
                    <div className="flex flex-col gap-3">
                        {savedCard && (
                            <span className="font-semibold text-black" style={{ fontSize: 15, fontFamily: 'Roboto, sans-serif' }}>Add payment method</span>
                        )}
                        {!savedCard && (
                            <button onClick={onAddMethod} className="flex items-center gap-[9px] text-left">
                                <span style={{ fontSize: 18, color: '#1AAFDE' }}>+</span>
                                <span style={{ fontSize: 15, lineHeight: '20px', letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif', color: '#1AAFDE' }}>
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
            <CheckoutFooter monthlyTotal={monthlyTotal} onPay={onPay} loading={loading} />
        </>
    );
}

function TypeSelectView({ onSelectCard }) {
    return (
        <main className="flex-1 max-w-[411px] md:max-w-3xl mx-auto w-full px-6 pt-7 pb-10">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                        <rect x="0.5" y="0.5" width="19" height="13" rx="1.5" stroke="#1860BF" />
                        <rect x="0" y="3" width="20" height="3" fill="#1860BF" />
                        <rect x="2" y="8" width="5" height="2" rx="0.5" fill="#1860BF" />
                    </svg>
                    <span className="font-semibold text-black" style={{ fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}>
                        Payment method
                    </span>
                </div>
                <CreditCardTile onClick={onSelectCard} />
            </div>
        </main>
    );
}

function CardFormView({ onNext }) {
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    const isComplete = name && number && expiry && cvc;

    function handleNext() {
        if (isComplete) {
            onNext({ last4: number.slice(-3) });
        }
    }

    return (
        <main className="flex-1 max-w-[411px] md:max-w-3xl mx-auto w-full px-6 pt-7 pb-10 flex flex-col gap-2">
            <CardField label="Name of card holder" value={name} onChange={setName} placeholder="John" />
            <CardField label="Card number" value={number} onChange={setNumber} placeholder="62406766893" type="tel" />
            <div className="flex gap-2">
                <CardField label="MM/YY" value={expiry} onChange={setExpiry} placeholder="11/26" type="tel" half />
                <CardField label="CVC" value={cvc} onChange={setCvc} placeholder="545" type="tel" half />
            </div>

            <button
                onClick={handleNext}
                disabled={!isComplete}
                className="mt-4 w-full h-[42px] rounded-[100px] font-semibold"
                style={{
                    background: isComplete ? 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)' : '#E5E5EA',
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

    async function handlePayNow() {
        if (!auth?.token) { navigate('/login'); return; }
        setLoading(true);
        setError(null);
        try {
            const productIds = items.map((p) => p.id);
            const result = await takeUpProducts(productIds, auth.token);
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
        <div className="min-h-screen bg-white flex flex-col">
            <PageHeader title={titles[view]} onBack={handleBack} />
            {/* Desktop heading */}
            <div className="hidden md:block max-w-3xl mx-auto w-full px-6 pt-10 pb-2">
                <h1 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 28, fontWeight: 700, color: '#1C1C1C' }}>{titles[view]}</h1>
            </div>

            {view === 'main' && (
                <MainView
                    monthlyTotal={monthlyTotal}
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
