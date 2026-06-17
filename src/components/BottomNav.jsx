import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '../assets/HomeIcon';
import SubscriptionsIcon from '../assets/SubscriptionsIcon';
import CartIcon from '../assets/CartIcon';
import AccountIcon from '../assets/AccountIcon';

const NAV_ITEMS = [
    { label: 'Home',          icon: HomeIcon,          path: '/products' },
    { label: 'Subscriptions', icon: SubscriptionsIcon, path: '/subscriptions' },
    { label: 'Cart',          icon: CartIcon,          path: '/cart' },
    { label: 'Account',       icon: AccountIcon,       path: '/account' },
];

export default function BottomNav() {
    const navigate       = useNavigate();
    const { pathname }   = useLocation();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50"
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
                {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
                    const active = pathname === path;
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
                            <Icon
                                width={22}
                                height={22}
                                color={active ? 'var(--brand-100)' : 'var(--neutral-500)'}
                            />
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