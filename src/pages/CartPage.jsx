import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import productPlaceholder from '../assets/product-placeholder.svg';

const EmptyCartIllustration = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="56" stroke="#E5E5EA" strokeWidth="8" />
        <path d="M38 42h5l7 30h22l6-22H48" stroke="#1860BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="57" cy="78" r="3" fill="#1860BF" />
        <circle cx="71" cy="78" r="3" fill="#1860BF" />
    </svg>
);

const SWIPE_THRESHOLD = 40;  // px dragged before snap-open
const REMOVE_WIDTH    = 99;  // px — matches Figma

function CartItemCard({ product, onRemove }) {
    const [offset, setOffset] = useState(0);   // how far the row is translated left
    const [open, setOpen]     = useState(false);
    const startX = useRef(null);
    const startOffset = useRef(0);

    function onTouchStart(e) {
        startX.current = e.touches[0].clientX;
        startOffset.current = offset;
    }

    function onTouchMove(e) {
        const dx = e.touches[0].clientX - startX.current;
        const next = Math.max(0, Math.min(REMOVE_WIDTH, startOffset.current - dx));
        setOffset(next);
    }

    function onTouchEnd() {
        if (offset > SWIPE_THRESHOLD) {
            setOffset(REMOVE_WIDTH);
            setOpen(true);
        } else {
            setOffset(0);
            setOpen(false);
        }
    }

    function closeSwipe() {
        setOffset(0);
        setOpen(false);
    }

    return (
        <div className="flex flex-col gap-4 overflow-hidden">
            <div className="relative">
                {/* Red remove panel — revealed by swiping left */}
                <div
                    className="absolute right-0 top-0 bottom-0 flex flex-col items-center justify-center gap-1"
                    style={{ width: REMOVE_WIDTH, background: '#C51C13' }}
                >
                    {/* Trash icon */}
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path d="M10 12h12M14 12V10h4v2M13 12l1 10h6l1-10" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <button
                        onClick={() => onRemove(product.id)}
                        className="text-white"
                        style={{ fontSize: 13, lineHeight: '18px', letterSpacing: '0.41px', fontFamily: 'Roboto, sans-serif' }}
                    >
                        Remove
                    </button>
                </div>

                {/* Swipeable row */}
                <div
                    className="relative bg-white flex items-start gap-[27px]"
                    style={{ transform: `translateX(-${offset}px)`, transition: startX.current === null ? 'transform 0.2s' : 'none' }}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onClick={open ? closeSwipe : undefined}
                >
                    {/* Product image */}
                    <div
                        className="flex-shrink-0 rounded-[8px] overflow-hidden bg-[#D9D9D9]"
                        style={{ width: 125, height: 107 }}
                    >
                        <img
                            src={product.imageUrl || productPlaceholder}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Details + stepper */}
                    <div className="flex flex-col gap-[21px] flex-1 min-w-0">
                        {/* Name + price */}
                        <div className="flex flex-col gap-1">
                            <p
                                className="font-semibold text-black leading-[22px]"
                                style={{ fontSize: 17, letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}
                            >
                                {product.name}
                            </p>
                            <p
                                className="text-[#8E8E93]"
                                style={{ fontSize: 11, lineHeight: '13px', letterSpacing: '0.41px', fontFamily: 'Roboto, sans-serif' }}
                            >
                                from R{Number(product.price).toFixed(0)} p/m
                            </p>
                        </div>

                        {/* Quantity stepper — qty fixed at 1; pressing − removes the item */}
                        <div className="flex items-center" style={{ width: 64, height: 18 }}>
                            <button
                                onClick={() => onRemove(product.id)}
                                className="w-4 h-4 flex items-center justify-center"
                                aria-label={`Remove ${product.name}`}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <rect x="0.5" y="0.5" width="15" height="15" rx="7.5" stroke="#1C1C1C" />
                                    <rect x="4" y="7.5" width="8" height="1" fill="#1C1C1C" />
                                </svg>
                            </button>

                            <div className="flex-1 flex items-center justify-center">
                                <span
                                    className="text-black text-center"
                                    style={{ fontSize: 13, lineHeight: '18px', letterSpacing: '0.41px', fontFamily: 'Roboto, sans-serif' }}
                                >
                                    1
                                </span>
                            </div>

                            <button
                                disabled
                                className="w-4 h-4 flex items-center justify-center opacity-30"
                                aria-label="Cannot increase quantity"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <rect x="0.5" y="0.5" width="15" height="15" rx="7.5" stroke="#1C1C1C" />
                                    <rect x="4" y="7.5" width="8" height="1" fill="#1C1C1C" />
                                    <rect x="7.5" y="4" width="1" height="8" fill="#1C1C1C" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#D9D9D9]" />
        </div>
    );
}

function needsVerification(item) {
    return !(item.fulfilmentType || '').toLowerCase().includes('immediate');
}

