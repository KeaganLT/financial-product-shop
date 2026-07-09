import { ordinalDay } from '../../utils/debitDates.js';

export default function AccountPickerSheet({ open, accounts, selectedId, saving, onSelect, onAddNew, onClose }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
            <button
                aria-label="Close"
                className="absolute inset-0"
                style={{ background: 'rgba(0,0,0,0.4)' }}
                onClick={onClose}
            />
            <div
                className="relative w-full md:w-[420px] rounded-t-[16px] md:rounded-[16px] px-5 pt-4 pb-6 flex flex-col gap-3"
                style={{ background: 'var(--neutral-100)' }}
            >
                <div className="mx-auto rounded-full md:hidden" style={{ width: 36, height: 5, background: 'var(--neutral-400)' }} />
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Pay from account
                </p>

                <div className="flex flex-col gap-2">
                    {accounts.map((account) => {
                        const selected = account.id === selectedId;
                        return (
                            <button
                                key={account.id}
                                disabled={saving}
                                onClick={() => onSelect(account.id)}
                                className="flex items-center gap-3 px-4 py-3 rounded-[10px] border text-left"
                                style={{
                                    borderColor: selected ? 'var(--brand-100)' : 'var(--neutral-400)',
                                    background: selected ? 'rgba(24,96,191,0.08)' : 'var(--neutral-100)',
                                    opacity: saving ? 0.6 : 1,
                                }}
                            >
                                <div
                                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                                    style={{ borderColor: selected ? 'var(--brand-100)' : 'var(--neutral-400)' }}
                                >
                                    {selected && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--brand-100)' }} />}
                                </div>
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {account.bankName} ••••{account.last4}
                                    </span>
                                    <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: 'var(--text-secondary)' }}>
                                        {account.accountType} · debited on the {ordinalDay(account.debitDay)}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={onAddNew}
                    className="flex items-center gap-2 px-1 py-2"
                    style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--brand-100)' }}
                >
                    <span style={{ fontSize: 18 }}>+</span> Add a new account
                </button>
            </div>
        </div>
    );
}
