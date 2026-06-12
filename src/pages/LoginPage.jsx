import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Temporary login page for testing auth views
// In Milestone 2 this gets replaced with the real login form + API call
// For now it just calls login() with a fake user so you can see
// the difference between the guest and logged-in layouts

export default function LoginPage() {
    const navigate    = useNavigate();
    const { login }   = useAuth();

    function handleFakeLogin() {
        // This fake user object mirrors what the real API will return
        // In Milestone 2: login() will receive the real user from the auth service
        login({
            id: 1,
            firstName: 'Jesse',
            lastName: 'Leresche',
            customerType: 'INDIVIDUAL',
        });
        navigate('/products');
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-[411px] flex flex-col gap-6 text-center">

                <div className="flex flex-col items-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 1C7 1 3 5 3 10c0 3.9 2.3 7.3 5.6 8.9M12 1c5 0 9 4 9 9 0 3.9-2.3 7.3-5.6 8.9M9 11c0-1.7 1.3-3 3-3s3 1.3 3 3c0 2.8-1.2 5.4-3 7.2C10.2 16.4 9 13.8 9 11z"
                            stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        />
                    </svg>
                    <h1 className="text-[22px] font-bold text-black">InsureTechGuard</h1>
                    <p className="text-[13px] text-gray-400">
                        This is a temporary login screen — real login coming in Milestone 2
                    </p>
                </div>

                {/* Fake login button — just sets auth state and redirects */}
                <button
                    onClick={handleFakeLogin}
                    className="w-full py-3 rounded-xl text-white text-[15px] font-semibold"
                    style={{ backgroundColor: '#1860BF' }}
                >
                    Login as Jesse (test)
                </button>

                <button
                    onClick={() => navigate('/products')}
                    className="text-[14px] text-gray-400"
                >
                    Continue as guest
                </button>
            </div>
        </div>
    );
}