import { useState } from 'react';
import { getProductPlaceholder } from '../../assets/placeholders/index.js';
import StatusBadge from './StatusBadge.jsx';

export default function SubscriptionCard({ subscription, onCancel, cancelling, onView, onContract, contractSigned, contractUrl }) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const prod       = Array.isArray(subscription.product) ? subscription.product[0] : subscription.product;
    const name       = subscription.productName ?? prod?.name ?? 'Product';
    const price      = subscription.price ?? prod?.price ?? subscription.monthlyPremium ?? 0;
    const imageUrl   = subscription.imageUrl ?? prod?.imageUrl ?? null;
    const fulfilType = subscription.fulfilmentType ?? prod?.fulfilmentType ?? '';
    const subId      = subscription.subscriptionId ?? subscription.id;
    const productId  = subscription.productId ?? prod?.id ?? null;

    return (
        <div className="w-full rounded-[12px] overflow-hidden border" style={{ borderColor: '#E5E5EA' }}>
            <button
                className="w-full overflow-hidden bg-[#D9D9D9] block"
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
                            className="font-semibold text-black text-left"
                            style={{ fontFamily: 'Roboto, sans-serif', fontSize: 17, lineHeight: '22px', letterSpacing: '0.0035em' }}
                            onClick={() => productId && onView(productId)}
                        >
                            {name}
                        </button>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#8E8E93', lineHeight: '18px' }}>
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

                {confirmOpen && (
                    <div
                        className="flex flex-col gap-2 mt-1 px-3 py-2 rounded-[8px]"
                        style={{ background: '#FFF5F5', border: '1px solid #FFB3B3' }}
                    >
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#1C1C1C' }}>
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
                                style={{ borderColor: '#C7C7CC', fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#1C1C1C' }}
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
