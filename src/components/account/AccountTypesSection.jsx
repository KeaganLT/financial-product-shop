export default function AccountTypesSection({ types, loading, error, currentAccountTypeIds, accountLoading, onToggle }) {
    if (loading) return null;
    if (error) return null;
    if (!types?.accountTypes?.length) return null;

    return (
        <div className="w-full flex flex-col gap-3">
            <h2 className="text-[13px] font-semibold uppercase" style={{ color: '#8E8E93', letterSpacing: '0.05em' }}>
                Accounts
            </h2>
            <div className="flex flex-col gap-2">
                {types.accountTypes.map((at) => {
                    const added = currentAccountTypeIds.has(at.id);
                    const toggling = accountLoading === at.id;
                    return (
                        <div
                            key={at.id}
                            className="w-full px-4 py-3 rounded-lg flex items-center justify-between border"
                            style={{ borderColor: added ? '#A3E9B8' : '#C7C7CC', backgroundColor: added ? '#F0FFF4' : 'var(--neutral-100)' }}
                        >
                            <div>
                                <p className="text-[15px] font-semibold" style={{ color: 'var(--neutral-800)' }}>{at.name}</p>
                                {at.description && (
                                    <p className="text-[12px] mt-0.5" style={{ color: '#8E8E93' }}>{at.description}</p>
                                )}
                            </div>
                            <button
                                disabled={toggling}
                                onClick={() => onToggle(at.id, added)}
                                className="ml-3 flex-shrink-0 px-3 py-1 rounded-full text-[12px] font-semibold"
                                style={{
                                    background: added ? 'transparent' : 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)',
                                    color: added ? '#C51C13' : '#FFFFFF',
                                    border: added ? '1px solid #C51C13' : 'none',
                                    opacity: toggling ? 0.5 : 1,
                                    minWidth: 64,
                                }}
                            >
                                {toggling ? '…' : added ? 'Remove' : 'Add'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
