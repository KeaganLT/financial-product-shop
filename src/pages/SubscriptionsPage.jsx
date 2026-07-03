import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { getSubscriptions, deleteSubscription } from '../services/subscriptionService';
import { getProductPlaceholder } from '../assets/placeholders/index.js';
import { getBankDetails } from '../services/bankingService';
import { getContractRecord } from '../services/contractStorageService';

// ─── Category grouping ─────────────────────────────────────────────────────────
// Mirrors the product types in PRODUCT_CUSTOMER_TYPES on ProductDetailPage.
const CATEGORY_GROUPS = [
    {
        key:   'short-term-insurance',
        label: 'Short Term Insurance',
        accent: '#1860BF',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="#1860BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        key:   'long-term-insurance',
        label: 'Long Term Insurance',
        accent: '#0D47A1',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#E8F0FE" stroke="#0D47A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        key:   'device-contract',
        label: 'Device Contracts',
        accent: '#1A3A5C',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="7" y="2" width="10" height="20" rx="2" stroke="#1A3A5C" strokeWidth="2" />
                <circle cx="12" cy="18" r="1" fill="#1A3A5C" />
            </svg>
        ),
    },
    {
        key:   'islamic-investment',
        label: 'Islamic Investments',
        accent: '#1B5E20',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C9 2 6.5 4 6.5 6.5c0 1.5.7 2.8 1.8 3.7C5.5 11.5 4 14 4 17c2 1.3 4.5 2 7.5 2h.5c3 0 5.5-.7 7.5-2 0-3-1.5-5.5-4.3-6.8A4.5 4.5 0 0 0 17.5 6.5C17.5 4 15 2 12 2z" stroke="#1B5E20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        key:   'vip-investment',
        label: 'VIP Investments',
        accent: '#4A148C',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7-3.5 11H6.5L3 9z" stroke="#4A148C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        key:   'investment',
        label: 'Investments',
        accent: '#168C34',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="#168C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="16 7 22 7 22 13" stroke="#168C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        key:   'other',
        label: 'Other',
        accent: '#8E8E93',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#8E8E93" strokeWidth="2" />
                <path d="M12 8v4M12 16h.01" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
];

function getCategory(productName = '') {
    const n = productName.toLowerCase();
    if (n.includes('islamic'))                                             return 'islamic-investment';
    if (n.includes('vip'))                                                 return 'vip-investment';
    if ((n.includes('short') || n.includes('retail')) && n.includes('insurance')) return 'short-term-insurance';
    if (n.includes('long') && n.includes('insurance'))                    return 'long-term-insurance';
    if (n.includes('insurance') || n.includes('commercial'))              return 'short-term-insurance';
    if (n.includes('device') || n.includes('contract'))                   return 'device-contract';
    if (n.includes('investment') || n.includes('annuity') || n.includes('fund')) return 'investment';
    return 'other';
}

function groupSubscriptions(subscriptions) {
    const groups = {};
    for (const sub of subscriptions) {
        const prod = Array.isArray(sub.product) ? sub.product[0] : sub.product;
        const name = sub.productName ?? prod?.name ?? '';
        const key  = getCategory(name);
        if (!groups[key]) groups[key] = [];
        groups[key].push(sub);
    }
    return groups;
}

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

