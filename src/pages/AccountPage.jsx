import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import KycUploadRow from '../components/kyc/KycUploadRow.jsx';
import KYCSuccess from '../assets/KYCSuccess.jsx';
import { uploadKycDocument, trackEvent, changePassword, changeEmail, getSignInProvider, auth as firebaseAuth, resetPassword } from '../services/firebase.js';
import { getKycStatus } from '../services/kycStatus.js';
import { getProfile, getTypes, updateCustomerType, addAccount, removeAccount, postKycStatus, seedDhaData } from '../services/customerService.js';
import { useToast } from '../context/ToastContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

// ─── Change Password form ──────────────────────────────────────────────────────
function ChangePasswordForm({ isGoogleUser, onDone, onCancel, onSuccess }) {
    const [current, setCurrent]       = useState('');
    const [next, setNext]             = useState('');
    const [confirm, setConfirm]       = useState('');
    const [saving, setSaving]         = useState(false);
    const [error, setError]           = useState('');
    const [success, setSuccess]       = useState(false);
    const [resetSent, setResetSent]   = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!isGoogleUser && !current) { setError('Enter your current password.'); return; }
        if (next.length < 8)           { setError('New password must be at least 8 characters.'); return; }
        if (next !== confirm)          { setError('Passwords do not match.'); return; }
        setSaving(true);
        try {
            await changePassword(isGoogleUser ? null : current, next);
            setSuccess(true);
            onSuccess?.('Password updated successfully.');
            setTimeout(onDone, 800);
        } catch (err) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Current password is incorrect.');
            } else if (err.code === 'auth/requires-recent-login') {
                setError('Session expired. Please log out and sign in again before changing your password.');
            } else {
                setError(err.message || 'Something went wrong.');
            }
        } finally {
            setSaving(false);
        }
    }

    if (success) {
        return (
            <div className="flex items-center gap-2 py-2" style={{ color: '#168C34', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#168C34"/><path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Password updated!
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-1">
            {isGoogleUser && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-[8px]" style={{ background: '#EFF4FF', border: '1px solid #C7D9FF' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="8" cy="8" r="8" fill="#1860BF" /><path d="M8 5v1M8 8v3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#1860BF' }}>
                        Your account uses Google sign-in. A Google popup will appear to confirm your identity.
                    </p>
                </div>
            )}
            {!isGoogleUser && (
                <div className="flex flex-col gap-1">
                    <input
                        type="password"
                        value={current}
                        onChange={(e) => setCurrent(e.target.value)}
                        placeholder="Current password"
                        autoComplete="current-password"
                        className="w-full h-[44px] rounded-[10px] px-3 border"
                        style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: '#C7C7CC', outline: 'none' }}
                    />
                    {!resetSent ? (
                        <button
                            type="button"
                            disabled={resetLoading}
                            onClick={async () => {
                                const email = firebaseAuth.currentUser?.email;
                                if (!email) return;
                                setResetLoading(true);
                                try {
                                    await resetPassword(email);
                                    setResetSent(true);
                                } catch {
                                    setError('Could not send reset email. Try again.');
                                } finally {
                                    setResetLoading(false);
                                }
                            }}
                            className="self-start text-left"
                            style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#1860BF', opacity: resetLoading ? 0.5 : 1 }}
                        >
                            {resetLoading ? 'Sending…' : 'Forgot your password? Send reset email'}
                        </button>
                    ) : (
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#168C34' }}>
                            ✓ Reset link sent to your email
                        </p>
                    )}
                </div>
            )}
            <input
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="New password (min 8 characters)"
                autoComplete="new-password"
                className="w-full h-[44px] rounded-[10px] px-3 border"
                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: '#C7C7CC', outline: 'none' }}
            />
            <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="w-full h-[44px] rounded-[10px] px-3 border"
                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: '#C7C7CC', outline: 'none' }}
            />
            {error && <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#C51C13' }}>{error}</p>}
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 h-[42px] rounded-full text-white font-semibold"
                    style={{ background: saving ? '#A0AEC0' : 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)', fontFamily: 'Roboto, sans-serif', fontSize: 15 }}
                >
                    {saving ? (isGoogleUser ? 'Opening Google…' : 'Saving…') : 'Update password'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="h-[42px] px-5 rounded-full border font-semibold"
                    style={{ borderColor: '#C7C7CC', fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#3C3C43' }}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

// ─── Change Email form ─────────────────────────────────────────────────────────
function ChangeEmailForm({ currentEmail, isGoogleUser, onDone, onCancel, onSuccess }) {
    const [current, setCurrent]   = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [saving, setSaving]     = useState(false);
    const [error, setError]       = useState('');
    const [sent, setSent]         = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!isGoogleUser && !current) { setError('Enter your current password.'); return; }
        if (!newEmail.includes('@'))   { setError('Enter a valid email address.'); return; }
        if (newEmail === currentEmail) { setError('That\'s already your current email.'); return; }
        setSaving(true);
        try {
            await changeEmail(isGoogleUser ? null : current, newEmail);
            setSent(true);
            onSuccess?.(`Verification sent to ${newEmail} — click the link to confirm.`);
        } catch (err) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Current password is incorrect.');
            } else if (err.code === 'auth/requires-recent-login') {
                setError('Session expired. Please log out and sign in again before changing your email.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('That email is already registered to another account.');
            } else {
                setError(err.message || 'Something went wrong.');
            }
        } finally {
            setSaving(false);
        }
    }

    if (sent) {
        return (
            <div className="flex flex-col gap-2 py-2">
                <div className="flex items-center gap-2" style={{ color: '#168C34', fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 600 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#168C34"/><path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Verification email sent!
                </div>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#8E8E93' }}>
                    Check <strong>{newEmail}</strong> and click the link to confirm the change. Your current email stays active until then.
                </p>
                <button onClick={onDone} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#1860BF', textAlign: 'left', fontWeight: 600 }}>Done</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-1">
            {isGoogleUser && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-[8px]" style={{ background: '#EFF4FF', border: '1px solid #C7D9FF' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="8" cy="8" r="8" fill="#1860BF" /><path d="M8 5v1M8 8v3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#1860BF' }}>
                        Your account uses Google sign-in. A Google popup will appear to confirm your identity.
                    </p>
                </div>
            )}
            {!isGoogleUser && (
                <input
                    type="password"
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    placeholder="Current password"
                    autoComplete="current-password"
                    className="w-full h-[44px] rounded-[10px] px-3 border"
                    style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: '#C7C7CC', outline: 'none' }}
                />
            )}
            <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="New email address"
                autoComplete="email"
                className="w-full h-[44px] rounded-[10px] px-3 border"
                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: '#C7C7CC', outline: 'none' }}
            />
            {error && <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#C51C13' }}>{error}</p>}
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#8E8E93' }}>
                A confirmation link will be sent to the new address. Your current email stays active until you click it.
            </p>
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 h-[42px] rounded-full text-white font-semibold"
                    style={{ background: saving ? '#A0AEC0' : 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)', fontFamily: 'Roboto, sans-serif', fontSize: 15 }}
                >
                    {saving ? (isGoogleUser ? 'Opening Google…' : 'Sending…') : 'Update email'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="h-[42px] px-5 rounded-full border font-semibold"
                    style={{ borderColor: '#C7C7CC', fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#3C3C43' }}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default function AccountPage() {
    const navigate = useNavigate();
    const { auth, isLoggedIn, logout } = useAuth();
    const { showToast } = useToast();
    const { preference: themePref, setThemePreference } = useTheme();

    const [status, setStatus]             = useState(null);
    const [uploadError, setUploadError]   = useState('');

    // Profile + types
    const [profile, setProfile]           = useState(null);
    const [types, setTypes]               = useState(null);   // { customerTypes, accountTypes }
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState('');

    // Customer type
    const [settingType, setSettingType]   = useState(false);
    const [typeError, setTypeError]       = useState('');

    // Account management
    const [accountLoading, setAccountLoading] = useState(null); // accountTypeId being toggled

    // Credential editing
    const [editingCredential, setEditingCredential] = useState(null); // null | 'password' | 'email'
    const isGoogleUser = getSignInProvider() === 'google.com';

    useEffect(() => {
        if (!isLoggedIn) {
            setStatus(null);
            setProfile(null);
            setTypes(null);
            return;
        }
        getKycStatus(auth.customerId).then(setStatus);
        loadProfileAndTypes();
    }, [isLoggedIn, auth?.customerId]);

    async function loadProfileAndTypes() {
        setProfileLoading(true);
        setProfileError('');
        try {
            const [profileData, typesData] = await Promise.all([
                getProfile(auth.token),
                getTypes(auth.token),
            ]);
            setProfile(profileData);
            setTypes(typesData);
        } catch (err) {
            setProfileError(err.message || 'Failed to load account data');
        } finally {
            setProfileLoading(false);
        }
    }

    const isVerified = status?.proofOfResidence && status?.selfie;

    async function handleUpload(docType, file) {
        setUploadError('');
        try {
            await uploadKycDocument(auth.customerId, docType, file);
            trackEvent('kyc_document_updated', { docType });
            const newStatus = await getKycStatus(auth.customerId);
            setStatus(newStatus);

            // Once both docs are uploaded, sync KYC + DHA to backend
            if (newStatus.proofOfResidence && newStatus.selfie) {
                const p = profile ?? await getProfile(auth.token);
                const numericCustomerId = p?.id ?? auth.customerId;
                await postKycStatus(
                    numericCustomerId,
                    { primaryIndicator: true, secondaryIndicator: true, taxCompliance: 'amber' },
                    auth.token,
                );
                try {
                    if (p?.idNumber) await seedDhaData(p.idNumber, auth.token);
                } catch (_) {
                    // non-fatal
                }
            }
        } catch (err) {
            setUploadError(err.message || 'Failed to upload document');
        }
    }

    async function handleSelectCustomerType(typeId) {
        if (profile?.customerType) return; // locked — already set
        setSettingType(true);
        setTypeError('');
        try {
            const updated = await updateCustomerType(typeId, auth.token);
            setProfile((prev) => ({
                ...prev,
                customerType: updated?.customerType ?? types?.customerTypes?.find((t) => t.id === typeId) ?? { id: typeId },
                ...(updated ?? {}),
            }));
        } catch (err) {
            setTypeError(err.message || 'Failed to update customer type');
        } finally {
            setSettingType(false);
        }
    }

    async function handleToggleAccount(accountTypeId, isCurrentlyAdded) {
        setAccountLoading(accountTypeId);
        try {
            if (isCurrentlyAdded) {
                await removeAccount(accountTypeId, auth.token);
            } else {
                await addAccount(accountTypeId, auth.token);
            }
            // Reload profile to get fresh account list
            const updated = await getProfile(auth.token);
            setProfile(updated);
        } catch (err) {
            // silently ignore — could show toast in future
        } finally {
            setAccountLoading(null);
        }
    }

    // Derive current account type IDs from profile
    const currentAccountTypeIds = new Set(
        (profile?.customerAccounts ?? profile?.accounts ?? []).map((a) => a.accountTypeId ?? a.id ?? a.typeId)
    );

    const currentCustomerType = profile?.customerType ?? types?.customerTypes?.find(
        (t) => t.id === (profile?.customerTypeId ?? profile?.customerType?.id)
    );

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-[411px] md:max-w-[480px] mx-auto pt-[73px] pb-[88px] md:pb-16 px-6 flex flex-col items-center gap-6">
                <h1 className="text-[20px] font-semibold mt-6" style={{ color: '#000000' }}>
                    Account
                </h1>

                {!isLoggedIn && (
                    <div className="w-full flex flex-col items-center gap-4 text-center">
                        <p className="text-[15px]" style={{ color: '#8E8E93' }}>
                            Sign in to view your profile and manage identity verification.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="w-full py-[10px] rounded-full text-[17px] font-semibold"
                            style={{
                                background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)',
                                color: '#FFFFFF',
                                letterSpacing: '0.0035em',
                            }}
                        >
                            Sign in
                        </button>
                        <p className="text-[15px]" style={{ color: '#8E8E93' }}>
                            Don&apos;t have an account?{' '}
                            <button onClick={() => navigate('/signup')} className="font-semibold" style={{ color: '#1860BF' }}>
                                Sign up
                            </button>
                        </p>
                    </div>
                )}

                {isLoggedIn && (
                    <>
                        {/* ── Account details ── */}
                        <div className="w-full flex flex-col gap-3">
                            <h2 className="text-[13px] font-semibold uppercase" style={{ color: '#8E8E93', letterSpacing: '0.05em' }}>
                                Account details
                            </h2>

                            {/* Email row */}
                            <div
                                className="w-full px-4 py-3 rounded-lg flex flex-col gap-2"
                                style={{ border: '1px solid #E5E5EA' }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[12px]" style={{ color: '#8E8E93', fontFamily: 'Roboto, sans-serif' }}>Email / Username</p>
                                        <p className="text-[15px] font-semibold" style={{ color: '#000000', fontFamily: 'Roboto, sans-serif' }}>
                                            {firebaseAuth.currentUser?.email ?? '—'}
                                        </p>
                                    </div>
                                    {editingCredential !== 'email' && (
                                        <button
                                            onClick={() => setEditingCredential('email')}
                                            className="px-3 py-1 rounded-full text-[13px] font-semibold border"
                                            style={{ borderColor: '#1860BF', color: '#1860BF', fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            Change
                                        </button>
                                    )}
                                </div>
                                {editingCredential === 'email' && (
                                    <ChangeEmailForm
                                        currentEmail={firebaseAuth.currentUser?.email ?? ''}
                                        isGoogleUser={isGoogleUser}
                                        onDone={() => setEditingCredential(null)}
                                        onCancel={() => setEditingCredential(null)}
                                        onSuccess={(msg) => showToast(msg, 'success')}
                                    />
                                )}
                            </div>

                            {/* Password row */}
                            <div
                                className="w-full px-4 py-3 rounded-lg flex flex-col gap-2"
                                style={{ border: '1px solid #E5E5EA' }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[12px]" style={{ color: '#8E8E93', fontFamily: 'Roboto, sans-serif' }}>Password</p>
                                        <p className="text-[15px] font-semibold" style={{ color: '#000000', fontFamily: 'Roboto, sans-serif' }}>
                                            {isGoogleUser ? 'Managed by Google' : '••••••••'}
                                        </p>
                                    </div>
                                    {editingCredential !== 'password' && (
                                        <button
                                            onClick={() => setEditingCredential('password')}
                                            className="px-3 py-1 rounded-full text-[13px] font-semibold border"
                                            style={{ borderColor: '#1860BF', color: '#1860BF', fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            {isGoogleUser ? 'Set password' : 'Change'}
                                        </button>
                                    )}
                                </div>
                                {editingCredential === 'password' && (
                                    <ChangePasswordForm
                                        isGoogleUser={isGoogleUser}
                                        onDone={() => setEditingCredential(null)}
                                        onCancel={() => setEditingCredential(null)}
                                        onSuccess={(msg) => showToast(msg, 'success')}
                                    />
                                )}
                            </div>

                            {isGoogleUser && (
                                <p className="text-[12px]" style={{ color: '#8E8E93', fontFamily: 'Roboto, sans-serif' }}>
                                    Your account was created with Google. Identity changes require a Google re-authentication popup.
                                </p>
                            )}
                        </div>

                        {/* ── KYC incomplete banner ── */}
                        {!isVerified && status !== null && (
                            <div
                                className="w-full flex items-start gap-3 px-4 py-3 rounded-[12px]"
                                style={{ background: '#FFF8E6', border: '1px solid #FFD97A' }}
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                                    <circle cx="10" cy="10" r="10" fill="#F5A623" />
                                    <rect x="9" y="5" width="2" height="6" rx="1" fill="white" />
                                    <circle cx="10" cy="14" r="1" fill="white" />
                                </svg>
                                <div className="flex-1">
                                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 600, color: '#7A4F00' }}>
                                        Your account is incomplete
                                    </p>
                                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#7A4F00', marginTop: 2 }}>
                                        Upload your proof of residence and selfie below to unlock all products.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── KYC section ── */}
                        <div className="w-full flex flex-col items-center gap-3 text-center">
                            {isVerified ? (
                                <KYCSuccess width={120} height={90} verified />
                            ) : null}
                            <p className="text-[17px] font-semibold" style={{ color: '#000000' }}>
                                {isVerified ? 'Identity verified' : 'Identity not verified'}
                            </p>
                            <p className="text-[15px]" style={{ color: '#8E8E93' }}>
                                {isVerified
                                    ? 'Your proof of residence and selfie are on file.'
                                    : 'Upload a proof of residence and selfie to verify your identity.'}
                            </p>
                        </div>

                        <div className="w-full flex flex-col gap-3">
                            <h2 className="text-[13px] font-semibold uppercase" style={{ color: '#8E8E93', letterSpacing: '0.05em' }}>
                                Verification documents
                            </h2>
                            {status ? (
                                <div className="flex flex-col gap-2">
                                    <KycUploadRow
                                        label="Proof of residence"
                                        status={status.proofOfResidence ? 'Uploaded · Tap to update' : 'Not uploaded'}
                                        isUploaded={status.proofOfResidence}
                                        capture="environment"
                                        onSelect={(file) => handleUpload('proof-of-residence', file)}
                                    />
                                    <KycUploadRow
                                        label="Selfie upload"
                                        status={status.selfie ? 'Uploaded · Tap to update' : 'Not uploaded'}
                                        isUploaded={status.selfie}
                                        capture="user"
                                        onSelect={(file) => handleUpload('selfie', file)}
                                    />
                                </div>
                            ) : (
                                <p className="text-[15px]" style={{ color: '#8E8E93' }}>Checking document status…</p>
                            )}
                            {uploadError && <p className="text-[13px] text-red-500">{uploadError}</p>}
                        </div>

                        {/* ── Customer type ── */}
                        <div className="w-full flex flex-col gap-3">
                            <h2 className="text-[13px] font-semibold uppercase" style={{ color: '#8E8E93', letterSpacing: '0.05em' }}>
                                Customer type
                            </h2>

                            {profileLoading && (
                                <p className="text-[15px]" style={{ color: '#8E8E93' }}>Loading…</p>
                            )}

                            {!profileLoading && profileError && (
                                <p className="text-[13px] text-red-500">{profileError}</p>
                            )}

                            {!profileLoading && types && (
                                profile?.customerType ? (
                                    /* Already set — locked */
                                    <div
                                        className="w-full px-4 py-3 rounded-lg flex items-center justify-between"
                                        style={{ backgroundColor: '#F2F2F7' }}
                                    >
                                        <div>
                                            <p className="text-[15px] font-semibold" style={{ color: '#000000' }}>
                                                {currentCustomerType?.name ?? `Type ${profile.customerTypeId}`}
                                            </p>
                                            <p className="text-[12px]" style={{ color: '#8E8E93' }}>
                                                Customer type cannot be changed once set.
                                            </p>
                                        </div>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M14 8V6a4 4 0 10-8 0v2" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" />
                                            <rect x="3" y="8" width="14" height="10" rx="2" fill="#8E8E93" opacity=".3" />
                                            <rect x="3" y="8" width="14" height="10" rx="2" stroke="#8E8E93" strokeWidth="1.5" />
                                        </svg>
                                    </div>
                                ) : (
                                    /* Not set — show picker */
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[13px]" style={{ color: '#8E8E93' }}>
                                            Select your customer type. This cannot be changed once set.
                                        </p>
                                        {types.customerTypes?.map((ct) => (
                                            <button
                                                key={ct.id}
                                                disabled={settingType}
                                                onClick={() => handleSelectCustomerType(ct.id)}
                                                className="w-full px-4 py-3 rounded-lg text-left border"
                                                style={{
                                                    borderColor: '#C7C7CC',
                                                    backgroundColor: '#FFFFFF',
                                                    opacity: settingType ? 0.6 : 1,
                                                }}
                                            >
                                                <p className="text-[15px] font-semibold" style={{ color: '#000000' }}>
                                                    {ct.name}
                                                </p>
                                                {ct.description && (
                                                    <p className="text-[12px] mt-0.5" style={{ color: '#8E8E93' }}>{ct.description}</p>
                                                )}
                                            </button>
                                        ))}
                                        {typeError && <p className="text-[13px] text-red-500">{typeError}</p>}
                                    </div>
                                )
                            )}
                        </div>

                        {/* ── Accounts ── */}
                        <div className="w-full flex flex-col gap-3">
                            <h2 className="text-[13px] font-semibold uppercase" style={{ color: '#8E8E93', letterSpacing: '0.05em' }}>
                                Accounts
                            </h2>

                            {!profileLoading && types?.accountTypes?.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    {types.accountTypes.map((at) => {
                                        const added = currentAccountTypeIds.has(at.id);
                                        const loading = accountLoading === at.id;
                                        return (
                                            <div
                                                key={at.id}
                                                className="w-full px-4 py-3 rounded-lg flex items-center justify-between border"
                                                style={{ borderColor: added ? '#A3E9B8' : '#C7C7CC', backgroundColor: added ? '#F0FFF4' : '#FFFFFF' }}
                                            >
                                                <div>
                                                    <p className="text-[15px] font-semibold" style={{ color: '#000000' }}>
                                                        {at.name}
                                                    </p>
                                                    {at.description && (
                                                        <p className="text-[12px] mt-0.5" style={{ color: '#8E8E93' }}>{at.description}</p>
                                                    )}
                                                </div>
                                                <button
                                                    disabled={loading}
                                                    onClick={() => handleToggleAccount(at.id, added)}
                                                    className="ml-3 flex-shrink-0 px-3 py-1 rounded-full text-[12px] font-semibold"
                                                    style={{
                                                        background: added ? 'transparent' : 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)',
                                                        color: added ? '#C51C13' : '#FFFFFF',
                                                        border: added ? '1px solid #C51C13' : 'none',
                                                        opacity: loading ? 0.5 : 1,
                                                        minWidth: 64,
                                                    }}
                                                >
                                                    {loading ? '…' : added ? 'Remove' : 'Add'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {!profileLoading && (!types?.accountTypes || types.accountTypes.length === 0) && !profileError && (
                                <p className="text-[15px]" style={{ color: '#8E8E93' }}>No account types available.</p>
                            )}
                        </div>

                        {/* ── Appearance ── */}
                        <div className="w-full flex flex-col gap-3">
                            <h2 className="text-[13px] font-semibold uppercase" style={{ color: '#8E8E93', letterSpacing: '0.05em' }}>
                                Appearance
                            </h2>
                            <div
                                className="w-full px-4 py-3 rounded-lg flex items-center justify-between border"
                                style={{ borderColor: 'var(--neutral-300)', backgroundColor: 'var(--neutral-100)' }}
                            >
                                <div>
                                    <p className="text-[15px] font-semibold" style={{ color: 'var(--neutral-800)' }}>Theme</p>
                                    <p className="text-[12px] mt-0.5" style={{ color: '#8E8E93' }}>
                                        {themePref === 'dark' ? 'Dark mode' : 'Light mode'}
                                    </p>
                                </div>
                                <div className="flex rounded-full overflow-hidden border" style={{ borderColor: 'var(--neutral-300)' }}>
                                    {[
                                        { key: 'light', label: '☀️ Light' },
                                        { key: 'dark',  label: '🌙 Dark' },
                                    ].map(({ key, label }) => (
                                        <button
                                            key={key}
                                            onClick={() => setThemePreference(key)}
                                            className="px-3 py-1.5 text-[13px] font-semibold transition-colors"
                                            style={{
                                                background: themePref === key ? 'var(--brand-100)' : 'transparent',
                                                color: themePref === key ? '#fff' : 'var(--neutral-600)',
                                            }}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={logout}
                            className="w-full py-[10px] rounded-full text-[17px] font-semibold border"
                            style={{ borderColor: 'var(--neutral-800)', color: 'var(--neutral-800)', letterSpacing: '0.0035em' }}
                        >
                            Log out
                        </button>
                    </>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
