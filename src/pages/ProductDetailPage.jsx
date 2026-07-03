import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ProductDetailSkeleton } from '../components/Skeletons';
import { getProducts, getProductById } from '../services/productService';
import { getEligibility, probeEligibilityDetails } from '../services/subscriptionService';
import { getProfile } from '../services/customerService';
import productPlaceholder from '../assets/product-placeholder.svg';

// Dummy data for benefits and requirements per product
// These will eventually come from Firebase or the API
// Keyed by fulfilment type so all products of same type share the same data
const PRODUCT_DETAILS = {
    default: {
        benefits: [
            'Theft and loss recovery',
            'Comprehensive coverage',
            'Hardware malfunction coverage',
        ],
        requirements: [
            'Minimum age of 18 years old',
            'South African resident',
            'Have an account with us in good standing',
        ],
    },
    insurance: {
        benefits: [
            'Full device replacement',
            'Accidental damage cover',
            'International coverage',
            'No excess on first claim',
        ],
        requirements: [
            'Minimum age of 18 years old',
            'South African resident',
            'Active qualifying cheque account',
            'No outstanding claims',
        ],
    },
    investment: {
        benefits: [
            'Competitive interest rates',
            'Flexible investment terms',
            'Tax-efficient returns',
            'Monthly interest payments',
        ],
        requirements: [
            'Minimum age of 18 years old',
            'South African resident',
            'Valid SA ID number',
            'Minimum investment of R1,000',
        ],
    },
};

const PRODUCT_CUSTOMER_TYPES = {
    'Retail Short Term Insurance':    ['INDIVIDUAL'],
    'Retail Long-Term Insurance':     ['INDIVIDUAL'],
    'Commercial Short Term Insurance':['SOLE PROP', 'NON-PROFIT', 'CIPC'],
    'Commercial Long-Term Insurance': ['SOLE PROP', 'NON-PROFIT', 'CIPC'],
    'Device Contract':                ['INDIVIDUAL', 'SOLE PROP', 'NON-PROFIT', 'CIPC'],
    'Short-Term Investment Product':  ['INDIVIDUAL', 'SOLE PROP', 'NON-PROFIT', 'CIPC'],
    'Long-Term investment Product':   ['INDIVIDUAL', 'SOLE PROP', 'NON-PROFIT', 'CIPC'],
    'Islamic Investment Product':     ['INDIVIDUAL', 'NON-PROFIT'],
    'VIP Investment Product':         ['INDIVIDUAL'],
};

function getRequiredCustomerTypes(productName = '') {
    const entry = Object.entries(PRODUCT_CUSTOMER_TYPES).find(([key]) =>
        productName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(productName.toLowerCase())
    );
    return entry ? entry[1] : null;
}

function getProductDetails(productName = '') {
    const name = productName.toLowerCase();
    if (name.includes('insurance') || name.includes('device') || name.includes('contract')) {
        return PRODUCT_DETAILS.insurance;
    }
    if (name.includes('investment') || name.includes('annuity') || name.includes('fund')) {
        return PRODUCT_DETAILS.investment;
    }
    return PRODUCT_DETAILS.default;
}

