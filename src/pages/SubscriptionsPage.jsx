import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import SubscriptionCard from '../components/subscriptions/SubscriptionCard.jsx';
import PaymentSummaryCard from '../components/subscriptions/PaymentSummaryCard.jsx';
import AccountPickerSheet from '../components/subscriptions/AccountPickerSheet.jsx';
import EmptyIllustration from '../components/subscriptions/EmptyIllustration.jsx';
import UnsignedContractsBanner from '../components/subscriptions/UnsignedContractsBanner.jsx';
import { getSubscriptions, deleteSubscription } from '../services/subscriptionService';
import { getContractRecord } from '../services/contractStorageService';
import { getBankAccounts, assignAccountToProduct, resolveAccountForProduct } from '../services/bankAccountsService';
import { getNextDebitDate } from '../utils/debitDates.js';
import { CATEGORY_GROUPS, groupSubscriptions } from '../utils/subscriptionCategories.jsx';

function subProduct(sub) {
    return Array.isArray(sub.product) ? sub.product[0] : sub.product;
}

function subProductId(sub) {
    return sub.productId ?? subProduct(sub)?.id ?? null;
}

export default function SubscriptionsPage() {
    const navigate = useNavigate();
    const { auth, isLoggedIn } = useAuth();
    const { showToast } = useToast();

    const [subscriptions, setSubscriptions]   = useState([]);
    const [loading, setLoading]               = useState(true);
    const [error, setError]                   = useState('');
    const [cancellingId, setCancellingId]     = useState(null);
    const [contractStatus, setContractStatus] = useState({});
    const [accountsData, setAccountsData]     = useState({ accounts: [], assignments: {} });
    const [pickerFor, setPickerFor]           = useState(null);
    const [assigning, setAssigning]           = useState(false);

    useEffect(() => {
        if (!isLoggedIn) return;
        load();
    }, [isLoggedIn]);

    async function load() {
        setLoading(true);
        setError('');
        try {
            const [data, accounts] = await Promise.all([
                getSubscriptions(auth.token),
                auth?.customerId ? getBankAccounts(auth.customerId).catch(() => ({ accounts: [], assignments: {} })) : { accounts: [], assignments: {} },
            ]);
            const list = Array.isArray(data) ? data : [];
            setSubscriptions(list);
            setAccountsData(accounts);

            if (auth?.customerId && list.length > 0) {
                const entries = await Promise.all(
                    list.map(async (sub) => {
                        const productId = subProductId(sub);
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
        const account = resolveAccountForProduct(accountsData, product.id);
        navigate('/contract', { state: { product, bankDetails: account } });
    }

    function handleView(productId) {
        navigate(`/products/${productId}`);
    }

    async function handleAssignAccount(accountId) {
        if (!pickerFor) return;
        setAssigning(true);
        try {
            await assignAccountToProduct(auth.customerId, pickerFor, accountId);
            setAccountsData((prev) => ({
                ...prev,
                assignments: { ...prev.assignments, [String(pickerFor)]: accountId },
            }));
            showToast('Debit account updated.', 'success');
            setPickerFor(null);
        } catch {
            showToast('Could not update the debit account. Please try again.', 'error');
        } finally {
            setAssigning(false);
        }
    }

    const unsignedCount = Object.values(contractStatus).filter((s) => !s.signed).length;
    const groups = groupSubscriptions(subscriptions);

    const totalMonthly = subscriptions.reduce((sum, sub) => {
        const prod = subProduct(sub);
        return sum + Number(sub.price ?? prod?.price ?? sub.monthlyPremium ?? 0);
    }, 0);

    const summaryRows = subscriptions.map((sub) => {
        const prod      = subProduct(sub);
        const productId = subProductId(sub);
        const account   = resolveAccountForProduct(accountsData, productId);
        return {
            key:         sub.subscriptionId ?? sub.id,
            productName: sub.productName ?? prod?.name ?? 'Product',
            amount:      sub.price ?? prod?.price ?? sub.monthlyPremium ?? 0,
            date:        account ? getNextDebitDate(account.debitDay) : null,
            bankLabel:   account ? `${account.bankName} ••••${account.last4}` : '',
        };
    });

    const pickerAccount = pickerFor ? resolveAccountForProduct(accountsData, pickerFor) : null;

    return (
        <div className="min-h-screen" style={{ background: 'var(--neutral-100)' }}>
            <Header />

            <main className="max-w-[411px] md:max-w-3xl mx-auto pt-[73px] pb-[88px] md:pb-16 px-6 flex flex-col gap-4">
                <h1 className="text-[20px] font-semibold mt-6" style={{ color: 'var(--neutral-800)', fontFamily: 'Roboto, sans-serif' }}>
                    My subscriptions
                </h1>

                {isLoggedIn && !loading && !error && (
                    <PaymentSummaryCard rows={summaryRows} totalMonthly={totalMonthly} count={subscriptions.length} />
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
                            style={{ background: 'var(--gradient-brand)', fontFamily: 'Roboto, sans-serif', fontSize: 17 }}
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
                            style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: 'var(--brand-100)', textDecoration: 'underline' }}
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
                            style={{ background: 'var(--gradient-brand)', fontFamily: 'Roboto, sans-serif', fontSize: 17 }}
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
                                    const productId = subProductId(sub);
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
                                            account={resolveAccountForProduct(accountsData, productId)}
                                            onChangeAccount={() => {
                                                if (accountsData.accounts.length === 0) {
                                                    navigate('/account/bank');
                                                } else {
                                                    setPickerFor(productId);
                                                }
                                            }}
                                        />
                                    );
                                })}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </main>

            <AccountPickerSheet
                open={!!pickerFor}
                accounts={accountsData.accounts}
                selectedId={pickerAccount?.id ?? null}
                saving={assigning}
                onSelect={handleAssignAccount}
                onAddNew={() => navigate('/account/bank')}
                onClose={() => setPickerFor(null)}
            />

            <BottomNav />
        </div>
    );
}
