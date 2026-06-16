import { useNavigate, useLocation } from 'react-router-dom';
import { HiHome, HiShoppingCart, HiUser } from 'react-icons/hi';
import { MdSubscriptions } from 'react-icons/md';

const NAV_ITEMS = [
    { label: 'Home',          icon: HiHome,          path: '/products' },
    { label: 'Subscriptions', icon: MdSubscriptions, path: '/subscriptions' },
    { label: 'Cart',          icon: HiShoppingCart,  path: '/cart' },
    { label: 'Account',       icon: HiUser,          path: '/account' },
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
                className="max-w-[411px] mx-auto flex justify-around items-center px-2"
                style={{ height: '66px' }}
            >
                {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
                    const active = pathname === path;
                    return (
                        <button
                            key={label}
                            onClick={() => navigate(path)}
                            className="flex flex-col items-center gap-1 flex-1 pt-2 pb-1 relative"
                        >
                            {/* Active indicator — blue bar at top */}
                            {active && (
                                <span
                                    className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                                    style={{
                                        width: '32px',
                                        height: '2px',
                                        backgroundColor: 'var(--brand-100)',
                                    }}
                                />
                            )}
                            <Icon
                                size={22}
                                style={{ color: active ? 'var(--brand-100)' : 'var(--neutral-500)' }}
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