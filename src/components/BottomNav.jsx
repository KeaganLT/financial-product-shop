import { useNavigate, useLocation } from 'react-router-dom';
import { HiHome, HiShoppingCart, HiUser } from 'react-icons/hi';
import { MdSubscriptions } from 'react-icons/md';

const navItems = [
    { label: 'Home',          icon: HiHome,           path: '/products' },
    { label: 'Subscriptions', icon: MdSubscriptions,  path: '/subscriptions' },
    { label: 'Cart',          icon: HiShoppingCart,   path: '/cart' },
    { label: 'Account',       icon: HiUser,           path: '/account' },
];

export default function BottomNav() {
    const navigate  = useNavigate();
    const { pathname } = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
            <div className="max-w-[411px] mx-auto flex justify-around items-center h-16 px-2">
                {navItems.map(({ label, icon: Icon, path }) => {
                    const active = pathname === path;
                    return (
                        <button
                            key={label}
                            onClick={() => navigate(path)}
                            className="flex flex-col items-center gap-1 flex-1 pt-2 pb-1 relative"
                        >
                            {/* Active blue top-border indicator */}
                            {active && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#1860BF] rounded-full" />
                            )}
                            <Icon
                                size={22}
                                className={active ? 'text-[#1860BF]' : 'text-gray-400'}
                            />
                            <span
                                className={`text-[10px] font-medium ${
                                    active ? 'text-[#1860BF]' : 'text-gray-400'
                                }`}
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