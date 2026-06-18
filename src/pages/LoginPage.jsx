import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import FormInput from '../components/FormInput.jsx';
import LogoMark from '../components/LogoMark.jsx';
import SplashScreen from '../components/SplashScreen.jsx';

const SPLASH_DISPLAY_MS = 1600;
const SPLASH_FADE_MS = 400;

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [isSplashVisible, setIsSplashVisible] = useState(true);
    const [stage, setStage] = useState('welcome');
    const usernameInputRef = useRef(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [usernameTouched, setUsernameTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);

    const isUsernameInvalid = !username.includes('@');
    const isPasswordInvalid = password.length === 0;

    const usernameError = usernameTouched && isUsernameInvalid;
    const passwordError = passwordTouched && isPasswordInvalid;

    const canSubmit = !isUsernameInvalid && !isPasswordInvalid;

    useEffect(() => {
        const timer = setTimeout(() => setIsSplashVisible(false), SPLASH_DISPLAY_MS);
        return () => clearTimeout(timer);
    }, []);

    function handleStartLogin() {
        setStage('form');
        usernameInputRef.current?.focus();
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setUsernameTouched(true);
        setPasswordTouched(true);

        if (!canSubmit) {
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
        <div
            className="min-h-screen flex flex-col items-center px-6"
            style={{
                backgroundColor: 'var(--brand-300)',
                justifyContent: stage === 'welcome' ? 'flex-end' : 'center',
                paddingBottom: stage === 'welcome' ? '80px' : undefined,
            }}
        >
            <SplashScreen isVisible={isSplashVisible} fadeMs={SPLASH_FADE_MS} />

            <div
                className="w-full max-w-[363px] flex flex-col items-center"
                style={stage === 'welcome' ? { gap: '165px' } : { gap: '24px' }}
            >

                <div className="flex flex-col items-center gap-6">
                    <LogoMark size={64} />
                    <h1
                        className="text-[24px] font-light text-white -mt-2"
                        style={{ fontFamily: '"SF Pro Display", -apple-system, system-ui, sans-serif', letterSpacing: '0.07em' }}
                    >
                        InsureTech<strong className="font-bold">Guard</strong>
                    </h1>
                </div>

                {stage === 'welcome' && (
                    <div className="w-full flex flex-col items-center" style={{ gap: '32px' }}>
                        <div className="w-full flex flex-col items-center" style={{ gap: '60px' }}>
                            <button
                                type="button"
                                onClick={handleStartLogin}
                                className="w-full py-[10px] rounded-full text-[17px] font-semibold text-white"
                                style={{
                                    background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)',
                                    letterSpacing: '0.0035em',
                                }}
                            >
                                Login
                            </button>

                            <p className="text-[17px] text-white" style={{ letterSpacing: '0.0035em' }}>
                                Don&apos;t have an account?{' '}
                                <span className="font-semibold underline" style={{ color: 'var(--brand-200)' }}>Sign up</span>
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/products')}
                            className="text-[17px] text-white"
                            style={{ letterSpacing: '0.0035em' }}
                        >
                            Continue as guest
                        </button>
                    </div>
                )}

                {stage === 'form' && (
                    <>
                        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                <FormInput
                                    id="username"
                                    label="Email"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onBlur={() => setUsernameTouched(true)}
                                    autoComplete="username"
                                    error={usernameError}
                                    inputRef={usernameInputRef}
                                />

                                <FormInput
                                    id="password"
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={() => setPasswordTouched(true)}
                                    autoComplete="current-password"
                                    error={passwordError}
                                />
                            </div>

                            {error && (
                                <p className="text-[13px] text-red-400 -mt-2">{error}</p>
                            )}

                            <div className="flex flex-col gap-6">
                                <button
                                    type="submit"
                                    disabled={!canSubmit || isSubmitting}
                                    className="w-full py-[10px] rounded-full text-[17px] font-semibold"
                                    style={{
                                        background: canSubmit ? 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)' : '#E5E5EA',
                                        color: canSubmit ? '#FFFFFF' : '#AEAEB2',
                                        letterSpacing: '0.0035em',
                                        opacity: isSubmitting ? 0.6 : 1,
                                    }}
                                >
                                    {isSubmitting ? 'Logging in...' : 'Login'}
                                </button>

                                <button
                                    type="button"
                                    className="text-[13px] text-center"
                                    style={{ color: 'var(--neutral-500)' }}
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </form>

                    </>
                )}
            </div>

            {stage === 'form' && (
                <p className="absolute bottom-12 text-[15px] text-white">
                    Don&apos;t have an account?{' '}
                    <span className="font-semibold" style={{ color: 'var(--brand-200)' }}>Sign up</span>
                </p>
            )}
        </div>
    );
}