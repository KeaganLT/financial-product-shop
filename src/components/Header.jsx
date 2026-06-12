import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { HiUser } from 'react-icons/hi';

// Header changes based on auth state:
// Guest:     InsureTechGuard logo + "Login" button on the right
// Logged in: InsureTechGuard logo + user avatar/name on the right

export default function Header() {
    const navigate = useNavigate();
    const { isLoggedIn, user, logout } = useAuth();

    return (
        <header
            className="fixed top-0 left-0 right-0 bg-white z-50"
            style={{ borderBottom: '1px solid #E5E5EA' }}
        >
            <div className="max-w-[411px] mx-auto flex items-center justify-between px-6 py-4">

                {/* Logo — left side */}
                <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 1C7 1 3 5 3 10c0 3.9 2.3 7.3 5.6 8.9M12 1c5 0 9 4 9 9 0 3.9-2.3 7.3-5.6 8.9M9 11c0-1.7 1.3-3 3-3s3 1.3 3 3c0 2.8-1.2 5.4-3 7.2C10.2 16.4 9 13.8 9 11z"
                            stroke="#000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span className="text-[17px] font-semibold text-black tracking-tight">
            InsureTechGuard
          </span>
                </div>

                {/* Right side — changes based on login state */}
                {isLoggedIn ? (
                    // Logged in: show user avatar circle with first initial
                    <button
                        onClick={logout}
                        className="w-8 h-8 rounded-full bg-[#1860BF] flex items-center justify-center"
                        title="Tap to log out"
                    >
            <span className="text-white text-[13px] font-bold">
              {user?.firstName?.[0]?.toUpperCase() || 'U'}
            </span>
                    </button>
                ) : (
                    // Guest: show Login button
                    <button
                        onClick={() => navigate('/login')}
                        className="text-[14px] font-semibold px-4 py-1.5 rounded-full"
                        style={{
                            color: '#1860BF',
                            border: '1.5px solid #1860BF',
                        }}
                    >
                        Login
                    </button>
                )}
            </div>
        </header>
    );
}