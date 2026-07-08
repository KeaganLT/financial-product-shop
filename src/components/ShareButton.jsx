import { useState } from 'react';
import { shareProduct } from '../services/shareService.js';
import ShareSheet from './ShareSheet.jsx';

const SHARE_ICON = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M8.6 10.6l6.8-4M8.6 13.4l6.8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export default function ShareButton({ product, variant = 'icon', className = '' }) {
    const [sheetOpen, setSheetOpen] = useState(false);

    async function handleClick(e) {
        e.stopPropagation();
        e.preventDefault();
        const result = await shareProduct(product);
        if (!result.shared && result.method === 'fallback') {
            setSheetOpen(true);
        }
    }

    return (
        <>
            {variant === 'labelled' ? (
                <button
                    onClick={handleClick}
                    className={`flex items-center justify-center gap-2 ${className}`}
                    style={{ color: '#1860BF', fontFamily: 'Roboto, sans-serif', fontSize: 15, fontWeight: 600 }}
                    aria-label={`Share ${product.name}`}
                >
                    <span style={{ color: '#1860BF' }}>{SHARE_ICON}</span>
                    Share
                </button>
            ) : (
                <button
                    onClick={handleClick}
                    className={`flex items-center justify-center ${className}`}
                    style={{ color: 'var(--text-secondary)' }}
                    aria-label={`Share ${product.name}`}
                >
                    {SHARE_ICON}
                </button>
            )}
            <ShareSheet product={product} open={sheetOpen} onClose={() => setSheetOpen(false)} />
        </>
    );
}
