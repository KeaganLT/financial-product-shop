import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

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
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <div className="flex items-center px-1 bg-white" style={{ height: 64, borderBottom: '1px solid #E5E5EA' }}>
                <div className="max-w-[480px] mx-auto w-full flex items-center gap-1 px-4">
                    <h1
                        className="flex-1"
                        style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 400, lineHeight: '28px', letterSpacing: '0.35px', color: '#1D1B20' }}
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
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 22, fontWeight: 700, color: '#1C1C1C' }}>
                        {isSubscription ? 'You\'re all set!' : 'Thank you for your order.'}
                    </p>
                    {isSubscription && product && (
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#8E8E93' }}>
                            {product.name} is now active.
                        </p>
                    )}
                </div>

                {/* Subscription details card */}
                {isSubscription && bankDetails && (
                    <div
                        className="w-full rounded-[12px] border flex flex-col divide-y"
                        style={{ borderColor: '#E5E5EA' }}
                    >
                        {product && (
                            <div className="flex items-center justify-between px-4 py-3">
                                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#8E8E93' }}>Monthly premium</span>
                                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, color: '#168C34' }}>
                                    R{Number(product.price).toFixed(2)} / month
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between px-4 py-3">
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#8E8E93' }}>Debit account</span>
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C' }}>
                                {bankDetails.bankName} ••••{bankDetails.last4}
                            </span>
                        </div>
                        {nextDebitDate && (
                            <div className="flex items-center justify-between px-4 py-3">
                                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#8E8E93' }}>First debit date</span>
                                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C' }}>
                                    {nextDebitDate}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {isSubscription && (
                    <div
                        className="w-full flex items-start gap-3 px-4 py-3 rounded-[10px]"
                        style={{ background: '#F0FFF4', border: '1px solid #A3E9B8' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                            <circle cx="10" cy="10" r="10" fill="#168C34" />
                            <path d="M6 10l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#1A5C30', lineHeight: '19px' }}>
                            Your subscription is active. You can manage it at any time from the Subscriptions page.
                        </p>
                    </div>
                )}
            </main>

            {/* Footer buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-white" style={{ borderTop: '1px solid #E5E5EA' }}>
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
                                background: 'white',
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
