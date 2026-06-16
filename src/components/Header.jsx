import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

// Header reads auth state and shows:
// Guest:     Logo + brand name + "Login" button
// Logged in: Logo + brand name + user avatar (tap to log out)

export default function Header() {
    const navigate = useNavigate();
    const { isLoggedIn, user, logout } = useAuth();

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50"
            style={{ backgroundColor: 'var(--neutral-100)', borderBottom: '1px solid var(--neutral-300)' }}
        >
            <div
                className="max-w-[411px] mx-auto flex items-center justify-between px-6"
                style={{ height: '64px' }}
            >
                {/* Logo + wordmark */}
                <div className="flex items-center gap-2">
                    <Logo size="sm" className="w-8 h-8" />
                    <span
                        style={{
                            fontSize: '17px',
                            fontWeight: 600,
                            color: 'var(--neutral-800)',
                            letterSpacing: '-0.02em',
                        }}
                    >
            InsureTech<strong>Guard</strong>
          </span>
                </div>

                {/* Right side */}
                {isLoggedIn ? (
                    <button
                        onClick={logout}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--brand-100)' }}
                        title="Tap to log out"
                    >
            <span style={{ color: 'var(--neutral-100)', fontSize: '13px', fontWeight: 700 }}>
              {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
            </span>
                    </button>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center justify-center"
                        style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--brand-100)',
                            border: '1.5px solid var(--brand-100)',
                            borderRadius: 'var(--radius-full)',
                            padding: '6px 16px',
                            backgroundColor: 'transparent',
                        }}
                    >
                        Login
                    </button>
                )}
            </div>
        </header>
    );
}