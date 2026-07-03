import { useState } from 'react';
import { changeEmail } from '../../services/firebase.js';

export default function ChangeEmailForm({ currentEmail, isGoogleUser, onDone, onCancel, onSuccess }) {
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
        if (newEmail === currentEmail) { setError("That's already your current email."); return; }
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
                    style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: '#C7C7CC' }}
                />
            )}
            <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="New email address"
                autoComplete="email"
                className="w-full h-[44px] rounded-[10px] px-3 border"
                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, borderColor: '#C7C7CC' }}
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
