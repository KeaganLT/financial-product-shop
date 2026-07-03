import { useState } from 'react';
import { changePassword, auth as firebaseAuth, resetPassword } from '../../services/firebase.js';

export default function ChangePasswordForm({ isGoogleUser, onDone, onCancel, onSuccess }) {
    const [current, setCurrent]         = useState('');
    const [next, setNext]               = useState('');
    const [confirm, setConfirm]         = useState('');
    const [saving, setSaving]           = useState(false);
    const [error, setError]             = useState('');
    const [success, setSuccess]         = useState(false);
    const [resetSent, setResetSent]     = useState(false);
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

    async function handleResetPassword() {
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
                        style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: '#C7C7CC' }}
                    />
                    {!resetSent ? (
                        <button
                            type="button"
                            disabled={resetLoading}
                            onClick={handleResetPassword}
                            className="self-start text-left"
                            style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#1860BF', opacity: resetLoading ? 0.5 : 1 }}
                        >
                            {resetLoading ? 'Sending…' : 'Forgot your password? Send reset email'}
                        </button>
                    ) : (
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#168C34' }}>✓ Reset link sent to your email</p>
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
                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: '#C7C7CC' }}
            />
            <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="w-full h-[44px] rounded-[10px] px-3 border"
                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: '#C7C7CC' }}
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
