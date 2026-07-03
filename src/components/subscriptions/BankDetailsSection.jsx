import { getBankDetails } from '../../services/bankingService.js';

function getNextDebitDate(debitDay) {
    if (!debitDay) return null;
    const now    = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), debitDay);
    if (target <= now) target.setMonth(target.getMonth() + 1);
    return target.toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function BankDetailsSection({ userId, onChangeClick }) {
    const bankDetails = getBankDetails(userId);
    if (!bankDetails) return null;

    const nextDebitDate = getNextDebitDate(bankDetails.debitDay);

    return (
        <div
            className="rounded-[12px] px-4 py-3 flex items-center justify-between"
            style={{ background: '#F0F4FF', border: '1px solid #C7D9FF' }}
        >
            <div className="flex flex-col gap-0.5">
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1C1C1C' }}>
                    Debit account
                </p>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#3C3C43' }}>
                    {bankDetails.bankName} · {bankDetails.accountType} ••••{bankDetails.last4}
                </p>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#8E8E93' }}>
                    Debited on the {bankDetails.debitDay}{bankDetails.debitDay === 1 ? 'st' : 'th'} of each month
                </p>
                {nextDebitDate && (
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600, color: '#1860BF' }}>
                        Next debit: {nextDebitDate}
                    </p>
                )}
            </div>
            <button
                onClick={onChangeClick}
                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1860BF', flexShrink: 0, marginLeft: 12 }}
            >
                Change
            </button>
        </div>
    );
}