export default function ProductDetailPage() {
    const { id }              = useParams();
    const navigate            = useNavigate();
    const { isLoggedIn, auth } = useAuth();
    const { addItem, isInCart } = useCart();

    const [product, setProduct]         = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [expanded, setExpanded]       = useState(false);
    const [eligibility, setEligibility] = useState(null); // null = not loaded yet
    const [failedChecks, setFailedChecks] = useState([]);
    const [customerTypeIssue, setCustomerTypeIssue] = useState(null); // { required, current }

    useEffect(() => {
        Promise.all([
            getProductById(id),
            getProducts(),
        ])
            .then(([productData, allData]) => {
                setProduct(productData);
                setAllProducts(Array.isArray(allData) ? allData : []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!isLoggedIn || !id) return;
        Promise.all([
            getEligibility([Number(id)], auth.token),
            getProfile(auth.token),
        ])
            .then(async ([results, profile]) => {
                const result = Array.isArray(results) ? results.find((r) => String(r.productId) === String(id)) : null;
                setEligibility(result ?? null);

                if (result && !result.isEligible && product) {
                    const required = getRequiredCustomerTypes(product.name);
                    const currentTypeName = (profile?.customerType?.name ?? '').toUpperCase();
                    if (required) {
                        const normalised = required.map((t) => t.toUpperCase());
                        if (!currentTypeName) {
                            setCustomerTypeIssue({ required, current: null });
                        } else if (!normalised.includes(currentTypeName)) {
                            setCustomerTypeIssue({ required, current: profile.customerType.name });
                        } else {
                            setCustomerTypeIssue(null);
                            const checks = await probeEligibilityDetails(Number(id), auth.token);
                            setFailedChecks(checks);
                        }
                    } else {
                        const checks = await probeEligibilityDetails(Number(id), auth.token);
                        setFailedChecks(checks);
                    }
                }
            })
            .catch(() => setEligibility(null));
    }, [isLoggedIn, id, auth?.token, product]);

    if (loading) return <ProductDetailSkeleton />;

    if (error) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-4">
                <p className="text-red-500 text-sm text-center">{error}</p>
                <button
                    onClick={() => navigate('/products')}
                    className="text-[#1860BF] text-[14px] font-semibold"
                >
                    ← Back to Products
                </button>
            </div>
        );
    }

    const details      = getProductDetails(product.name);
    const hasDiscount  = product.discount || product.discountPercent;

    const otherProducts = allProducts.filter((p) => String(p.id) !== String(id));
    const sameFulfilmentType = otherProducts.filter(
        (p) => p.fulfilmentType && p.fulfilmentType === product.fulfilmentType
    );
    const fallback = otherProducts.filter((p) => !sameFulfilmentType.includes(p));
    const relatedProducts = [...sameFulfilmentType, ...fallback].slice(0, 4);

    return (
        <div className="min-h-screen bg-white">

            {/* ── Sticky top app bar ──────────────────────────────────────────────── */}
            {/* Matches Figma: white bg, height 64px, back arrow #49454F, title #1D1B20 Roboto 20px */}
            <div
                className="fixed top-0 left-0 right-0 bg-white z-50 flex items-center px-1"
                style={{ height: '64px', borderBottom: '1px solid #E5E5EA' }}
            >
                <div className="max-w-[411px] mx-auto w-full flex items-center gap-1">
                    {/* Back button — 48x48 touch target wrapping 24x24 icon */}
                    <button
                        onClick={() => navigate('/products')}
                        className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                                fill="#49454F"
                            />
                        </svg>
                    </button>

                    {/* Headline — Roboto 20px Regular, color #1D1B20, truncated */}
                    <h1
                        className="flex-1 truncate"
                        style={{
                            fontFamily: 'Roboto, sans-serif',
                            fontSize: '20px',
                            fontWeight: 400,
                            lineHeight: '28px',
                            letterSpacing: '0.35px',
                            color: '#1D1B20',
                        }}
                    >
                        {product.name}
                    </h1>
                </div>
            </div>

            {/* ── Scrollable content — pt-16 clears fixed header ─────────────────── */}
            {/* pb-24 clears the fixed sticky footer */}
            <div className="pt-16 pb-24 max-w-[411px] mx-auto">

                {/* ── Product image ──────────────────────────────────────────────────── */}
                {/* Figma: width 364px, height 289px, border-radius 8px, mx 24px */}
                <div className="px-6 pt-4 md:max-w-2xl">
                    <div className="relative w-full rounded-[8px] overflow-hidden" style={{ height: '289px' }}>
                        <img
                            src={product.imageUrl || productPlaceholder}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        {/* Discount badge — Figma: #1860BF bg, border-radius 4px, top-left 16px/14px */}
                        {hasDiscount && (
                            <div
                                className="absolute top-[14px] left-4 flex items-center justify-center text-center"
                                style={{
                                    backgroundColor: '#1860BF',
                                    borderRadius: '4px',
                                    width: '43px',
                                    height: '44px',
                                    padding: '8px',
                                }}
                            >
                <span
                    style={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '12px',
                        fontWeight: 700,
                        lineHeight: '14px',
                        letterSpacing: '0.41px',
                        color: '#F2F2F7',
                        textAlign: 'center',
                    }}
                >
                  25%{'\n'}OFF
                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Product title + description ────────────────────────────────────── */}
                {/* Figma: padding 24px sides, gap 24px between sections */}
                <div className="px-6 pt-6 flex flex-col gap-6 md:max-w-2xl">

                    {/* Title block */}
                    <div className="flex flex-col gap-4">
                        {/* Product name — Figma: Roboto Bold 28px, #1C1C1C */}
                        <h2
                            style={{
                                fontFamily: 'Roboto, sans-serif',
                                fontSize: '28px',
                                fontWeight: 700,
                                lineHeight: '34px',
                                letterSpacing: '0.41px',
                                color: '#1C1C1C',
                            }}
                        >
                            {product.name}
                        </h2>

                        {/* Description — Figma: Roboto Regular 20px, #8E8E93 */}
                        {/* Collapsed: 3 lines + "... Read more" */}
                        {/* Expanded: full text */}
                        <div>
                            <p
                                style={{
                                    fontFamily: 'Roboto, sans-serif',
                                    fontSize: '20px',
                                    fontWeight: 400,
                                    lineHeight: '28px',
                                    letterSpacing: '0.35px',
                                    color: '#8E8E93',
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

                            {/* Read more inline — only shown when collapsed */}
                            {!expanded && (
                                <button
                                    onClick={() => setExpanded(true)}
                                    style={{ color: '#1860BF', fontSize: '20px', fontWeight: 400, fontFamily: 'Roboto, sans-serif' }}
                                >
                                    Read more
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Expanded content: Benefits + Requirements ───────────────────── */}
                    {expanded && (
                        <>
                            {/* Divider */}
                            <div style={{ height: '1px', backgroundColor: '#D9D9D9' }} />

                            {/* Benefits section */}
                            {/* Figma: heading Roboto Bold 20px #000000, list Roboto Regular 17px #8E8E93 */}
                            <div className="flex flex-col gap-2">
                                <h3
                                    style={{
                                        fontFamily: 'Roboto, sans-serif',
                                        fontSize: '20px',
                                        fontWeight: 700,
                                        lineHeight: '28px',
                                        letterSpacing: '0.35px',
                                        color: '#000000',
                                    }}
                                >
                                    Benefits
                                </h3>
                                <ul className="flex flex-col gap-1">
                                    {details.benefits.map((benefit, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2"
                                            style={{
                                                fontFamily: 'Roboto, sans-serif',
                                                fontSize: '17px',
                                                fontWeight: 400,
                                                lineHeight: '22px',
                                                letterSpacing: '0.0035em',
                                                color: '#8E8E93',
                                            }}
                                        >
                                            <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-[#8E8E93] flex-shrink-0" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Divider */}
                            <div style={{ height: '1px', backgroundColor: '#D9D9D9' }} />

                            {/* Requirements section */}
                            <div className="flex flex-col gap-2">
                                <h3
                                    style={{
                                        fontFamily: 'Roboto, sans-serif',
                                        fontSize: '20px',
                                        fontWeight: 700,
                                        lineHeight: '28px',
                                        letterSpacing: '0.35px',
                                        color: '#000000',
                                    }}
                                >
                                    Requirement
                                </h3>
                                <ul className="flex flex-col gap-1">
                                    {details.requirements.map((req, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2"
                                            style={{
                                                fontFamily: 'Roboto, sans-serif',
                                                fontSize: '17px',
                                                fontWeight: 400,
                                                lineHeight: '22px',
                                                letterSpacing: '0.0035em',
                                                color: '#8E8E93',
                                            }}
                                        >
                                            <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-[#8E8E93] flex-shrink-0" />
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* ── Eligibility status (logged-in only) ─────────────────── */}
                            {isLoggedIn && eligibility !== null && (
                                <>
                                    <div style={{ height: '1px', backgroundColor: '#D9D9D9' }} />
                                    <div className="flex flex-col gap-3">
                                        <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: '20px', fontWeight: 700, lineHeight: '28px', letterSpacing: '0.35px', color: '#000000' }}>
                                            Your eligibility
                                        </h3>
                                        <div
                                            className="flex items-center gap-2"
                                            style={{ fontFamily: 'Roboto, sans-serif', fontSize: '15px', fontWeight: 600, color: eligibility.isEligible ? '#168C34' : '#C51C13' }}
                                        >
                                            {eligibility.isEligible ? (
                                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="9" fill="#168C34" /><path d="M5 9l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            ) : (
                                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="9" fill="#C51C13" /><path d="M6 6l6 6M12 6l-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                            )}
                                            {eligibility.isEligible ? 'You qualify for this product' : 'You do not currently qualify'}
                                        </div>

                                        {/* Customer type mismatch — shown as primary reason */}
                                        {!eligibility.isEligible && customerTypeIssue && (
                                            <div className="flex flex-col gap-2 px-3 py-3 rounded-[8px]" style={{ background: '#FFF8E4', border: '1px solid #FFD980' }}>
                                                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, color: '#1C1C1C' }}>
                                                    {customerTypeIssue.current
                                                        ? `Your customer type (${customerTypeIssue.current}) does not qualify for this product.`
                                                        : 'You need to set a customer type to qualify for this product.'}
                                                </p>
                                                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#8E8E93' }}>
                                                    Required: {customerTypeIssue.required.join(', ')}
                                                </p>
                                                <button
                                                    onClick={() => navigate('/account')}
                                                    style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1860BF', textDecoration: 'underline', textAlign: 'left' }}
                                                >
                                                    {customerTypeIssue.current ? 'Manage account →' : 'Set customer type →'}
                                                </button>
                                            </div>
                                        )}

                                        {/* Per-check breakdown from takeUpProducts 422 — only shown when customer type is fine */}
                                        {!eligibility.isEligible && !customerTypeIssue && failedChecks.length > 0 && (
                                            <div className="flex flex-col gap-2">
                                                {failedChecks.map((check, i) => {
                                                    const name = check.name ?? check.checkName ?? check.type ?? '';
                                                    const passed = check.passed ?? check.result ?? false;
                                                    const lower = name.toLowerCase();
                                                    const isKyc = lower.includes('kyc') || lower.includes('identity');
                                                    const isAccount = lower.includes('account') || lower.includes('product');
                                                    return (
                                                        <div key={i} className="flex items-start gap-2 py-1">
                                                            {passed ? (
                                                                <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#168C34" /><path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                            ) : (
                                                                <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#FF9500" /><path d="M8 5v3M8 10.5v.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                                            )}
                                                            <div className="flex flex-col gap-0.5">
                                                                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px', fontWeight: 500, color: '#1C1C1C' }}>
                                                                    {name}
                                                                </span>
                                                                {!passed && (isKyc || isAccount) && (
                                                                    <button
                                                                        onClick={() => navigate(isKyc ? '/kyc' : '/account')}
                                                                        style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', fontWeight: 600, color: '#1860BF', textDecoration: 'underline', textAlign: 'left' }}
                                                                    >
                                                                        {isKyc ? 'Complete identity verification →' : 'Manage accounts →'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {!eligibility.isEligible && !customerTypeIssue && failedChecks.length === 0 && (
                                            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#8E8E93' }}>
                                                Complete your profile and identity verification to qualify.
                                            </p>
                                        )}

                                        {!eligibility.isEligible && !customerTypeIssue && (
                                            <button
                                                onClick={() => navigate('/account')}
                                                className="self-start px-4 py-2 rounded-full text-white text-[13px] font-semibold"
                                                style={{ background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)', fontFamily: 'Roboto, sans-serif' }}
                                            >
                                                Go to Account
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Read less — Figma: Roboto Regular 20px #1860BF */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setExpanded(false)}
                                    className="text-left"
                                    style={{
                                        fontFamily: 'Roboto, sans-serif',
                                        fontSize: '20px',
                                        fontWeight: 400,
                                        lineHeight: '28px',
                                        letterSpacing: '0.35px',
                                        color: '#1860BF',
                                    }}
                                >
                                    Read less
                                </button>
                                <div style={{ height: '1px', backgroundColor: '#D9D9D9' }} />
                            </div>
                        </>
                    )}

                    {/* Compact eligibility badge when collapsed */}
                    {!expanded && isLoggedIn && eligibility !== null && (
                        <div
                            className="flex items-center gap-2 px-3 py-2 rounded-[8px]"
                            style={{ background: eligibility.isEligible ? '#F0FFF4' : '#FFF5F5', border: `1px solid ${eligibility.isEligible ? '#A3E9B8' : '#FFB3B3'}` }}
                        >
                            {eligibility.isEligible ? (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#168C34" /><path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#C51C13" /><path d="M5 5l6 6M11 5l-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            )}
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, color: eligibility.isEligible ? '#168C34' : '#C51C13' }}>
                                {eligibility.isEligible ? 'You qualify for this product' : 'You do not currently qualify — tap Read more for details'}
                            </span>
                        </div>
                    )}

                    {/* Divider above related (always shown) */}
                    {!expanded && <div style={{ height: '1px', backgroundColor: '#D9D9D9' }} />}

                    {/* ── Related products ────────────────────────────────────────────── */}
                    {/* Figma: heading Roboto Bold 20px #000000, horizontal scroll cards */}
                    {relatedProducts.length > 0 && (
                        <div className="flex flex-col gap-4 pb-2">
                            <h3
                                style={{
                                    fontFamily: 'Roboto, sans-serif',
                                    fontSize: '20px',
                                    fontWeight: 700,
                                    lineHeight: '28px',
                                    letterSpacing: '0.35px',
                                    color: '#000000',
                                }}
                            >
                                Related product
                            </h3>

                            {/* Horizontal scroll — Figma: gap 16px, padding-bottom 20px, overflow-x scroll */}
                            <div className="flex gap-4 overflow-x-auto pb-5 no-scrollbar -mx-6 px-6">
                                {relatedProducts.map((related) => (
                                    <button
                                        key={related.id}
                                        onClick={() => navigate(`/products/${related.id}`)}
                                        className="flex-shrink-0 text-left"
                                        style={{
                                            width: '284px',
                                            height: '192px',
                                            backgroundColor: '#FFFFFF',
                                            border: '1px solid #C7C7CC',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                        }}
                                    >
                                        {/* Card image — Figma: 260x120, border-radius 8px */}
                                        <div
                                            className="w-full overflow-hidden"
                                            style={{ height: '120px', borderRadius: '8px', backgroundColor: '#D9D9D9' }}
                                        >
                                            <img
                                                src={related.imageUrl || productPlaceholder}
                                                alt={related.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Card text */}
                                        <div className="flex flex-col gap-0">
                                            {/* Title — Roboto Semibold 17px #000000 */}
                                            <p
                                                className="truncate"
                                                style={{
                                                    fontFamily: 'Roboto, sans-serif',
                                                    fontSize: '17px',
                                                    fontWeight: 600,
                                                    lineHeight: '22px',
                                                    letterSpacing: '0.0035em',
                                                    color: '#000000',
                                                }}
                                            >
                                                {related.name}
                                            </p>
                                            {/* Price — Roboto Regular 13px #8E8E93 */}
                                            <p
                                                style={{
                                                    fontFamily: 'Roboto, sans-serif',
                                                    fontSize: '13px',
                                                    fontWeight: 400,
                                                    lineHeight: '18px',
                                                    letterSpacing: '0.41px',
                                                    color: '#8E8E93',
                                                }}
                                            >
                                                from R{Number(related.price).toFixed(0)} p/m
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Sticky footer ──────────────────────────────────────────────────── */}
            {/* Figma: white bg, border-top 0.5px #C7C7CC, height 69px */}
            {/* Left: price stack (R 350.00 bold 20px + "per month" grey 15px) */}
            {/* Right: gradient button (guest=grey disabled, logged-in=blue gradient) */}
            <div
                className="fixed bottom-0 left-0 right-0 bg-white z-50"
                style={{ borderTop: '0.5px solid #C7C7CC' }}
            >
                <div
                    className="max-w-[411px] mx-auto flex items-center justify-between px-7"
                    style={{ height: '69px' }}
                >
                    {/* Price stack */}
                    <div className="flex flex-col justify-center">
            <span
                style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '20px',
                    fontWeight: 700,
                    lineHeight: '28px',
                    letterSpacing: '0.35px',
                    color: '#000000',
                }}
            >
              R {Number(product.price).toFixed(2)}
            </span>
                        <span
                            style={{
                                fontFamily: 'Roboto, sans-serif',
                                fontSize: '15px',
                                fontWeight: 400,
                                lineHeight: '20px',
                                letterSpacing: '0.41px',
                                color: '#8E8E93',
                            }}
                        >
              per month
            </span>
                    </div>

                    {/* Add to cart button */}
                    <button
                        onClick={() => {
                            if (!isLoggedIn) {
                                navigate('/login');
                            } else if (isInCart(product.id)) {
                                navigate('/cart');
                            } else {
                                addItem(product);
                                navigate('/cart');
                            }
                        }}
                        style={{
                            width: '177.5px',
                            height: '42px',
                            borderRadius: '100px',
                            background: isLoggedIn
                                ? 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)'
                                : '#E5E5EA',
                            fontFamily: 'Roboto, sans-serif',
                            fontSize: '17px',
                            fontWeight: 600,
                            lineHeight: '22px',
                            letterSpacing: '0.0035em',
                            color: isLoggedIn ? '#FFFFFF' : '#AEAEB2',
                            border: 'none',
                            cursor: isLoggedIn ? 'pointer' : 'default',
                        }}
                    >
                        {isLoggedIn && isInCart(product.id) ? 'View cart' : 'Add to cart'}
                    </button>
                </div>
            </div>
        </div>
    );
}