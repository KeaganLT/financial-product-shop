export default function UnsignedContractsBanner({ count }) {
    if (count === 0) return null;

    return (
        <div
            className="flex items-start gap-3 px-4 py-3 rounded-[12px]"
            style={{ background: '#FFF8E6', border: '1px solid #FFD97A' }}
        >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="9" cy="9" r="9" fill="#F5A623" />
                <rect x="8" y="4" width="2" height="6" rx="1" fill="white" />
                <circle cx="9" cy="13" r="1" fill="white" />
            </svg>
            <div>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 600, color: '#7A4F00' }}>
                    {count} contract{count > 1 ? 's' : ''} awaiting your signature
                </p>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#7A4F00', marginTop: 2 }}>
                    Tap "Sign contract" on the relevant subscription below.
                </p>
            </div>
        </div>
    );
}
