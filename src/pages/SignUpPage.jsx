import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import FormInput from '../components/FormInput.jsx';
import LogoMark from '../components/LogoMark.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import KYCSuccess from '../assets/KYCSuccess.jsx';
import KycUploadRow from '../components/kyc/KycUploadRow.jsx';
import CheckIcon from '../assets/CheckIcon.jsx';
import { createUser, createProfile } from '../services/customerService.js';
import { checkPasswordPwned } from '../services/passwordService.js';
import { vaultLegacyCredentials } from '../services/credentialVault.js';
import {
    trackEvent,
    uploadKycDocument,
    sendVerificationEmail,
    sendExistingAccountEmail,
    isEmailVerificationLink,
    getStoredVerificationEmail,
    completeEmailVerification,
    signInWithGoogle,
} from '../services/firebase.js';

// Per the BRS "Qualifying Customer Types" table:
// 1 = Individual, 2 = Sole Prop, 3 = Non-Profit, 4 = CIPC, 5 = System-to-System.
// This flow only onboards individual customers.
const DEFAULT_CUSTOMER_TYPE_ID = 1;

const DOT_POSITIONS = [
    { top: 0, left: 18 },
    { top: 13, left: 0 },
    { top: 13, left: 36 },
    { top: 33, left: 0 },
    { top: 33, left: 36 },
    { top: 46, left: 18 },
];

function DotLoader() {
    return (
        <div className="relative" style={{ width: 49, height: 59 }}>
            {DOT_POSITIONS.map((pos, index) => (
                <span
                    key={index}
                    className="absolute rounded-full animate-pulse"
                    style={{
                        top: pos.top,
                        left: pos.left,
                        width: 13,
                        height: 13,
                        backgroundColor: index === 0 ? 'var(--brand-200)' : 'var(--neutral-300)',
                        animationDelay: `${index * 120}ms`,
                    }}
                />
            ))}
        </div>
    );
}

function VerifiedDocRow({ label }) {
    return (
        <div
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg"
            style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)' }}
        >
            <span className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
            <span
                className="flex items-center justify-center rounded-full"
                style={{ width: 22, height: 22, backgroundColor: '#34C759' }}
            >
                <CheckIcon width={13} height={13} color="#FFFFFF" />
            </span>
        </div>
    );
}


