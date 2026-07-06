export default function ProductSearchBar({ value, onChange }) {
    return (
        <div className="px-6 md:px-0 mt-4">
            <div
                className="flex items-center gap-2 h-[44px] px-3 rounded-[12px]"
                style={{ background: 'var(--neutral-100)', border: '1px solid var(--neutral-300)' }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="7" stroke="var(--text-secondary)" strokeWidth="2" />
                    <path d="M20 20l-3.5-3.5" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Search products…"
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: 'var(--text-primary)' }}
                />
                {value && (
                    <button
                        onClick={() => onChange('')}
                        aria-label="Clear search"
                        className="flex-shrink-0 w-6 h-6 flex items-center justify-center"
                        style={{ color: 'var(--text-secondary)', fontSize: 18 }}
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
}
