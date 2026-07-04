import { formatDebitDate } from '../../utils/debitDates.js';

export default function PaymentSummaryCard({ rows, totalMonthly, count }) {
    if (count === 0) return null;

    const sorted = [...rows].sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));

    return (
        <div
            className="rounded-[14px] overflow-hidden"
            style={{ background: 'var(--neutral-100)', border: '1px solid var(--neutral-300)' }}
        >
            <div className="px-4 pt-4 pb-3">
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    R{totalMonthly.toFixed(2)}
                    <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)' }}> / month</span>
                </p>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {count} active subscription{count === 1 ? '' : 's'}
                </p>
            </div>

            {sorted.map((row) => (
                <div
                    key={row.key}
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{ borderTop: '1px solid var(--neutral-300)' }}
                >
                    <div className="flex flex-col gap-0.5 min-w-0 mr-3">
                        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {row.date ? formatDebitDate(row.date) : 'Debit date not set'}
                        </span>
                        <span className="truncate" style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'var(--text-secondary)' }}>
                            {row.productName}{row.bankLabel ? ` · ${row.bankLabel}` : ''}
                        </span>
                    </div>
                    <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                        R{Number(row.amount).toFixed(2)}
                    </span>
                </div>
            ))}
        </div>
    );
}
