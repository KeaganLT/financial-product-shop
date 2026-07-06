import { useState } from 'react';

export default function PasswordInput({ value, onChange, placeholder, autoComplete }) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative w-full">
            <input
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className="w-full h-[44px] rounded-[10px] pl-3 pr-11 border"
                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: 'var(--neutral-400)', background: 'var(--neutral-100)', color: 'var(--text-primary)' }}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Hide password' : 'Show password'}
                className="absolute right-0 top-0 h-[44px] w-11 flex items-center justify-center"
                style={{ color: 'var(--text-secondary)' }}
            >
                {visible ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M4 20L20 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
                    </svg>
                )}
            </button>
        </div>
    );
}
