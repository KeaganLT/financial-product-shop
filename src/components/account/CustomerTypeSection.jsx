import SectionHeading from './SectionHeading.jsx';

const TYPE_ICON = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="#1860BF" strokeWidth="2" />
        <path d="M3 9h18M8 14h4" stroke="#1860BF" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export default function CustomerTypeSection({ profile, types, loading, error, settingType, onSelect }) {
    const currentCustomerType = profile?.customerType ?? types?.customerTypes?.find(
        (t) => t.id === (profile?.customerTypeId ?? profile?.customerType?.id)
    );

    return (
        <div className="w-full flex flex-col gap-3">
            <SectionHeading icon={TYPE_ICON}>Customer type</SectionHeading>

            {loading && <p className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>Loading…</p>}
            {!loading && error && <p className="text-[13px] text-red-500">{error}</p>}

            {!loading && types && (
                profile?.customerType ? (
                    <div
                        className="w-full px-4 py-3 rounded-[12px] flex items-center justify-between"
                        style={{ border: '1px solid var(--neutral-300)', backgroundColor: 'var(--neutral-100)' }}
                    >
                        <div>
                            <p className="text-[15px] font-semibold" style={{ color: 'var(--neutral-800)' }}>
                                {currentCustomerType?.name ?? `Type ${profile.customerTypeId}`}
                            </p>
                            <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                                Customer type cannot be changed once set.
                            </p>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M14 8V6a4 4 0 10-8 0v2" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" />
                            <rect x="3" y="8" width="14" height="10" rx="2" fill="#8E8E93" opacity=".3" />
                            <rect x="3" y="8" width="14" height="10" rx="2" stroke="#8E8E93" strokeWidth="1.5" />
                        </svg>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                            Select your customer type. This cannot be changed once set.
                        </p>
                        {types.customerTypes?.map((ct) => (
                            <button
                                key={ct.id}
                                disabled={settingType}
                                onClick={() => onSelect(ct.id)}
                                className="w-full px-4 py-3 rounded-[12px] text-left border"
                                style={{ borderColor: 'var(--neutral-300)', backgroundColor: 'var(--neutral-100)', opacity: settingType ? 0.6 : 1 }}
                            >
                                <p className="text-[15px] font-semibold" style={{ color: 'var(--neutral-800)' }}>{ct.name}</p>
                                {ct.description && (
                                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{ct.description}</p>
                                )}
                            </button>
                        ))}
                        {error && <p className="text-[13px] text-red-500">{error}</p>}
                    </div>
                )
            )}
        </div>
    );
}
