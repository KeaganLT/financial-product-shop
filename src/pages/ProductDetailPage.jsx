import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ProductDetailSkeleton } from '../components/Skeletons';
import { getProducts, getProductById } from '../services/productService';
import { getProductPlaceholder } from '../assets/placeholders/index.js';
import { getProductDetails } from '../utils/productDetails';
import { useEligibility } from '../hooks/useEligibility';
import RelatedProducts from '../components/product/RelatedProducts.jsx';
import EligibilitySection from '../components/product/EligibilitySection.jsx';

export default function ProductDetailPage() {
    const { id }               = useParams();
    const navigate             = useNavigate();
    const { isLoggedIn, auth } = useAuth();
    const { addItem, isInCart } = useCart();

    const [product, setProduct]         = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [expanded, setExpanded]       = useState(false);

    const { eligibility, eligibilityChecks } = useEligibility(id, product, auth, isLoggedIn);

    useEffect(() => {
        Promise.all([getProductById(id), getProducts()])
            .then(([productData, allData]) => {
                setProduct(productData);
                setAllProducts(Array.isArray(allData) ? allData : []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <ProductDetailSkeleton />;

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--surface-page)] flex flex-col items-center justify-center px-6 gap-4">
                <p className="text-red-500 text-sm text-center">{error}</p>
                <button onClick={() => navigate('/products')} className="text-[#1860BF] text-[14px] font-semibold">
                    ← Back to Products
                </button>
            </div>
        );
    }

    const details = getProductDetails(product.name);
    const hasDiscount = product.discount || product.discountPercent;

    const otherProducts = allProducts.filter((p) => String(p.id) !== String(id));
    const sameFulfilmentType = otherProducts.filter(
        (p) => p.fulfilmentType && p.fulfilmentType === product.fulfilmentType
    );
    const relatedProducts = [...sameFulfilmentType, ...otherProducts.filter((p) => !sameFulfilmentType.includes(p))].slice(0, 4);

    const isPhysical   = (product.name ?? '').toLowerCase().includes('device') || (product.name ?? '').toLowerCase().includes('contract');
    const isInsurance  = (product.name ?? '').toLowerCase().includes('insurance');
    const ctaLabel     = isPhysical
        ? (isLoggedIn && isInCart(product.id) ? 'View cart' : 'Add to cart')
        : (isLoggedIn ? (isInsurance ? 'Get covered' : 'Start investing') : 'Sign in');

    function handleCta() {
        if (!isLoggedIn) { navigate('/login'); return; }
        if (isPhysical) {
            if (isInCart(product.id)) { navigate('/cart'); return; }
            addItem(product);
            navigate('/cart');
        } else {
            navigate(`/checkout/subscribe/${product.id}`);
        }
    }

    const textStyle = (size, weight = 400, color = 'var(--text-secondary)') => ({
        fontFamily: 'Roboto, sans-serif', fontSize: size, fontWeight: weight, color,
    });

    return (
        <div className="min-h-screen bg-[var(--surface-page)]">
            <div
                className="fixed top-0 left-0 right-0 bg-[var(--surface-page)] z-50 flex items-center px-1"
                style={{ height: '64px', borderBottom: '1px solid var(--neutral-300)' }}
            >
                <div className="max-w-[411px] md:max-w-5xl mx-auto w-full flex items-center gap-1">
                    <button onClick={() => navigate('/products')} className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="var(--neutral-700)" />
                        </svg>
                    </button>
                    <h1 className="flex-1 truncate" style={{ ...textStyle('20px', 400, 'var(--text-primary)'), lineHeight: '28px', letterSpacing: '0.35px' }}>
                        {product.name}
                    </h1>
                </div>
            </div>

            <div className="pt-16 pb-24 md:pb-12 max-w-[411px] md:max-w-5xl mx-auto md:grid md:grid-cols-[1fr_1.1fr] md:gap-10 md:px-6 md:pt-24 md:items-start">
                <div className="px-6 pt-4 md:px-0 md:pt-0 md:sticky md:top-24">
                    <div className="relative w-full rounded-[8px] overflow-hidden" style={{ height: '289px' }}>
                        <img
                            src={product.imageUrl || getProductPlaceholder(product.name)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        {hasDiscount && (
                            <div
                                className="absolute top-[14px] left-4 flex items-center justify-center text-center"
                                style={{ backgroundColor: '#1860BF', borderRadius: '4px', width: '43px', height: '44px', padding: '8px' }}
                            >
                                <span style={{ ...textStyle('12px', 700, '#F2F2F7'), lineHeight: '14px', letterSpacing: '0.41px', textAlign: 'center' }}>
                                    25%{'\n'}OFF
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 pt-6 md:px-0 md:pt-0 flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <h2 style={{ ...textStyle('28px', 700, 'var(--text-primary)'), lineHeight: '34px', letterSpacing: '0.41px' }}>
                            {product.name}
                        </h2>

                        <div>
                            <p
                                style={{
                                    ...textStyle('20px', 400),
                                    lineHeight: '28px',
                                    letterSpacing: '0.35px',
                                    ...(expanded ? {} : {
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }),
                                }}
                            >
                                {product.description}
                            </p>
                            {!expanded && (
                                <button
                                    onClick={() => setExpanded(true)}
                                    style={{ ...textStyle('20px', 400, '#1860BF') }}
                                >
                                    Read more
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center justify-between rounded-[12px] border px-6 py-4" style={{ borderColor: 'var(--neutral-300)' }}>
                        <div className="flex flex-col justify-center">
                            <span style={{ ...textStyle('22px', 700, 'var(--text-primary)'), lineHeight: '28px' }}>
                                R {Number(product.price).toFixed(2)}
                            </span>
                            <span style={{ ...textStyle('14px', 400), lineHeight: '20px' }}>per month</span>
                        </div>
                        <button
                            onClick={handleCta}
                            style={{
                                height: '42px', padding: '0 32px', borderRadius: '100px',
                                background: isLoggedIn ? 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)' : '#E5E5EA',
                                fontFamily: 'Roboto, sans-serif', fontSize: '17px', fontWeight: 600,
                                color: isLoggedIn ? '#FFFFFF' : '#AEAEB2', border: 'none',
                                cursor: isLoggedIn ? 'pointer' : 'default',
                            }}
                        >
                            {ctaLabel}
                        </button>
                    </div>

                    {expanded && (
                        <>
                            <div style={{ height: '1px', backgroundColor: 'var(--neutral-300)' }} />

                            <div className="flex flex-col gap-2">
                                <h3 style={{ ...textStyle('20px', 700, 'var(--text-primary)'), lineHeight: '28px', letterSpacing: '0.35px' }}>Benefits</h3>
                                <ul className="flex flex-col gap-1">
                                    {details.benefits.map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-2" style={{ ...textStyle('17px'), lineHeight: '22px', letterSpacing: '0.0035em' }}>
                                            <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)] flex-shrink-0" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ height: '1px', backgroundColor: 'var(--neutral-300)' }} />

                            <div className="flex flex-col gap-2">
                                <h3 style={{ ...textStyle('20px', 700, 'var(--text-primary)'), lineHeight: '28px', letterSpacing: '0.35px' }}>Requirement</h3>
                                <ul className="flex flex-col gap-1">
                                    {details.requirements.map((req, i) => (
                                        <li key={i} className="flex items-start gap-2" style={{ ...textStyle('17px'), lineHeight: '22px', letterSpacing: '0.0035em' }}>
                                            <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)] flex-shrink-0" />
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {isLoggedIn && eligibility !== null && (
                                <>
                                    <div style={{ height: '1px', backgroundColor: 'var(--neutral-300)' }} />
                                    <EligibilitySection eligibility={eligibility} eligibilityChecks={eligibilityChecks} />
                                </>
                            )}

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setExpanded(false)}
                                    className="text-left"
                                    style={{ ...textStyle('20px', 400, '#1860BF'), lineHeight: '28px', letterSpacing: '0.35px' }}
                                >
                                    Read less
                                </button>
                                <div style={{ height: '1px', backgroundColor: 'var(--neutral-300)' }} />
                            </div>
                        </>
                    )}

                    {!expanded && isLoggedIn && eligibility !== null && (
                        <div
                            className="flex items-center gap-2 px-3 py-2 rounded-[8px]"
                            style={{ background: eligibility.isEligible ? '#F0FFF4' : '#FFF5F5', border: `1px solid ${eligibility.isEligible ? '#A3E9B8' : '#FFB3B3'}` }}
                        >
                            {eligibility.isEligible ? (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <circle cx="8" cy="8" r="8" fill="#168C34" />
                                    <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <circle cx="8" cy="8" r="8" fill="#C51C13" />
                                    <path d="M5 5l6 6M11 5l-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            )}
                            <span style={{ ...textStyle('13px', 600, eligibility.isEligible ? '#168C34' : '#C51C13') }}>
                                {eligibility.isEligible ? 'You qualify for this product' : 'You do not currently qualify — tap Read more for details'}
                            </span>
                        </div>
                    )}

                    {!expanded && <div style={{ height: '1px', backgroundColor: 'var(--neutral-300)' }} />}

                    <RelatedProducts products={relatedProducts} />
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-[var(--surface-page)] z-50 md:hidden" style={{ borderTop: '0.5px solid var(--neutral-400)' }}>
                <div className="max-w-[411px] mx-auto flex items-center justify-between px-7" style={{ height: '69px' }}>
                    <div className="flex flex-col justify-center">
                        <span style={{ ...textStyle('20px', 700, 'var(--text-primary)'), lineHeight: '28px', letterSpacing: '0.35px' }}>
                            R {Number(product.price).toFixed(2)}
                        </span>
                        <span style={{ ...textStyle('15px', 400), lineHeight: '20px', letterSpacing: '0.41px' }}>
                            per month
                        </span>
                    </div>
                    <button
                        onClick={handleCta}
                        style={{
                            width: '177.5px', height: '42px', borderRadius: '100px',
                            background: isLoggedIn ? 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)' : '#E5E5EA',
                            fontFamily: 'Roboto, sans-serif', fontSize: '17px', fontWeight: 600,
                            color: isLoggedIn ? '#FFFFFF' : '#AEAEB2', border: 'none',
                            cursor: isLoggedIn ? 'pointer' : 'default',
                        }}
                    >
                        {ctaLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
