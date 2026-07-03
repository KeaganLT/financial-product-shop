export default function CustomerTypeSection({ profile, types, loading, error, settingType, onSelect }) {
    const currentCustomerType = profile?.customerType ?? types?.customerTypes?.find(
        (t) => t.id === (profile?.customerTypeId ?? profile?.customerType?.id)
    );

    return (
        <div className="w-full flex flex-col gap-3">
            <h2 className="text-[13px] font-semibold uppercase" style={{ color: '#8E8E93', letterSpacing: '0.05em' }}>
                Customer type
            </h2>

            {loading && <p className="text-[15px]" style={{ color: '#8E8E93' }}>Loading…</p>}
            {!loading && error && <p className="text-[13px] text-red-500">{error}</p>}

            {!loading && types && (
                profile?.customerType ? (
                    <div
                        className="w-full px-4 py-3 rounded-lg flex items-center justify-between"
                        style={{ backgroundColor: 'var(--neutral-200)' }}
                    >
                        <div>
                            <p className="text-[15px] font-semibold" style={{ color: 'var(--neutral-800)' }}>
                                {currentCustomerType?.name ?? `Type ${profile.customerTypeId}`}
                            </p>
                            <p className="text-[12px]" style={{ color: '#8E8E93' }}>
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
                        <p className="text-[13px]" style={{ color: '#8E8E93' }}>
                            Select your customer type. This cannot be changed once set.
                        </p>
                        {types.customerTypes?.map((ct) => (
                            <button
                                key={ct.id}
                                disabled={settingType}
                                onClick={() => onSelect(ct.id)}
                                className="w-full px-4 py-3 rounded-lg text-left border"
                                style={{ borderColor: '#C7C7CC', backgroundColor: 'var(--neutral-100)', opacity: settingType ? 0.6 : 1 }}
                            >
                                <p className="text-[15px] font-semibold" style={{ color: 'var(--neutral-800)' }}>{ct.name}</p>
                                {ct.description && (
                                    <p className="text-[12px] mt-0.5" style={{ color: '#8E8E93' }}>{ct.description}</p>
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
