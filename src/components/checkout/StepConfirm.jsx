export default function StepConfirm({ product, bankDetails, submitting, error, onConfirm }) {
    const nextDebitDate = (() => {
        const now    = new Date();
        const target = new Date(now.getFullYear(), now.getMonth(), bankDetails.debitDay);
        if (target <= now) target.setMonth(target.getMonth() + 1);
        return target.toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' });
    })();

    const rows = [
        { label: 'Product',          value: product.name },
        { label: 'Monthly premium',  value: `R${Number(product.price).toFixed(2)}` },
        { label: 'Bank',             value: bankDetails.bankName },
        { label: 'Account',          value: `${bankDetails.accountType} ••••${bankDetails.last4}` },
        { label: 'First debit date', value: nextDebitDate },
    ];

    return (
        <div className="flex flex-col gap-6 px-6 pt-4 pb-8">
            <div>
                <h2 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Confirm & activate
                </h2>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Review your details before activating.
                </p>
            </div>

            <div className="rounded-[12px] border flex flex-col divide-y" style={{ borderColor: 'var(--neutral-300)' }}>
                {rows.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-3">
                        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
                    </div>
                ))}
            </div>

            {error && (
                <div className="px-4 py-3 rounded-[10px]" style={{ background: '#FFF5F5', border: '1px solid #FFB3B3' }}>
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#C51C13' }}>{error}</p>
                </div>
            )}

            <button
                onClick={onConfirm}
                disabled={submitting}
                className="w-full h-[50px] rounded-[100px] font-semibold text-white"
                style={{
                    background: submitting ? '#A0AEC0' : 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: 17,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                }}
            >
                {submitting ? 'Activating…' : 'Activate now'}
            </button>
        </div>
    );
}
