import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Header() {
    const { isLoggedIn, user, logout } = useAuth();

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50"
            style={{ backgroundColor: 'var(--neutral-100)', borderBottom: '1px solid var(--neutral-300)' }}
        >
            <div
                className="max-w-[411px] mx-auto relative flex items-center justify-center px-6"
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

                {isLoggedIn && (
                    <button
                        onClick={logout}
                        className="absolute right-6 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--brand-100)' }}
                        title="Tap to log out"
                    >
            <span style={{ color: 'var(--neutral-100)', fontSize: '13px', fontWeight: 700 }}>
              {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
            </span>
                    </button>
                )}
            </div>
        </header>
    );
}