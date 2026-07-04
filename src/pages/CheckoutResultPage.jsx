import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import InfoBanner from '../components/InfoBanner.jsx';

export default function CheckoutResultPage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [searchParams] = useSearchParams();
    const isSubscription = searchParams.get('type') === 'subscription';

    const product     = state?.product ?? null;
    const bankDetails = state?.bankDetails ?? null;

    useEffect(() => {
        if (!state) {
            navigate(isSubscription ? '/subscriptions' : '/products', { replace: true });
        }
    }, [state, isSubscription, navigate]);

    if (!state) return null;

    const nextDebitDate = (() => {
        if (!bankDetails?.debitDay) return null;
        const now    = new Date();
        const target = new Date(now.getFullYear(), now.getMonth(), bankDetails.debitDay);
        if (target <= now) target.setMonth(target.getMonth() + 1);
        return target.toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' });
    })();

    return (
        <div className="min-h-screen bg-[var(--surface-page)] flex flex-col">
            {/* Header */}
            <div className="flex items-center px-1 bg-[var(--surface-page)]" style={{ height: 64, borderBottom: '1px solid var(--neutral-300)' }}>
                <div className="max-w-[480px] mx-auto w-full flex items-center gap-1 px-4">
                    <h1
                        className="flex-1"
                        style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 400, lineHeight: '28px', letterSpacing: '0.35px', color: 'var(--text-primary)' }}
                    >
                        {isSubscription ? 'Subscription activated' : 'Order summary'}
                    </h1>
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 max-w-[480px] mx-auto w-full px-6 flex flex-col items-center justify-center gap-6 pb-24">
                {/* Green checkmark */}
                <svg width="100" height="100" viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="60" r="60" fill="#168C34" />
                    <path d="M36 62l18 18 30-36" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                <div className="flex flex-col items-center gap-2 text-center">
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {isSubscription ? 'You\'re all set!' : 'Thank you for your order.'}
                    </p>
                    {isSubscription && product && (
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: 'var(--text-secondary)' }}>
                            {product.name} is now active.
                        </p>
                    )}
                </div>

                {/* Subscription details card */}
                {isSubscription && bankDetails && (
                    <div
                        className="w-full rounded-[12px] border flex flex-col divide-y"
                        style={{ borderColor: 'var(--neutral-300)' }}
                    >
                        {product && (
                            <div className="flex items-center justify-between px-4 py-3">
                                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: 'var(--text-secondary)' }}>Monthly premium</span>
                                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, color: '#168C34' }}>
                                    R{Number(product.price).toFixed(2)} / month
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between px-4 py-3">
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: 'var(--text-secondary)' }}>Debit account</span>
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                {bankDetails.bankName} ••••{bankDetails.last4}
                            </span>
                        </div>
                        {nextDebitDate && (
                            <div className="flex items-center justify-between px-4 py-3">
                                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: 'var(--text-secondary)' }}>First debit date</span>
                                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {nextDebitDate}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {isSubscription && (
                    <InfoBanner variant="success">
                        Your subscription is active. You can manage it at any time from the Subscriptions page.
                    </InfoBanner>
                )}
            </main>

            {/* Footer buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-[var(--surface-page)]" style={{ borderTop: '1px solid var(--neutral-300)' }}>
                <div className="max-w-[480px] mx-auto px-6 pt-4 pb-6 flex flex-col gap-3">
                    {isSubscription && product && (
                        <button
                            onClick={() => navigate('/contract', { state: { product, bankDetails } })}
                            className="w-full h-[46px] rounded-[100px] font-semibold flex items-center justify-center gap-2"
                            style={{ background: '#168C34', fontFamily: 'Roboto, sans-serif', fontSize: 16, color: 'white' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Sign your contract
                        </button>
                    )}
                    {isSubscription && (
                        <button
                            onClick={() => navigate('/subscriptions')}
                            className="w-full h-[46px] rounded-[100px] font-semibold"
                            style={{
                                border: '1.5px solid #1860BF',
                                fontFamily: 'Roboto, sans-serif',
                                fontSize: 16,
                                color: '#1860BF',
                                background: 'var(--neutral-100)',
                            }}
                        >
                            View subscriptions
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/products')}
                        className="w-full h-[46px] rounded-[100px] font-semibold text-white"
                        style={{
                            background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)',
                            fontSize: 16,
                            fontFamily: 'Roboto, sans-serif',
                        }}
                    >
                        {isSubscription ? 'Browse more products' : 'Continue browsing'}
                    </button>
                </div>
            </div>
        </div>
    );
}
