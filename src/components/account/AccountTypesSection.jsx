import SectionHeading from './SectionHeading.jsx';

const WALLET_ICON = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="#1860BF" strokeWidth="2" />
        <path d="M3 10h18" stroke="#1860BF" strokeWidth="2" />
    </svg>
);

export default function AccountTypesSection({ types, loading, error, currentAccountTypeIds, accountLoading, onToggle }) {
    if (loading) return null;
    if (error) return null;
    if (!types?.accountTypes?.length) return null;

    return (
        <div className="w-full flex flex-col gap-3">
            <SectionHeading icon={WALLET_ICON}>Accounts</SectionHeading>
            <div className="flex flex-col gap-2">
                {types.accountTypes.map((at) => {
                    const added = currentAccountTypeIds.has(at.id);
                    const toggling = accountLoading === at.id;
                    return (
                        <div
                            key={at.id}
                            className="w-full px-4 py-3 rounded-[12px] flex items-center justify-between"
                            style={{ border: '1px solid var(--neutral-300)', borderLeft: `3px solid ${added ? '#168C34' : 'var(--neutral-300)'}`, backgroundColor: 'var(--neutral-100)' }}
                        >
                            <div>
                                <p className="text-[15px] font-semibold" style={{ color: 'var(--neutral-800)' }}>{at.name}</p>
                                {at.description && (
                                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{at.description}</p>
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
