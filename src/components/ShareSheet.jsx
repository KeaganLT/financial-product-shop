import { useState } from 'react';
import { getProductUrl, getSocialShareLinks, copyProductLink } from '../services/shareService.js';

const ICONS = {
    whatsapp: <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.1-.2.2-.3.2-.6.1-1.5-.8-2.5-1.4-3.5-3.1-.3-.5.3-.5.7-1.4.1-.2 0-.4 0-.5s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.8-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15l-1.3 4.7L7 20.4A10 10 0 1 0 12 2z"/></svg>,
    x:        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.3 8.3L23 22h-6.8l-5.3-6.9L4.8 22H1.7l7.8-8.9L1 2h7l4.8 6.3L18.9 2zm-1.2 18h1.7L7.4 3.8H5.6L17.7 20z"/></svg>,
    facebook: <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7v-3.5h3.1V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.2h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/></svg>,
    linkedin: <svg width="24" height="24" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3v9zM6.5 8.3a1.7 1.7 0 1 1 0-3.5 1.7 1.7 0 0 1 0 3.5zM19 19h-3v-4.4c0-1-.4-1.8-1.4-1.8s-1.6.8-1.6 1.8V19h-3v-9h3v1.2c.4-.7 1.4-1.4 2.6-1.4 2 0 3.4 1.3 3.4 4V19z"/></svg>,
    email:    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="var(--text-secondary)" strokeWidth="2"/><path d="M3 6l9 7 9-7" stroke="var(--text-secondary)" strokeWidth="2"/></svg>,
};

export default function ShareSheet({ product, open, onClose }) {
    const [copied, setCopied] = useState(false);

    if (!open) return null;

    const links = getSocialShareLinks(product);
    const url   = getProductUrl(product.id);

    async function handleCopy() {
        const ok = await copyProductLink(product);
        if (ok) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        }
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center">
            <button aria-label="Close" className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
            <div
                className="relative w-full md:w-[420px] rounded-t-[16px] md:rounded-[16px] px-5 pt-4 pb-6 flex flex-col gap-4"
                style={{ background: 'var(--neutral-100)' }}
            >
                <div className="mx-auto rounded-full md:hidden" style={{ width: 36, height: 5, background: 'var(--neutral-400)' }} />
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Share {product.name}
                </p>

                <div className="flex justify-between gap-2">
                    {links.map((link) => (
                        <a
                            key={link.key}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-1.5 flex-1"
                        >
                            <span
                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--surface-field)', color: 'var(--text-primary)' }}
                            >
                                {ICONS[link.key]}
                            </span>
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'var(--text-secondary)' }}>{link.label}</span>
                        </a>
                    ))}
                </div>

                <div
                    className="flex items-center gap-2 rounded-[10px] px-3 py-2"
                    style={{ background: 'var(--surface-field)' }}
                >
                    <span className="flex-1 truncate" style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {url}
                    </span>
                    <button
                        onClick={handleCopy}
                        className="flex-shrink-0 px-3 py-1.5 rounded-full font-semibold text-white"
                        style={{ background: copied ? '#168C34' : '#1860BF', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}
                    >
                        {copied ? 'Copied ✓' : 'Copy link'}
                    </button>
                </div>
            </div>
        </div>
    );
}
