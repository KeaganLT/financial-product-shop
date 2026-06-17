import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import FormInput from '../components/FormInput.jsx';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please enter your username and password');
            return;
        }

        setIsSubmitting(true);
        try {
            await login(username, password);
            navigate('/products');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setIsSubmitting(false);
        }
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
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
                    <FormInput
                        id="username"
                        label="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        error={!!error && !username}
                    />

                    <FormInput
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        error={!!error}
                    />

                    {error && (
                        <p className="text-[13px] text-red-500">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl text-white text-[15px] font-semibold disabled:opacity-60"
                        style={{ backgroundColor: '#1860BF' }}
                    >
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </button>
                </form>

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