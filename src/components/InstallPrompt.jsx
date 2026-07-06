import { useState, useEffect } from 'react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem('install_dismissed') === '1') return;

        function onBeforeInstall(e) {
            e.preventDefault();
            queueMicrotask(() => {
                setDeferredPrompt(e);
                setVisible(true);
            });
        }
        window.addEventListener('beforeinstallprompt', onBeforeInstall);
        return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
    }, []);

    function dismiss() {
        setVisible(false);
        sessionStorage.setItem('install_dismissed', '1');
    }

    async function install() {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        dismiss();
    }

    if (!visible) return null;

    return (
        <div className="fixed left-0 right-0 bottom-[68px] md:bottom-6 z-[65] px-4 flex justify-center">
            <div
                className="w-full max-w-[420px] flex items-center gap-3 px-4 py-3 rounded-[12px]"
                style={{ background: 'var(--neutral-100)', border: '1px solid var(--neutral-300)', boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }}
            >
                <img src="/icon-192.png" alt="" width="40" height="40" style={{ borderRadius: 9, flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        Install InsureTechGuard
                    </p>
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: 'var(--text-secondary)' }}>
                        Add to your home screen for quick access.
                    </p>
                </div>
                <button
                    onClick={install}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full font-semibold text-white"
                    style={{ background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}
                >
                    Install
                </button>
                <button onClick={dismiss} aria-label="Dismiss" className="flex-shrink-0" style={{ color: 'var(--text-secondary)', fontSize: 20 }}>
                    ×
                </button>
            </div>
        </div>
    );
}
