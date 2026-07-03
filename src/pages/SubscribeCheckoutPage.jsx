import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProductById } from '../services/productService';
import { takeUpProducts } from '../services/subscriptionService';
import { getBankDetails, saveBankDetails } from '../services/bankingService';
import { useToast } from '../context/ToastContext';
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

    useEffect(() => {
        if (!isLoggedIn) { navigate('/login'); return; }
        getProductById(productId)
            .then(setProduct)
            .catch(() => navigate('/products'))
            .finally(() => setLoading(false));
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--neutral-100)' }}>
                <div className="w-8 h-8 border-4 border-[#1860BF] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="min-h-screen" style={{ background: 'var(--neutral-100)' }}>
            <div
                className="fixed top-0 left-0 right-0 z-50"
                style={{ backgroundColor: 'var(--neutral-100)', borderBottom: '1px solid #E5E5EA' }}
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
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 17, fontWeight: 600, color: 'var(--neutral-800)' }}>
                            {STEP_LABELS[step - 1]}
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
