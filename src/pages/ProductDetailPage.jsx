import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProductDetailSkeleton } from '../components/Skeletons';
import { getProducts, getProductById } from '../services/productService';
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

// Pick the right dummy data based on product name keywords
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
    const { id }         = useParams();
    const navigate       = useNavigate();
    const { isLoggedIn } = useAuth();

    const [product, setProduct]     = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);
    const [expanded, setExpanded]   = useState(false);
    // expanded controls whether Benefits + Requirements sections are visible
    // collapsed = show description + "Read more"
    // expanded  = show description + Benefits + Requirements + "Read less"

    useEffect(() => {
        // Fetch both the current product and all products (for related section)
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

    // Related products = all products except the current one, max 4
    const relatedProducts = allProducts
        .filter((p) => String(p.id) !== String(id))
        .slice(0, 4);

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
                <div className="px-6 pt-4">
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
                <div className="px-6 pt-6 flex flex-col gap-6">

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
                            } else {
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
                        {isLoggedIn ? 'Add to cart' : 'Add to cart'}
                    </button>
                </div>
            </div>
        </div>
    );
}