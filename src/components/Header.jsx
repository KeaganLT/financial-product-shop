import Logo from './Logo';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_LINKS = [
    { label: 'Home', path: '/products' },
    { label: 'Subscriptions', path: '/subscriptions' },
    { label: 'Cart', path: '/cart' },
    { label: 'Account', path: '/account' },
];


export default function Header() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50"
            style={{ backgroundColor: 'var(--neutral-100)', borderBottom: '1px solid var(--neutral-300)' }}
        >
            <div
                className="max-w-[411px] md:max-w-5xl mx-auto relative flex items-center justify-center md:justify-between px-6"
                style={{ height: '64px' }}
            >
                <div className="flex items-center gap-2">
                    <Logo size="sm" className="w-8 h-8" />
                    <span
                        style={{
                            fontSize: '17px',
                            fontWeight: 600,
                            lineHeight: '22px',
                            color: '#000000',
                            letterSpacing: '0.0035em',
                        }}
                    >
            InsureTech<strong>Guard</strong>
          </span>
                </div>


                <nav className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map(({ label, path }) => {
                        const active = pathname === path;
                        return (
                            <button
                                key={label}
                                type="button"
                                onClick={() => navigate(path)}
                                style={{
                                    fontSize: '15px',
                                    fontWeight: active ? 600 : 500,
                                    color: active ? 'var(--brand-100)' : 'var(--neutral-500)',
                                    letterSpacing: '0.0035em',
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                </nav>

            </div>
        </header>
    );
}