export default function CartPage() {
    const navigate = useNavigate();
    const { items, removeItem } = useCart();
    const isEmpty = items.length === 0;

    const requiresVerification = items.some(needsVerification);
    const monthlyTotal = items.reduce((sum, p) => sum + Number(p.price || 0), 0);
    const onceOffTotal = items.reduce((sum, p) => sum + Number(p.onceOffPrice || 0), 0);
    const grandTotal = monthlyTotal;

    return (
        <div className="min-h-screen bg-white flex flex-col">

            {/* Top app bar */}
            <div
                className="flex items-center px-1 bg-white"
                style={{ height: 64, borderBottom: '1px solid #E5E5EA' }}
            >
                <div className="max-w-[411px] mx-auto w-full flex items-center gap-1">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 flex items-center justify-center"
                        aria-label="Go back"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#49454F" />
                        </svg>
                    </button>
                    <h1
                        className="flex-1"
                        style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 400, lineHeight: '28px', letterSpacing: '0.35px', color: '#1D1B20' }}
                    >
                        Cart
                    </h1>
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 max-w-[411px] mx-auto w-full px-6 pt-7 pb-40">
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center gap-6 pt-24">
                        <EmptyCartIllustration />
                        <p
                            className="font-bold text-[#1C1C1C]"
                            style={{ fontSize: 20, letterSpacing: '0.35px', fontFamily: 'Roboto, sans-serif' }}
                        >
                            Your cart is empty
                        </p>
                        <button
                            onClick={() => navigate('/products')}
                            className="w-full h-[42px] rounded-[100px] font-semibold text-white"
                            style={{
                                background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)',
                                fontSize: 17,
                                letterSpacing: '0.0035em',
                                fontFamily: 'Roboto, sans-serif',
                            }}
                        >
                            Continue browsing
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {items.map((item) => (
                            <CartItemCard key={item.id} product={item} onRemove={removeItem} />
                        ))}

                        {requiresVerification && (
                            <div
                                className="flex flex-col gap-2 rounded-[8px] px-6 py-3"
                                style={{ background: '#E4EFFF', border: '1px solid #A6D0FF' }}
                            >
                                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, fontWeight: 600, lineHeight: '20px', letterSpacing: '0.0035em', color: '#1C1C1C' }}>
                                    One or more products in your cart requires verification.
                                </p>
                                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, lineHeight: '13px', letterSpacing: '0.41px', color: '#1C1C1C' }}>
                                    In order to complete your purchase, please complete the identity verification process.
                                </p>
                                <button
                                    onClick={() => navigate('/kyc')}
                                    style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, lineHeight: '18px', letterSpacing: '0.41px', textDecoration: 'underline', color: '#1860BF', textAlign: 'left' }}
                                >
                                    Verify now
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Sticky footer — total + pay button */}
            {!isEmpty && (
                <div
                    className="fixed bottom-0 left-0 right-0 bg-white"
                    style={{ borderTop: '1px solid #E5E5EA' }}
                >
                    <div className="max-w-[411px] mx-auto px-7 pt-4 pb-6 flex flex-col gap-4">
                        {/* Totals row */}
                        <div className="flex justify-between items-start">
                            <span
                                className="font-semibold text-black"
                                style={{ fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}
                            >
                                Total
                            </span>
                            <div className="flex flex-col gap-[5px] items-end">
                                <div className="flex items-center gap-5">
                                    <span
                                        className="text-[#8E8E93]"
                                        style={{ fontSize: 13, lineHeight: '18px', letterSpacing: '0.41px', fontFamily: 'Roboto, sans-serif' }}
                                    >
                                        Once off
                                    </span>
                                    <span
                                        className="font-semibold text-black"
                                        style={{ fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}
                                    >
                                        R {onceOffTotal.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span
                                        className="text-[#8E8E93]"
                                        style={{ fontSize: 13, lineHeight: '18px', letterSpacing: '0.41px', fontFamily: 'Roboto, sans-serif' }}
                                    >
                                        Monthly
                                    </span>
                                    <span
                                        className="font-semibold text-black"
                                        style={{ fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em', fontFamily: 'Roboto, sans-serif' }}
                                    >
                                        R {monthlyTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Pay now button */}
                        <button
                            onClick={() => !requiresVerification && navigate('/checkout')}
                            disabled={requiresVerification}
                            className="w-full h-[42px] rounded-[100px] font-semibold disabled:opacity-60"
                            style={{
                                background: requiresVerification ? '#E5E5EA' : 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)',
                                color: requiresVerification ? '#AEAEB2' : '#fff',
                                fontSize: 17,
                                letterSpacing: '0.0035em',
                                fontFamily: 'Roboto, sans-serif',
                            }}
                        >
                            Pay now (R{grandTotal.toFixed(2)})
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
