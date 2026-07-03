import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HomeIcon from '../assets/HomeIcon';
import SubscriptionsIcon from '../assets/SubscriptionsIcon';
import CartIcon from '../assets/CartIcon';
import AccountIcon from '../assets/AccountIcon';
import { useAuth } from '../context/AuthContext';
import { getSubscriptions } from '../services/subscriptionService';
import { getContractRecord } from '../services/contractStorageService';

const NAV_ITEMS = [
    { label: 'Home',          icon: HomeIcon,          path: '/products' },
    { label: 'Subscriptions', icon: SubscriptionsIcon, path: '/subscriptions', badge: 'contracts' },
    { label: 'Cart',          icon: CartIcon,          path: '/cart' },
    { label: 'Account',       icon: AccountIcon,       path: '/account' },
];

export default function BottomNav() {
    const navigate           = useNavigate();
    const { pathname }       = useLocation();
    const { auth, isLoggedIn } = useAuth();
    const [unsignedCount, setUnsignedCount] = useState(0);

    useEffect(() => {
        if (!isLoggedIn || !auth?.customerId) {
            queueMicrotask(() => setUnsignedCount(0));
            return;
        }
        let cancelled = false;
        getSubscriptions(auth.token)
            .then(async (subs) => {
                if (cancelled) return;
                const list = Array.isArray(subs) ? subs : [];
                let count = 0;
                await Promise.all(list.map(async (sub) => {
                    const prod      = Array.isArray(sub.product) ? sub.product[0] : sub.product;
                    const productId = sub.productId ?? prod?.id ?? null;
                    if (!productId) return;
                    const record = await getContractRecord(auth.customerId, productId).catch(() => null);
                    if (!record?.signature) count++;
                }));
                if (!cancelled) setUnsignedCount(count);
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [isLoggedIn, auth?.customerId, pathname]);

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
            style={{
                backgroundColor: 'var(--neutral-100)',
                borderTop: '0.5px solid var(--neutral-400)',
                backdropFilter: 'blur(10px)',
            }}
        >
            <div
                className="max-w-[411px] mx-auto flex justify-between items-end px-2"
                style={{ height: '56px' }}
            >
                {NAV_ITEMS.map(({ label, icon: Icon, path, badge }) => {
                    const active = pathname === path;
                    const showBadge = badge === 'contracts' && unsignedCount > 0;
                    return (
                        <button
                            key={label}
                            onClick={() => navigate(path)}
                            className="flex flex-col items-center justify-between gap-1 flex-1 h-full pb-1 relative"
                        >
                            <span
                                className="w-full"
                                style={{
                                    height: '3px',
                                    backgroundColor: active ? 'var(--brand-100)' : '#FFFFFF',
                                }}
                            />
                            <div className="relative">
                                <Icon
                                    width={22}
                                    height={22}
                                    color={active ? 'var(--brand-100)' : 'var(--neutral-500)'}
                                />
                                {showBadge && (
                                    <span
                                        className="absolute -top-1 -right-1.5 flex items-center justify-center rounded-full text-white"
                                        style={{
                                            width: 14, height: 14,
                                            background: '#C51C13',
                                            fontSize: 8, fontWeight: 700,
                                            fontFamily: 'Roboto, sans-serif',
                                        }}
                                    >
                                        {unsignedCount}
                                    </span>
                                )}
                            </div>
                            <span
                                style={{
                                    fontSize: '10px',
                                    fontWeight: 500,
                                    color: active ? 'var(--brand-100)' : 'var(--neutral-500)',
                                }}
                            >
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