function EmptyIllustration() {
    return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="56" stroke="#E5E5EA" strokeWidth="8" />
            <rect x="36" y="38" width="48" height="44" rx="4" stroke="#1860BF" strokeWidth="2.5" />
            <path d="M44 52h32M44 62h20" stroke="#1860BF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}

function SubscriptionCard({ subscription, onCancel, cancelling, onView, onContract, contractSigned }) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    // product is returned as an array — take the first item
    const prod         = Array.isArray(subscription.product) ? subscription.product[0] : subscription.product;
    const name         = subscription.productName ?? prod?.name ?? 'Product';
    const price        = subscription.price ?? prod?.price ?? subscription.monthlyPremium ?? 0;
    const imageUrl     = subscription.imageUrl ?? prod?.imageUrl ?? null;
    const fulfilType   = subscription.fulfilmentType ?? prod?.fulfilmentType ?? '';
    const subId        = subscription.subscriptionId ?? subscription.id;
    const productId    = subscription.productId ?? prod?.id ?? null;

    return (
        <div
            className="w-full rounded-[12px] overflow-hidden border"
            style={{ borderColor: '#E5E5EA' }}
        >
             {/* Product image strip — tappable */}
            <button
                className="w-full overflow-hidden bg-[#D9D9D9] block"
                style={{ height: 120 }}
                onClick={() => productId && onView(productId)}
            >
                <img
                    src={imageUrl || getProductPlaceholder(name)}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </button>

            {/* Card body */}
            <div className="px-4 py-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                        <button
                            className="font-semibold text-black text-left"
                            style={{ fontFamily: 'Roboto, sans-serif', fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em' }}
                            onClick={() => productId && onView(productId)}
                        >
                            {name}
                        </button>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#8E8E93', lineHeight: '18px' }}>
                            R{Number(price).toFixed(2)} / month
                        </p>
                    </div>
                    <StatusBadge fulfilmentType={fulfilType} />
                </div>

                {/* Contract + Cancel row */}
                <div className="flex items-center gap-4 mt-1">
                    <button
                        onClick={() => onContract({ id: productId, name, price })}
                        className="flex items-center gap-1"
                        style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: contractSigned ? '#168C34' : '#1860BF' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={contractSigned ? '#168C34' : '#1860BF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 2v6h6M16 13H8M16 17H8" stroke={contractSigned ? '#168C34' : '#1860BF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {contractSigned ? 'Signed ✓' : 'Sign contract'}
                    </button>
                    <span style={{ color: '#C7C7CC' }}>·</span>
                    {!confirmOpen ? (
                    <button
                        onClick={() => setConfirmOpen(true)}
                        style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#C51C13', textDecoration: 'underline' }}
                    >
                        Cancel subscription
                    </button>
                    ) : null}
                </div>
                {confirmOpen && (
                    <div
                        className="flex flex-col gap-2 mt-1 px-3 py-2 rounded-[8px]"
                        style={{ background: '#FFF5F5', border: '1px solid #FFB3B3' }}
                    >
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#1C1C1C' }}>
                            Are you sure you want to cancel this subscription?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { onCancel(subId); setConfirmOpen(false); }}
                                disabled={cancelling}
                                className="flex-1 py-1.5 rounded-full text-white font-semibold"
                                style={{
                                    background: '#C51C13',
                                    fontFamily: 'Roboto, sans-serif',
                                    fontSize: 13,
                                    opacity: cancelling ? 0.6 : 1,
                                }}
                            >
                                {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                            </button>
                            <button
                                onClick={() => setConfirmOpen(false)}
                                className="flex-1 py-1.5 rounded-full font-semibold border"
                                style={{
                                    borderColor: '#C7C7CC',
                                    fontFamily: 'Roboto, sans-serif',
                                    fontSize: 13,
                                    color: '#1C1C1C',
                                }}
                            >
                                Keep it
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function BankDetailsSection({ userId, navigate }) {
    const bankDetails = getBankDetails(userId);
    if (!bankDetails) return null;

    return (
        <div
            className="rounded-[12px] px-4 py-3 flex items-center justify-between"
            style={{ background: '#F0F4FF', border: '1px solid #C7D9FF' }}
        >
            <div className="flex flex-col gap-0.5">
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C' }}>
                    Debit account
                </p>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#3C3C43' }}>
                    {bankDetails.bankName} · {bankDetails.accountType} ••••{bankDetails.last4}
                </p>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#8E8E93' }}>
                    Debited on the {bankDetails.debitDay}{bankDetails.debitDay === 1 ? 'st' : 'th'} of each month
                </p>
            </div>
            <button
                onClick={() => navigate('/account/bank')}
                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1860BF', flexShrink: 0, marginLeft: 12 }}
            >
                Change
            </button>
        </div>
    );
}

export default function SubscriptionsPage() {
    const navigate = useNavigate();
    const { auth, isLoggedIn } = useAuth();

    const [subscriptions, setSubscriptions]   = useState([]);
    const [loading, setLoading]               = useState(true);
    const [error, setError]                   = useState('');
    const [cancellingId, setCancellingId]     = useState(null);
    // contractStatus: { [productId]: { signed: bool, downloadUrl: string } }
    const [contractStatus, setContractStatus] = useState({});

    useEffect(() => {
        if (!isLoggedIn) return;
        load();
    }, [isLoggedIn]);

    async function load() {
        setLoading(true);
        setError('');
        try {
            const data = await getSubscriptions(auth.token);
            const list = Array.isArray(data) ? data : [];
            setSubscriptions(list);

            // Load contract status from Firestore for each subscription
            if (auth?.customerId && list.length > 0) {
                const entries = await Promise.all(
                    list.map(async (sub) => {
                        const prod      = Array.isArray(sub.product) ? sub.product[0] : sub.product;
                        const productId = sub.productId ?? prod?.id ?? null;
                        if (!productId) return null;
                        const record = await getContractRecord(auth.customerId, productId).catch(() => null);
                        return [String(productId), { signed: !!record?.signature, downloadUrl: record?.downloadUrl ?? '' }];
                    })
                );
                setContractStatus(Object.fromEntries(entries.filter(Boolean)));
            }
        } catch (err) {
            setError(err.message || 'Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel(id) {
        setCancellingId(id);
        try {
            await deleteSubscription(id, auth.token);
            setSubscriptions((prev) => prev.filter((s) => (s.subscriptionId ?? s.id) !== id));
        } catch (err) {
            setError(err.message || 'Failed to cancel subscription');
        } finally {
            setCancellingId(null);
        }
    }

    function handleContract(product) {
        const bankDetails = getBankDetails(auth?.customerId);
        navigate('/contract', { state: { product, bankDetails } });
    }

    function handleView(productId) {
        navigate(`/products/${productId}`);
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-[411px] mx-auto pt-[73px] pb-[88px] md:pb-16 px-6 flex flex-col gap-4">
                <h1
                    className="text-[20px] font-semibold mt-6"
                    style={{ color: '#000000', fontFamily: 'Roboto, sans-serif' }}
                >
                    My subscriptions
                </h1>

                {isLoggedIn && <BankDetailsSection userId={auth?.customerId} navigate={navigate} />}

                {/* Unsigned contracts reminder */}
                {isLoggedIn && !loading && Object.values(contractStatus).some((s) => !s.signed) && (
                    <div
                        className="flex items-start gap-3 px-4 py-3 rounded-[12px]"
                        style={{ background: '#FFF8E6', border: '1px solid #FFD97A' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                            <circle cx="9" cy="9" r="9" fill="#F5A623" />
                            <rect x="8" y="4" width="2" height="6" rx="1" fill="white" />
                            <circle cx="9" cy="13" r="1" fill="white" />
                        </svg>
                        <div>
                            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 600, color: '#7A4F00' }}>
                                {Object.values(contractStatus).filter((s) => !s.signed).length} contract{Object.values(contractStatus).filter((s) => !s.signed).length > 1 ? 's' : ''} awaiting your signature
                            </p>
                            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#7A4F00', marginTop: 2 }}>
                                Tap "Sign contract" on the relevant subscription below.
                            </p>
                        </div>
                    </div>
                )}

                {!isLoggedIn && (
                    <div className="flex flex-col items-center gap-4 pt-16 text-center">
                        <EmptyIllustration />
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 17, color: '#8E8E93' }}>
                            Sign in to view your subscriptions.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full h-[42px] rounded-[100px] font-semibold text-white"
                            style={{ background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)', fontFamily: 'Roboto, sans-serif', fontSize: 17 }}
                        >
                            Sign in
                        </button>
                    </div>
                )}

                {isLoggedIn && loading && (
                    <div className="flex flex-col gap-4 mt-2">
                        {[1, 2].map((i) => (
                            <div key={i} className="w-full rounded-[12px] overflow-hidden border border-[#E5E5EA] animate-pulse">
                                <div className="w-full bg-[#F2F2F7]" style={{ height: 120 }} />
                                <div className="px-4 py-3 flex flex-col gap-2">
                                    <div className="h-4 w-2/3 bg-[#F2F2F7] rounded" />
                                    <div className="h-3 w-1/3 bg-[#F2F2F7] rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isLoggedIn && !loading && error && (
                    <div className="flex flex-col items-center gap-3 pt-16 text-center">
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#C51C13' }}>{error}</p>
                        <button
                            onClick={load}
                            style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#1860BF', textDecoration: 'underline' }}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {isLoggedIn && !loading && !error && subscriptions.length === 0 && (
                    <div className="flex flex-col items-center gap-4 pt-16 text-center">
                        <EmptyIllustration />
                        <p
                            className="font-bold"
                            style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, color: '#1C1C1C' }}
                        >
                            No subscriptions yet
                        </p>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#8E8E93' }}>
                            Browse our products and take out your first subscription.
                        </p>
                        <button
                            onClick={() => navigate('/products')}
                            className="w-full h-[42px] rounded-[100px] font-semibold text-white"
                            style={{ background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)', fontFamily: 'Roboto, sans-serif', fontSize: 17 }}
                        >
                            Browse products
                        </button>
                    </div>
                )}

                {isLoggedIn && !loading && subscriptions.length > 0 && (() => {
                    const groups = groupSubscriptions(subscriptions);
                    return (
                        <>
                            {error && (
                                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#C51C13' }}>{error}</p>
                            )}
                            {CATEGORY_GROUPS.filter((g) => groups[g.key]?.length > 0).map((group) => (
                                <div key={group.key} className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 mt-2">
                                        {group.icon}
                                        <span
                                            style={{
                                                fontFamily: 'Roboto, sans-serif',
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: group.accent,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.06em',
                                            }}
                                        >
                                            {group.label}
                                        </span>
                                        <span
                                            className="flex-1 h-px"
                                            style={{ background: group.accent, opacity: 0.2 }}
                                        />
                                    </div>
                                    {groups[group.key].map((sub) => {
                                        const subId = sub.subscriptionId ?? sub.id;
                                        const productId = sub.productId ?? (Array.isArray(sub.product) ? sub.product[0]?.id : sub.product?.id);
                                        return (
                                            <SubscriptionCard
                                                key={subId}
                                                subscription={sub}
                                                onCancel={handleCancel}
                                                cancelling={cancellingId === subId}
                                                onView={handleView}
                                                onContract={handleContract}
                                                contractSigned={!!contractStatus[String(productId)]?.signed}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </>
                    );
                })()}
            </main>

            <BottomNav />
        </div>
    );
}
