import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import FormInput from '../components/FormInput.jsx';
import LogoMark from '../components/LogoMark.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import CheckIcon from '../assets/CheckIcon.jsx';
import KYCSuccess from '../assets/KYCSuccess.jsx';
import KycUploadSheet from '../components/KycUploadSheet.jsx';
import { createUser, createProfile } from '../services/customerService.js';
import { checkPasswordPwned } from '../services/passwordService.js';
import {
    trackEvent,
    uploadKycDocument,
    sendVerificationEmail,
    sendExistingAccountEmail,
    isEmailVerificationLink,
    getStoredVerificationEmail,
    completeEmailVerification,
} from '../services/firebase.js';

// Per the BRS "Qualifying Customer Types" table:
// 1 = Individual, 2 = Sole Prop, 3 = Non-Profit, 4 = CIPC, 5 = System-to-System.
// This flow only onboards individual customers.
const DEFAULT_CUSTOMER_TYPE_ID = 1;

function KycUploadRow({ label, status, isUploaded, capture, onSelect }) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsSheetOpen(true)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left"
                style={{ backgroundColor: 'var(--surface-field)' }}
            >
                <span className="flex flex-col">
                    <span className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
                    <span className="text-[13px]" style={{ color: isUploaded ? '#34C759' : 'var(--text-secondary)' }}>
                        {status}
                    </span>
                </span>
                {isUploaded ? (
                    <CheckIcon width={20} height={20} color="#34C759" />
                ) : (
                    <svg width={8} height={14} viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L7 7L1 13" stroke="var(--text-secondary)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </button>

            <KycUploadSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                onConfirm={onSelect}
                capture={capture}
            />
        </>
    );
}

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
    }, [navigate]);

    // Track which stage the user reaches, so we can later see where people drop out.
    useEffect(() => {
        trackEvent('registration_stage_view', { stage });
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

    // Tries to create the account silently. If the email is already taken,
    // we don't tell the user — we send them a sign-in link instead and show
    // the exact same "check your email" screen either way, so the response
    // never reveals whether the account already existed.
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
            <ThemeToggle className="absolute top-6 right-6" />

            <div className="w-full max-w-[363px] flex flex-col items-center gap-8">
                <div className="flex flex-col items-center gap-6">
                    <LogoMark size={64} />
                    <h1
                        className="text-[24px] font-light -mt-2"
                        style={{ color: 'var(--text-primary)', fontFamily: '"SF Pro Display", -apple-system, system-ui, sans-serif', letterSpacing: '0.07em' }}
                    >
                        InsureTech<strong className="font-bold">Guard</strong>
                    </h1>
                </div>

                {stage === 'email' && (
                    <form onSubmit={handleEmailSubmit} className="w-full flex flex-col gap-6">
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
                        <KYCSuccess width={120} height={133} />

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
                        <button
                            type="button"
                            onClick={() => navigate('/products')}
                            className="w-full py-[10px] rounded-full text-[17px] font-semibold text-white"
                            style={{ background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)', letterSpacing: '0.0035em' }}
                        >
                            Continue
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}