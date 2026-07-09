import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProductById } from '../services/productService';
import { takeUpProducts, getEligibility, getSubscriptions } from '../services/subscriptionService';
import { getBankDetails, saveBankDetails } from '../services/bankingService';
import { upsertBankAccountByLast4, assignAccountToProduct } from '../services/bankAccountsService';
import { useToast } from '../context/ToastContext';
import { saveMandateRecord } from '../services/contractStorageService';
import InfoBanner from '../components/InfoBanner.jsx';
import StepIndicator from '../components/checkout/StepIndicator.jsx';
import StepProductReview from '../components/checkout/StepProductReview.jsx';
import StepDebitSetup from '../components/checkout/StepDebitSetup.jsx';
import StepMandate from '../components/checkout/StepMandate.jsx';
import StepConfirm from '../components/checkout/StepConfirm.jsx';

const TOTAL_STEPS = 4;
const STEP_LABELS = ['Review', 'Bank details', 'Mandate', 'Confirm'];

export default function SubscribeCheckoutPage() {
    const { productId } = useParams();
    const navigate      = useNavigate();
    const { auth, isLoggedIn } = useAuth();
    const { showToast } = useToast();

    const [product, setProduct]         = useState(null);
    const [loading, setLoading]         = useState(true);
    const [step, setStep]               = useState(1);
    const [bankDetails, setBankDetails] = useState(null);
    const [submitting, setSubmitting]   = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [gate, setGate]               = useState(null);
    const [gateChecking, setGateChecking] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) { navigate('/login'); return; }
        getProductById(productId)
            .then(setProduct)
            .catch(() => navigate('/products'))
            .finally(() => setLoading(false));

        Promise.all([
            getSubscriptions(auth.token).catch(() => []),
            getEligibility([Number(productId)], auth.token).catch(() => null),
        ]).then(([subs, results]) => {
            const list = Array.isArray(subs) ? subs : [];
            const alreadySubscribed = list.some((sub) => {
                const prod = Array.isArray(sub.product) ? sub.product[0] : sub.product;
                return String(sub.productId ?? prod?.id) === String(productId);
            });
            if (alreadySubscribed) {
                setGate({ type: 'subscribed' });
                setGateChecking(false);
                return;
            }
            const result = Array.isArray(results)
                ? results.find((r) => String(r.productId) === String(productId))
                : null;
            if (result && result.isEligible === false) {
                setGate({ type: 'ineligible' });
            }
            setGateChecking(false);
        });
    }, [productId, isLoggedIn]);

    useEffect(() => {
        if (auth?.customerId) {
            queueMicrotask(() => {
                const saved = getBankDetails(auth.customerId);
                if (saved) setBankDetails(saved);
            });
        }
    }, [auth?.customerId]);

    async function handleActivate() {
        setSubmitting(true);
        setSubmitError('');
        try {
            const result = await takeUpProducts([Number(productId)], auth.token);
            if (result.success) {
                saveBankDetails(auth.customerId, bankDetails);
                const account = await upsertBankAccountByLast4(auth.customerId, bankDetails).catch(() => null);
                if (account) {
                    await assignAccountToProduct(auth.customerId, productId, account.id).catch(() => {});
                }
                await saveMandateRecord(auth.customerId, productId, bankDetails).catch(() => {});
                showToast(`${product.name} activated successfully!`, 'success');
                navigate('/checkout/result?type=subscription', { state: { product, bankDetails } });
            } else {
                const failedChecks = (result.fulfilmentResultList ?? [])
                    .flatMap((r) => r.checks ?? r.checkResults ?? [])
                    .filter((c) => c.passed === false)
                    .map((c) => c.name ?? c.checkName ?? c.type)
                    .filter(Boolean);
                setSubmitError(
                    failedChecks.length > 0
                        ? `Activation failed. The following checks did not pass: ${failedChecks.join(', ')}.`
                        : 'Activation failed. Please check your eligibility and try again.'
                );
            }
        } catch (err) {
            setSubmitError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading || gateChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--neutral-100)' }}>
                <div className="w-8 h-8 border-4 border-[var(--brand-100)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) return null;

    if (gate) {
        return (
            <div className="min-h-screen" style={{ background: 'var(--neutral-100)' }}>
                <div className="max-w-[480px] md:max-w-2xl mx-auto px-6 pt-16 flex flex-col gap-5">
                    <h1 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {product.name}
                    </h1>
                    {gate.type === 'subscribed' ? (
                        <InfoBanner variant="info" title="You already have this subscription">
                            {product.name} is already active on your profile, so it can't be taken up again.
                        </InfoBanner>
                    ) : (
                        <InfoBanner variant="warning" title="You don't currently qualify for this product">
                            One or more eligibility checks are not passing. Review the requirements on the product page and resolve any outstanding items in your Account before trying again.
                        </InfoBanner>
                    )}
                    <div className="flex flex-col gap-3">
                        {gate.type === 'subscribed' ? (
                            <button
                                onClick={() => navigate('/subscriptions')}
                                className="w-full h-[46px] rounded-[100px] font-semibold text-white"
                                style={{ background: 'var(--gradient-brand)', fontFamily: 'Roboto, sans-serif', fontSize: 16 }}
                            >
                                View my subscriptions
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate(`/products/${productId}`)}
                                className="w-full h-[46px] rounded-[100px] font-semibold text-white"
                                style={{ background: 'var(--gradient-brand)', fontFamily: 'Roboto, sans-serif', fontSize: 16 }}
                            >
                                View eligibility details
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/products')}
                            className="w-full h-[46px] rounded-[100px] font-semibold border"
                            style={{ borderColor: 'var(--brand-100)', color: 'var(--brand-100)', fontFamily: 'Roboto, sans-serif', fontSize: 16, background: 'var(--neutral-100)' }}
                        >
                            Browse other products
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--neutral-100)' }}>
            <div
                className="fixed top-0 left-0 right-0 z-50"
                style={{ backgroundColor: 'var(--neutral-100)', borderBottom: '1px solid var(--neutral-300)' }}
            >
                <div className="max-w-[480px] md:max-w-2xl mx-auto px-4 flex items-center" style={{ height: 64 }}>
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : navigate(`/products/${productId}`)}
                        className="w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="var(--neutral-700)" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 17, fontWeight: 600, color: 'var(--neutral-800)' }}>
                            {STEP_LABELS[step - 1]}
                        </p>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: 'var(--text-secondary)' }}>
                            Step {step} of {TOTAL_STEPS}
                        </p>
                    </div>
                </div>
                <div className="max-w-[480px] md:max-w-2xl mx-auto">
                    <StepIndicator current={step} total={TOTAL_STEPS} />
                </div>
            </div>

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
