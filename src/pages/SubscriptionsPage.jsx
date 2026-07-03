import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import SubscriptionCard from '../components/subscriptions/SubscriptionCard.jsx';
import BankDetailsSection from '../components/subscriptions/BankDetailsSection.jsx';
import EmptyIllustration from '../components/subscriptions/EmptyIllustration.jsx';
import UnsignedContractsBanner from '../components/subscriptions/UnsignedContractsBanner.jsx';
import { getSubscriptions, deleteSubscription } from '../services/subscriptionService';
import { getBankDetails } from '../services/bankingService';
import { getContractRecord } from '../services/contractStorageService';
import { CATEGORY_GROUPS, groupSubscriptions } from '../utils/subscriptionCategories.jsx';

export default function SubscriptionsPage() {
    const navigate = useNavigate();
    const { auth, isLoggedIn } = useAuth();
    const { showToast } = useToast();

    const [subscriptions, setSubscriptions]   = useState([]);
    const [loading, setLoading]               = useState(true);
    const [error, setError]                   = useState('');
    const [cancellingId, setCancellingId]     = useState(null);
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

            if (auth?.customerId && list.length > 0) {
                const entries = await Promise.all(
                    list.map(async (sub) => {
                        const prod      = Array.isArray(sub.product) ? sub.product[0] : sub.product;
                        const productId = sub.productId ?? prod?.id ?? null;
                        if (!productId) return null;
                        const record = await getContractRecord(auth.customerId, productId).catch(() => null);
                        return [String(productId), { signed: !!(record?.signature || record?.downloadUrl), downloadUrl: record?.downloadUrl ?? '' }];
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
            showToast('Subscription cancelled.', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to cancel subscription. Please try again.', 'error');
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

    const unsignedCount = Object.values(contractStatus).filter((s) => !s.signed).length;
    const groups = groupSubscriptions(subscriptions);

    return (
        <div className="min-h-screen" style={{ background: 'var(--neutral-100)' }}>
            <Header />

            <main className="max-w-[411px] md:max-w-3xl mx-auto pt-[73px] pb-[88px] md:pb-16 px-6 flex flex-col gap-4">
                <h1 className="text-[20px] font-semibold mt-6" style={{ color: 'var(--neutral-800)', fontFamily: 'Roboto, sans-serif' }}>
                    My subscriptions
                </h1>

                {isLoggedIn && (
                    <BankDetailsSection
                        userId={auth?.customerId}
                        onChangeClick={() => navigate('/account/bank')}
                    />
                )}

                {isLoggedIn && !loading && (
                    <UnsignedContractsBanner count={unsignedCount} />
                )}

                {!isLoggedIn && (
                    <div className="flex flex-col items-center gap-4 pt-16 text-center">
                        <EmptyIllustration />
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 17, color: 'var(--text-secondary)' }}>
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
                            <div key={i} className="w-full rounded-[12px] overflow-hidden border border-[var(--neutral-300)] animate-pulse">
                                <div className="w-full bg-[var(--surface-field)]" style={{ height: 120 }} />
                                <div className="px-4 py-3 flex flex-col gap-2">
                                    <div className="h-4 w-2/3 bg-[var(--surface-field)] rounded" />
                                    <div className="h-3 w-1/3 bg-[var(--surface-field)] rounded" />
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
                        <p className="font-bold" style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, color: 'var(--neutral-800)' }}>
                            No subscriptions yet
                        </p>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: 'var(--text-secondary)' }}>
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
                                    <span className="flex-1 h-px" style={{ background: group.accent, opacity: 0.2 }} />
                                </div>
                                <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 md:items-start">
                                {groups[group.key].map((sub) => {
                                    const subId     = sub.subscriptionId ?? sub.id;
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
                                            contractUrl={contractStatus[String(productId)]?.downloadUrl ?? ''}
                                        />
                                    );
                                })}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
