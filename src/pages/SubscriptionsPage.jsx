import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { getSubscriptions, deleteSubscription } from '../services/subscriptionService';
import productPlaceholder from '../assets/product-placeholder.svg';

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

function SubscriptionCard({ subscription, onCancel, cancelling }) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    // product is returned as an array — take the first item
    const prod         = Array.isArray(subscription.product) ? subscription.product[0] : subscription.product;
    const name         = subscription.productName ?? prod?.name ?? 'Product';
    const price        = subscription.price ?? prod?.price ?? subscription.monthlyPremium ?? 0;
    const imageUrl     = subscription.imageUrl ?? prod?.imageUrl ?? null;
    const fulfilType   = subscription.fulfilmentType ?? prod?.fulfilmentType ?? '';
    const subId        = subscription.subscriptionId ?? subscription.id;

    return (
        <div
            className="w-full rounded-[12px] overflow-hidden border"
            style={{ borderColor: '#E5E5EA' }}
        >
            {/* Product image strip */}
            <div className="w-full overflow-hidden bg-[#D9D9D9]" style={{ height: 120 }}>
                <img
                    src={imageUrl || productPlaceholder}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Card body */}
            <div className="px-4 py-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                        <p
                            className="font-semibold text-black"
                            style={{ fontFamily: 'Roboto, sans-serif', fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em' }}
                        >
                            {name}
                        </p>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#8E8E93', lineHeight: '18px' }}>
                            R{Number(price).toFixed(2)} / month
                        </p>
                    </div>
                    <StatusBadge fulfilmentType={fulfilType} />
                </div>

                {/* Cancel flow */}
                {!confirmOpen ? (
                    <button
                        onClick={() => setConfirmOpen(true)}
                        className="self-start mt-1"
                        style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#C51C13', textDecoration: 'underline' }}
                    >
                        Cancel subscription
                    </button>
                ) : (
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

export default function SubscriptionsPage() {
    const navigate = useNavigate();
    const { auth, isLoggedIn } = useAuth();

    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState('');
    const [cancellingId, setCancellingId]   = useState(null);

    useEffect(() => {
        if (!isLoggedIn) return;
        load();
    }, [isLoggedIn]);

    async function load() {
        setLoading(true);
        setError('');
        try {
            const data = await getSubscriptions(auth.token);
            setSubscriptions(Array.isArray(data) ? data : []);
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

                {isLoggedIn && !loading && subscriptions.length > 0 && (
                    <>
                        {error && (
                            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#C51C13' }}>{error}</p>
                        )}
                        {subscriptions.map((sub) => {
                            const subId = sub.subscriptionId ?? sub.id;
                            return (
                                <SubscriptionCard
                                    key={subId}
                                    subscription={sub}
                                    onCancel={handleCancel}
                                    cancelling={cancellingId === subId}
                                />
                            );
                        })}
                    </>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
