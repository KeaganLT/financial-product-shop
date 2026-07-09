import Logo from './Logo';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
    { label: 'Home', path: '/products' },
    { label: 'Subscriptions', path: '/subscriptions' },
    { label: 'Cart', path: '/cart' },
    { label: 'Account', path: '/account' },
];

function getInitials(emailOrUsername = '') {
    const parts = emailOrUsername.split('@')[0].split(/[._\-\s]+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return emailOrUsername.slice(0, 2).toUpperCase();
}

export default function Header() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { auth, isLoggedIn } = useAuth();

    const initials = isLoggedIn ? getInitials(auth?.email ?? auth?.username ?? '') : '';

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
                            color: 'var(--neutral-800)',
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

                    {isLoggedIn ? (
                        <button
                            onClick={() => navigate('/account')}
                            title="Account"
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--brand-100) 0%, var(--brand-200) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: '0.03em',
                                border: 'none',
                                cursor: 'pointer',
                                flexShrink: 0,
                            }}
                        >
                            {initials}
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                fontSize: '15px',
                                fontWeight: 600,
                                color: 'var(--brand-100)',
                            }}
                        >
                            Sign in
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
}
