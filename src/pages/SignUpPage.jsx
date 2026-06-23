import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import FormInput from '../components/FormInput.jsx';
import LogoMark from '../components/LogoMark.jsx';
import { createUser, createProfile } from '../services/customerService.js';
import {
    trackEvent,
    uploadKycDocument,
    sendVerificationEmail,
    sendExistingAccountEmail,
    isEmailVerificationLink,
    getStoredVerificationEmail,
    completeEmailVerification,
} from '../services/firebase.js';

// TODO: confirm the real customerTypeId values with the backend team (BRS
// "Qualifying Customer Types" table) — defaulting to 1 (individual) for now.
const DEFAULT_CUSTOMER_TYPE_ID = 1;

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
            style={{ backgroundColor: 'var(--brand-300)' }}
        >
            <div className="w-full max-w-[363px] flex flex-col items-center gap-8">
                <div className="flex flex-col items-center gap-6">
                    <LogoMark size={64} />
                    <h1
                        className="text-[24px] font-light text-white -mt-2"
                        style={{ fontFamily: '"SF Pro Display", -apple-system, system-ui, sans-serif', letterSpacing: '0.07em' }}
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

                        <ul className="text-[13px] flex flex-col gap-1" style={{ color: '#8E8E93' }}>
                            <li style={{ color: hasLower ? '#34C759' : '#8E8E93' }}>One lowercase character</li>
                            <li style={{ color: hasUpper ? '#34C759' : '#8E8E93' }}>One uppercase character</li>
                            <li style={{ color: hasNumber ? '#34C759' : '#8E8E93' }}>One number/digit</li>
                            <li style={{ color: hasSpecial ? '#34C759' : '#8E8E93' }}>One special symbol</li>
                            <li style={{ color: hasLength ? '#34C759' : '#8E8E93' }}>8 characters</li>
                        </ul>

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
                        <p className="text-[17px] text-white">
                            We&apos;ve sent a link to <strong>{email}</strong>.
                        </p>
                        <p className="text-[15px]" style={{ color: '#8E8E93' }}>
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
                    <form onSubmit={handleKycSubmit} className="w-full flex flex-col gap-6">
                        <p className="text-[15px] text-center" style={{ color: '#8E8E93' }}>
                            We need to verify your identity. Please upload a selfie and a proof of residence (e.g. a utility bill).
                        </p>

                        <div className="flex flex-col gap-4">
                            <label className="text-[15px] text-white flex flex-col gap-2">
                                Selfie
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="user"
                                    onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
                                />
                            </label>

                            <label className="text-[15px] text-white flex flex-col gap-2">
                                Proof of residence
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setProofOfResidenceFile(e.target.files?.[0] ?? null)}
                                />
                            </label>
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
                    <p className="text-[15px] text-white">Creating your account...</p>
                )}

                {stage === 'done' && (
                    <div className="flex flex-col items-center gap-6">
                        <p className="text-[17px] text-white text-center">
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
