import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import FormInput from '../components/FormInput.jsx';
import LogoMark from '../components/LogoMark.jsx';
import SplashScreen from '../components/SplashScreen.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { signInWithGoogle, resetPassword } from '../services/firebase.js';
import { features } from '../config/env.js';
import { legacyLogin } from '../services/credentialVault.js';

const SPLASH_DISPLAY_MS = 1600;
const SPLASH_FADE_MS = 400;

export default function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, loginWithSession, logout } = useAuth();

    const emailFromLink = searchParams.get('email') ?? '';
    const [isSplashVisible, setIsSplashVisible] = useState(true);
    const [stage, setStage] = useState(emailFromLink ? 'form' : 'welcome');
    const usernameInputRef = useRef(null);
    const [username, setUsername] = useState(emailFromLink);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [usernameTouched, setUsernameTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

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

    function handleContinueAsGuest() {
        logout();
        navigate('/products');
    }

    async function handleGoogleLogin() {
        setError('');
        setIsSubmitting(true);
        try {
            await signInWithGoogle();
            const session = await legacyLogin();
            loginWithSession(session);
            navigate('/products');
        } catch (err) {
            setError(err.message || 'Google sign-in failed');
        } finally {
            setIsSubmitting(false);
        }
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
                backgroundColor: 'var(--surface-page)',
                justifyContent: stage === 'welcome' ? 'flex-end' : 'center',
                paddingBottom: stage === 'welcome' ? '80px' : undefined,
            }}
        >
            <SplashScreen isVisible={isSplashVisible} fadeMs={SPLASH_FADE_MS} />

            <ThemeToggle className="absolute top-6 right-6" />

            <div
                className="w-full max-w-[363px] flex flex-col items-center"
                style={stage === 'welcome' ? { gap: '165px' } : { gap: '24px' }}
            >

                <div className="flex flex-col items-center gap-6">
                    <LogoMark size={64} />
                    <h1
                        className="text-[24px] font-light -mt-2"
                        style={{ color: 'var(--text-primary)', fontFamily: '"SF Pro Display", -apple-system, system-ui, sans-serif', letterSpacing: '0.07em' }}
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
                                    background: 'var(--gradient-brand)',
                                    letterSpacing: '0.0035em',
                                }}
                            >
                                Login
                            </button>

                            <p className="text-[17px]" style={{ color: 'var(--text-primary)', letterSpacing:'0.0035em' }}>

                                Don&apos;t have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/signup')}
                                    className="font-semibold underline"
                                    style={{ color: 'var(--brand-200)' }}
                                >
                                    Sign up
                                </button>
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleContinueAsGuest}
                            className="text-[17px]"
                            style={{ color: 'var(--text-primary)', letterSpacing: '0.0035em' }}
                        >
                            Continue as guest
                        </button>
                    </div>
                )}

                {stage === 'form' && (
                    <>
                        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                            {features.googleSignIn && (
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={isSubmitting}
                                className="w-full py-[10px] rounded-full text-[17px] font-medium flex items-center justify-center gap-2"
                                style={{ border: '1px solid var(--neutral-400)', color: 'var(--text-primary)', opacity: isSubmitting ? 0.6 : 1 }}
                            >
                                <svg width={18} height={18} viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9A8.66 8.66 0 0 0 17.64 9.2Z" fill="#4285F4" />
                                    <path d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.81.55-1.85.87-3.06.87-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18Z" fill="#34A853" />
                                    <path d="M3.95 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l2.99-2.33Z" fill="#FBBC05" />
                                    <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.59 8.59 0 0 0 9 0 9 9 0 0 0 .96 4.96l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58Z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </button>
                            )}

                            {features.googleSignIn && (
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--neutral-400)' }} />
                                <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>or</span>
                                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--neutral-400)' }} />
                            </div>
                            )}

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
                                <p role="alert" className="text-[13px] text-red-400 -mt-2">{error}</p>
                            )}

                            <div className="flex flex-col gap-6">
                                <button
                                    type="submit"
                                    disabled={!canSubmit || isSubmitting}
                                    className="w-full py-[10px] rounded-full text-[17px] font-semibold"
                                    style={{
                                        background: canSubmit ? 'var(--gradient-brand)' : '#E5E5EA',
                                        color: canSubmit ? '#FFFFFF' : '#AEAEB2',
                                        letterSpacing: '0.0035em',
                                        opacity: isSubmitting ? 0.6 : 1,
                                    }}
                                >
                                    {isSubmitting ? 'Logging in...' : 'Login'}
                                </button>

                                {!resetSent ? (
                                    <button
                                        type="button"
                                        disabled={resetLoading}
                                        onClick={async () => {
                                            if (!username.includes('@')) {
                                                setError('Enter your email above first, then tap Forgot password.');
                                                return;
                                            }
                                            setResetLoading(true);
                                            setError('');
                                            try {
                                                await resetPassword(username);
                                                setResetSent(true);
                                            } catch {
                                                setError('Could not send reset email. Check the address and try again.');
                                            } finally {
                                                setResetLoading(false);
                                            }
                                        }}
                                        className="text-[13px] text-center"
                                        style={{ color: 'var(--neutral-500)', opacity: resetLoading ? 0.5 : 1 }}
                                    >
                                        {resetLoading ? 'Sending…' : 'Forgot password?'}
                                    </button>
                                ) : (
                                    <p className="text-[13px] text-center" style={{ color: '#168C34' }}>
                                        ✓ Reset link sent to {username}
                                    </p>
                                )}
                            </div>
                        </form>

                    </>
                )}
            </div>

            {stage === 'form' && (
                <p className="absolute bottom-12 text-[15px]" style={{ color: 'var(--text-primary)' }}>
                    Don&apos;t have an account?{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/signup')}
                        className="font-semibold"
                        style={{ color: 'var(--brand-200)' }}
                    >
                        Sign up
                    </button>
                </p>
            )}
        </div>
    );
}