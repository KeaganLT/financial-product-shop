import { useState } from 'react';
import { getProductPlaceholder } from '../../assets/placeholders/index.js';
import { ordinalDay } from '../../utils/debitDates.js';
import StatusBadge from './StatusBadge.jsx';

export default function SubscriptionCard({ subscription, onCancel, cancelling, onView, onContract, contractSigned, contractUrl, account, onChangeAccount }) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const prod       = Array.isArray(subscription.product) ? subscription.product[0] : subscription.product;
    const name       = subscription.productName ?? prod?.name ?? 'Product';
    const price      = subscription.price ?? prod?.price ?? subscription.monthlyPremium ?? 0;
    const imageUrl   = subscription.imageUrl ?? prod?.imageUrl ?? null;
    const fulfilType = subscription.fulfilmentType ?? prod?.fulfilmentType ?? '';
    const subId      = subscription.subscriptionId ?? subscription.id;
    const productId  = subscription.productId ?? prod?.id ?? null;

    return (
        <div className="w-full rounded-[12px] overflow-hidden border" style={{ borderColor: 'var(--neutral-300)' }}>
            <button
                className="w-full overflow-hidden bg-[var(--neutral-300)] block"
                style={{ height: 120 }}
                onClick={() => productId && onView(productId)}
            >
                <img
                    src={imageUrl || getProductPlaceholder(name)}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </button>

            <div className="px-4 py-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                        <button
                            className="font-semibold text-[var(--text-primary)] text-left"
                            style={{ fontFamily: 'Roboto, sans-serif', fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em' }}
                            onClick={() => productId && onView(productId)}
                        >
                            {name}
                        </button>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: 'var(--text-secondary)', lineHeight: '18px' }}>
                            R{Number(price).toFixed(2)} / month
                        </p>
                    </div>
                    <StatusBadge fulfilmentType={fulfilType} />
                </div>

                <div className="flex items-center gap-4 mt-1">
                    <button
                        onClick={() => onContract({ id: productId, name, price })}
                        className="flex items-center gap-1"
                        style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: contractSigned ? '#168C34' : '#1860BF' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={contractSigned ? '#168C34' : '#1860BF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 2v6h6M16 13H8M16 17H8" stroke={contractSigned ? '#168C34' : '#1860BF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {contractSigned ? 'Signed ✓' : 'Sign contract'}
                    </button>
                    {contractUrl && (
                        <>
                            <span style={{ color: '#C7C7CC' }}>·</span>
                            <a
                                href={contractUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#1860BF' }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 16l-4-4h3V4h2v8h3l-4 4zM4 20h16v2H4v-2z" fill="#1860BF" />
                                </svg>
                                View contract
                            </a>
                        </>
                    )}
                    <span style={{ color: '#C7C7CC' }}>·</span>
                    {!confirmOpen && (
                        <button
                            onClick={() => setConfirmOpen(true)}
                            style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#C51C13', textDecoration: 'underline' }}
                        >
                            Cancel subscription
                        </button>
                    )}
                </div>

                <div
                    className="flex items-center justify-between pt-2"
                    style={{ borderTop: '1px solid var(--neutral-300)' }}
                >
                    <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: 'var(--text-secondary)' }}>
                        {account
                            ? <>Pays from <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{account.bankName} ••••{account.last4}</span> · {ordinalDay(account.debitDay)}</>
                            : 'No debit account linked'}
                    </span>
                    <button
                        onClick={onChangeAccount}
                        style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600, color: '#1860BF', flexShrink: 0, marginLeft: 8 }}
                    >
                        {account ? 'Change account' : 'Link account'}
                    </button>
                </div>

                {confirmOpen && (
                    <div
                        className="flex flex-col gap-2 mt-1 px-3 py-2 rounded-[8px]"
                        style={{ background: 'var(--neutral-100)', border: '1px solid var(--neutral-300)', borderLeft: '3px solid #C51C13' }}
                    >
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: 'var(--text-primary)' }}>
                            Are you sure you want to cancel this subscription?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { onCancel(subId); setConfirmOpen(false); }}
                                disabled={cancelling}
                                className="flex-1 py-1.5 rounded-full text-white font-semibold"
                                style={{ background: '#C51C13', fontFamily: 'Roboto, sans-serif', fontSize: 13, opacity: cancelling ? 0.6 : 1 }}
                            >
                                {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                            </button>
                            <button
                                onClick={() => setConfirmOpen(false)}
                                className="flex-1 py-1.5 rounded-full font-semibold border"
                                style={{ borderColor: 'var(--neutral-400)', fontFamily: 'Roboto, sans-serif', fontSize: 13, color: 'var(--text-primary)' }}
                            >
                                Keep it
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
