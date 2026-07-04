const ACCENTS = {
    info:    '#1860BF',
    warning: '#B96A00',
    success: '#168C34',
    error:   '#C51C13',
};

export default function InfoBanner({ variant = 'info', title, children, icon = null, actionLabel, onAction }) {
    const accent = ACCENTS[variant] ?? ACCENTS.info;

    return (
        <div
            className="flex items-start gap-3 px-4 py-3 rounded-[10px]"
            style={{
                background: 'var(--neutral-100)',
                border: '1px solid var(--neutral-300)',
                borderLeft: `3px solid ${accent}`,
            }}
        >
            {icon && <div className="flex-shrink-0" style={{ marginTop: 1, color: accent }}>{icon}</div>}
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                {title && (
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {title}
                    </p>
                )}
                {children && (
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: 'var(--text-secondary)', lineHeight: '17px' }}>
                        {children}
                    </div>
                )}
                {actionLabel && (
                    <button
                        onClick={onAction}
                        className="self-start mt-1"
                        style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: accent, textDecoration: 'underline' }}
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
}
