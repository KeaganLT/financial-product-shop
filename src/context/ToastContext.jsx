import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});

    const dismiss = useCallback((id) => {
        clearTimeout(timers.current[id]);
        delete timers.current[id];
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // type: 'success' | 'error' | 'info' | 'warning'
    const showToast = useCallback((message, type = 'success', duration = 3500) => {
        const id = ++idCounter;
        setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
        timers.current[id] = setTimeout(() => dismiss(id), duration);
        return id;
    }, [dismiss]);

    return (
        <ToastContext.Provider value={{ showToast, dismiss }}>
            {children}
            <ToastStack toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside ToastProvider');
    return ctx;
}

const STYLES = {
    success: { bg: '#F0FFF4', border: '#A3E9B8', icon: '#168C34', text: '#1A5C30' },
    error:   { bg: '#FFF5F5', border: '#FFB3B3', icon: '#C51C13', text: '#7A1010' },
    warning: { bg: '#FFF8E6', border: '#FFD97A', icon: '#F5A623', text: '#7A4F00' },
    info:    { bg: '#EFF4FF', border: '#C7D9FF', icon: 'var(--brand-100)', text: '#1240A0' },
};

const ICONS = {
    success: (c) => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="8" fill={c} />
            <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    error: (c) => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="8" fill={c} />
            <path d="M5 5l6 6M11 5l-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    warning: (c) => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="8" fill={c} />
            <rect x="7" y="4" width="2" height="5" rx="1" fill="white" />
            <circle cx="8" cy="11.5" r="1" fill="white" />
        </svg>
    ),
    info: (c) => (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="8" fill={c} />
            <rect x="7" y="7" width="2" height="5" rx="1" fill="white" />
            <circle cx="8" cy="5" r="1" fill="white" />
        </svg>
    ),
};

function ToastStack({ toasts, onDismiss }) {
    if (toasts.length === 0) return null;
    return (
        <div
            className="fixed z-[9999] flex flex-col gap-2 pointer-events-none"
            style={{ bottom: 80, left: '50%', transform: 'translateX(-50%)', width: 'min(360px, calc(100vw - 32px))' }}
        >
            {toasts.map((toast) => {
                const s = STYLES[toast.type] ?? STYLES.info;
                return (
                    <div
                        key={toast.id}
                        className="flex items-start gap-3 px-4 py-3 rounded-[12px] pointer-events-auto shadow-lg"
                        style={{ background: s.bg, border: `1px solid ${s.border}` }}
                    >
                        <span style={{ flexShrink: 0, marginTop: 1 }}>
                            {(ICONS[toast.type] ?? ICONS.info)(s.icon)}
                        </span>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: s.text, flex: 1, lineHeight: '20px' }}>
                            {toast.message}
                        </p>
                        <button
                            onClick={() => onDismiss(toast.id)}
                            style={{ color: s.icon, flexShrink: 0, lineHeight: 1, opacity: 0.7 }}
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