// email -> awaiting-verification -> details -> kyc -> submitting -> done
export default function SignUpPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [stage, setStage] = useState('email');
    const emailInputRef = useRef(null);

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [password, setPassword] = useState('');

    const [selfieFile, setSelfieFile] = useState(null);
    const [proofOfResidenceFile, setProofOfResidenceFile] = useState(null);

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEmailStepValid = email.includes('@');
    const isDetailsStepValid =
        firstName.trim().length > 0 && lastName.trim().length > 0 && idNumber.trim().length > 0;

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasLength = password.length >= 8;
    const isPasswordStepValid = hasLower && hasUpper && hasNumber && hasSpecial && hasLength;

    const [pwnedCount, setPwnedCount] = useState(0);
    const [isPwnedChecked, setIsPwnedChecked] = useState(false);

    // Soft-warn (don't block) if the password shows up in known breaches.
    // Debounced so we're not hashing/querying on every keystroke.
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isPasswordStepValid) {
                setPwnedCount(0);
                setIsPwnedChecked(false);
                return;
            }
            checkPasswordPwned(password)
                .then((count) => {
                    setPwnedCount(count);
                    setIsPwnedChecked(true);
                })
                .catch(() => {
                    setPwnedCount(0);
                    setIsPwnedChecked(false);
                });
        }, 500);

        return () => clearTimeout(timer);
    }, [password, isPasswordStepValid]);

    const isKycStepValid = selfieFile && proofOfResidenceFile;

    // On first load, check whether we got here via the verification email link.
    useEffect(() => {
        if (!isEmailVerificationLink()) {
            return;
        }


        queueMicrotask(() => {
            const storedEmail = getStoredVerificationEmail();
            if (!storedEmail) {
                // Link opened in a different browser/device than it was requested from.
                setError('Please re-enter your email to finish verifying.');
                return;
            }

            setStage('awaiting-verification');
            completeEmailVerification(storedEmail)
                .then(() => {
                    setEmail(storedEmail);
                    setStage('details');
                    // Clear the verification params out of the URL.
                    navigate('/signup', { replace: true });
                })
                .catch((err) => {
                    setError(err.message || 'Failed to verify email');
                    setStage('email');
                });
        });
    }, [navigate]);

    // Track which stage the user reaches, so we can later see where people drop out.
    useEffect(() => {
        trackEvent('registration_stage_view', { stage });
    }, [stage]);


    // Once verification is complete, ask for notification permission so we can
    // alert the user about claim/policy updates going forward.
    useEffect(() => {
        if (stage !== 'done') {
            return;
        }
        if (typeof Notification === 'undefined' || Notification.permission !== 'default') {
            return;
        }
        Notification.requestPermission().then((permission) => {
            trackEvent('notification_permission_responded', { permission });
        });
    }, [stage]);

    // If the user closes the tab/navigates away mid-flow (before reaching "done"),
    // record that as a drop-off — this is the Milestone 5 analytics requirement.
    useEffect(() => {
        return () => {
            if (stage !== 'done') {
                trackEvent('registration_abandoned', { last_stage: stage });
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Google already verifies the email for us, so the backend account just
    // needs *some* password — the user will always re-enter via Google.
    function generateRandomPassword() {
        const bytes = crypto.getRandomValues(new Uint8Array(24));
        return `${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}Aa1!`;
    }

    async function handleGoogleSignUp() {
        setError('');
        setIsSubmitting(true);
        try {
            const googleEmail = await signInWithGoogle();
            const generatedPassword = generateRandomPassword();

            let isNewAccount = true;
            try {
                await createUser(googleEmail, generatedPassword);
            } catch (err) {
                if (err.status !== 400) {
                    throw err;
                }
                // Account already exists for this Google email — just continue.
                isNewAccount = false;
            }

            if (isNewAccount) {
                // Only vault on the password we actually just set on the legacy
                // account — never overwrite with a guess for a pre-existing one.
                await vaultLegacyCredentials(googleEmail, generatedPassword);
            }

            setEmail(googleEmail);
            setPassword(generatedPassword);
            trackEvent('registration_google_signup');
            setStage('details');
        } catch (err) {
            setError(err.message || 'Google sign-in failed');
        } finally {
            setIsSubmitting(false);
        }
    }
    async function handleEmailSubmit(e) {
        e.preventDefault();
        if (!isEmailStepValid || !isPasswordStepValid) {
            return;
        }

        setError('');
        setIsSubmitting(true);
        try {
            try {
                await createUser(email, password);
                await sendVerificationEmail(email);
            } catch (err) {
                if (err.status !== 400) {
                    throw err;
                }
                await sendExistingAccountEmail(email);
            }
            setStage('awaiting-verification');
        } catch (err) {
            setError(err.message || 'Failed to send verification email');
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleDetailsSubmit(e) {
        e.preventDefault();
        if (!isDetailsStepValid) {
            return;
        }
        setError('');
        setStage('kyc');
    }

    async function handleKycSubmit(e) {
        e.preventDefault();
        if (!isKycStepValid) {
            return;
        }

        setError('');
        setIsSubmitting(true);
        setStage('submitting');

        try {
            const { token } = await login(email, password);

            await createProfile(
                {
                    email,
                    firstName,
                    lastName,
                    idNumber,
                    customerTypeId: DEFAULT_CUSTOMER_TYPE_ID,
                },
                token
            );

            await Promise.all([
                uploadKycDocument(email, 'selfie', selfieFile),
                uploadKycDocument(email, 'proof-of-residence', proofOfResidenceFile),
            ]);

            trackEvent('registration_completed');
            setStage('done');
        } catch (err) {
            setError(err.message || 'Registration failed');
            setStage('kyc');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-6"
            style={{ backgroundColor: 'var(--surface-page)' }}
        >
            {stage !== 'email' && <ThemeToggle className="absolute top-6 right-6" />}

            {stage === 'email' && (
                <>
                    <div
                        className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full"
                        style={{ width: 36, height: 5, backgroundColor: 'var(--neutral-400)' }}
                    />
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        aria-label="Close"
                        className="absolute top-4 right-4 text-[20px] leading-none"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        ×
                    </button>
                </>
            )}

            <div className="w-full max-w-[363px] flex flex-col items-center gap-8">
                {stage !== 'kyc' && stage !== 'email' && (
                    <div className="flex flex-col items-center gap-6">
                        <LogoMark size={64} />
                        <h1
                            className="text-[24px] font-light -mt-2"
                            style={{ color: 'var(--text-primary)', fontFamily: '"SF Pro Display", -apple-system, system-ui, sans-serif', letterSpacing: '0.07em' }}
                        >
                            InsureTech<strong className="font-bold">Guard</strong>
                        </h1>
                    </div>
                )}

                {stage === 'email' && (
                    <div className="flex flex-col items-center gap-2 text-center mt-6">
                        <h1 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
                            Create your account
                        </h1>
                        <p className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>
                            Create a profile, browse and subscribe to our range of products.
                        </p>
                    </div>
                )}

                {stage === 'email' && (
                    <form onSubmit={handleEmailSubmit} className="w-full flex flex-col gap-6">
                        <button
                            type="button"
                            onClick={handleGoogleSignUp}
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

                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--neutral-400)' }} />
                            <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>or</span>
                            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--neutral-400)' }} />
                        </div>


                        <div className="flex flex-col gap-4">
                            <FormInput
                                id="email"
                                label="Email"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                inputRef={emailInputRef}
                                autoFocus
                            />

                            <FormInput
                                id="password"
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="flex flex-row gap-2">
                            {[
                                password.length === 0 ? null : hasLower,
                                password.length === 0 ? null : hasUpper,
                                password.length === 0 ? null : hasNumber,
                                password.length === 0 ? null : hasSpecial,
                                password.length === 0 ? null : hasLength,
                                isPwnedChecked ? pwnedCount === 0 : null,
                            ].map((isMet, index) => (
                                <div
                                    key={index}
                                    className="flex-1 h-[6px] rounded-full"
                                    style={{
                                        background:
                                            isMet === null
                                                ? 'var(--neutral-400)'
                                                : isMet
                                                    ? '#34C759'
                                                    : '#FF3B30',
                                    }}
                                />
                            ))}
                        </div>

                        <ul className="text-[13px] flex flex-col gap-1" style={{ color: 'var(--text-secondary)' }}>
                            <li style={{ color: hasLower ? '#34C759' : 'var(--text-secondary)' }}>One lowercase character</li>
                            <li style={{ color: hasUpper ? '#34C759' : 'var(--text-secondary)' }}>One uppercase character</li>
                            <li style={{ color: hasNumber ? '#34C759' : 'var(--text-secondary)' }}>One number/digit</li>
                            <li style={{ color: hasSpecial ? '#34C759' : 'var(--text-secondary)' }}>One special symbol</li>
                            <li style={{ color: hasLength ? '#34C759' : 'var(--text-secondary)' }}>8 characters</li>
                        </ul>

                        {pwnedCount > 0 && (
                            <p className="text-[13px] -mt-2" style={{ color: '#FFD60A' }}>
                                This password has appeared in {pwnedCount.toLocaleString()} known data
                                breaches. We recommend choosing a different one.
                            </p>
                        )}

                        {error && <p className="text-[13px] text-red-400 -mt-2">{error}</p>}

                        <button
                            type="submit"
                            disabled={!isEmailStepValid || !isPasswordStepValid || isSubmitting}
                            className="w-full py-[10px] rounded-full text-[17px] font-semibold"
                            style={{
                                background: isEmailStepValid && isPasswordStepValid ? 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)' : '#E5E5EA',
                                color: isEmailStepValid && isPasswordStepValid ? '#FFFFFF' : '#AEAEB2',
                                letterSpacing: '0.0035em',
                                opacity: isSubmitting ? 0.6 : 1,
                            }}
                        >
                            {isSubmitting ? 'Sending...' : 'Next'}
                        </button>

                        <p className="text-[15px] text-center" style={{ color: 'var(--text-primary)' }}>
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="font-semibold underline"
                                style={{ color: 'var(--brand-200)' }}
                            >
                                Log in
                            </button>
                        </p>

                        <p className="text-[12px] text-center" style={{ color: 'var(--text-secondary)' }}>
                            By continuing, you agree to our{' '}
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Terms of Service</span>{' '}
                            and acknowledge that you have read our{' '}
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Privacy Policy</span>{' '}
                            to learn how we collect, use, and share your data.
                        </p>
                    </form>
                )}

                {stage === 'awaiting-verification' && (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <p className="text-[17px]" style={{ color: 'var(--text-primary)' }}>
                            We&apos;ve sent a link to <strong>{email}</strong>.
                        </p>
                        <p className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>
                            Open the email and click the link to continue.
                        </p>
                        {error && <p className="text-[13px] text-red-400">{error}</p>}
                        <button
                            type="button"
                            onClick={handleEmailSubmit}
                            className="text-[15px] underline"
                            style={{ color: 'var(--brand-200)' }}
                        >
                            Resend email
                        </button>
                    </div>
                )}

                {stage === 'details' && (
                    <form onSubmit={handleDetailsSubmit} className="w-full flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <FormInput
                                id="firstName"
                                label="Name"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                autoComplete="given-name"
                                autoFocus
                            />
                            <FormInput
                                id="lastName"
                                label="Surname"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                autoComplete="family-name"
                            />
                            <FormInput
                                id="idNumber"
                                label="ID number"
                                type="text"
                                value={idNumber}
                                onChange={(e) => setIdNumber(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!isDetailsStepValid}
                            className="w-full py-[10px] rounded-full text-[17px] font-semibold"
                            style={{
                                background: isDetailsStepValid ? 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)' : '#E5E5EA',
                                color: isDetailsStepValid ? '#FFFFFF' : '#AEAEB2',
                                letterSpacing: '0.0035em',
                            }}
                        >
                            Next
                        </button>
                    </form>
                )}

                {stage === 'kyc' && (
                    <form onSubmit={handleKycSubmit} className="w-full flex flex-col items-center gap-6">
                        <KYCSuccess width={150} height={113} />

                        <div className="flex flex-col items-center gap-2">
                            <h2 className="text-[20px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                Identity verification
                            </h2>
                            <p className="text-[15px] text-center" style={{ color: 'var(--text-secondary)' }}>
                                We are committed to providing a safe, secure experience for our
                                community and therefore your account must be verified by
                                completing a KYC verification.
                            </p>
                        </div>

                        <div className="w-full flex flex-col gap-2">
                            <KycUploadRow
                                label="Proof of residence"
                                status={proofOfResidenceFile ? 'Uploaded' : 'Proof of identity'}
                                isUploaded={!!proofOfResidenceFile}
                                capture="environment"
                                onSelect={(file) => setProofOfResidenceFile(file)}
                            />
                            <KycUploadRow
                                label="Selfie upload"
                                status={selfieFile ? 'Uploaded' : 'Proof of identity'}
                                isUploaded={!!selfieFile}
                                capture="user"
                                onSelect={(file) => setSelfieFile(file)}
                            />
                        </div>

                        {error && <p className="text-[13px] text-red-400 -mt-2">{error}</p>}

                        <button
                            type="submit"
                            disabled={!isKycStepValid || isSubmitting}
                            className="w-full py-[10px] rounded-full text-[17px] font-semibold"
                            style={{
                                background: isKycStepValid ? 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)' : '#E5E5EA',
                                color: isKycStepValid ? '#FFFFFF' : '#AEAEB2',
                                letterSpacing: '0.0035em',
                                opacity: isSubmitting ? 0.6 : 1,
                            }}
                        >
                            Submit
                        </button>

                    </form>
                )}

                {stage === 'submitting' && (
                    <div className="flex flex-col items-center gap-5">
                        <DotLoader />
                        <p
                            className="text-[17px] font-semibold text-center"
                            style={{ color: 'var(--text-secondary)', letterSpacing: '0.0035em' }}
                        >
                            Completing your profile
                        </p>
                    </div>
                )}

                {stage === 'done' && (
                    <div className="flex flex-col items-center gap-6">
                        <p className="text-[17px] text-center" style={{ color: 'var(--text-primary)' }}>
                            You&apos;re all set! Your account has been created.
                        </p>

                        <KYCSuccess width={150} height={113} verified />

                        <div className="flex flex-col items-center gap-2">
                            <h2 className="text-[20px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                Identity verification successful
                            </h2>
                            <p className="text-[15px] text-center" style={{ color: 'var(--text-secondary)' }}>
                                Your documents have been submitted and your identity has been verified.
                            </p>
                        </div>

                        <div className="w-full flex flex-col gap-2">
                            <VerifiedDocRow label="Proof of residence" />
                            <VerifiedDocRow label="Selfie upload" />
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/products')}
                            className="w-full py-[10px] rounded-full text-[17px] font-semibold text-white"
                            style={{ background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)', letterSpacing: '0.0035em' }}
                        >
                            Continue to Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}