import { useState } from 'react';
import { auth as firebaseAuth, getSignInProvider } from '../../services/firebase.js';
import ChangeEmailForm from './ChangeEmailForm.jsx';
import ChangePasswordForm from './ChangePasswordForm.jsx';
import SectionHeading from './SectionHeading.jsx';

const PERSON_ICON = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="var(--brand-100)" strokeWidth="2" />
        <path d="M4 20c0-3.3 3.6-5 8-5s8 1.7 8 5" stroke="var(--brand-100)" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export default function AccountDetailsSection({ onSuccess }) {
    const [editing, setEditing] = useState(null);
    const isGoogleUser = getSignInProvider() === 'google.com';
    const currentEmail = firebaseAuth.currentUser?.email ?? '—';

    return (
        <div className="w-full flex flex-col gap-3">
            <SectionHeading icon={PERSON_ICON}>Account details</SectionHeading>

            <div className="w-full px-4 py-3 rounded-[12px] flex flex-col gap-2" style={{ border: '1px solid var(--neutral-300)', background: 'var(--neutral-100)' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[12px]" style={{ color: 'var(--text-secondary)', fontFamily: 'Roboto, sans-serif' }}>Email / Username</p>
                        <p className="text-[15px] font-semibold" style={{ color: 'var(--neutral-800)', fontFamily: 'Roboto, sans-serif' }}>{currentEmail}</p>
                    </div>
                    {editing !== 'email' && (
                        <button
                            onClick={() => setEditing('email')}
                            className="px-3 py-1 rounded-full text-[13px] font-semibold border"
                            style={{ borderColor: 'var(--brand-100)', color: 'var(--brand-100)', fontFamily: 'Roboto, sans-serif' }}
                        >
                            Change
                        </button>
                    )}
                </div>
                {editing === 'email' && (
                    <ChangeEmailForm
                        currentEmail={currentEmail}
                        isGoogleUser={isGoogleUser}
                        onDone={() => setEditing(null)}
                        onCancel={() => setEditing(null)}
                        onSuccess={onSuccess}
                    />
                )}
            </div>

            <div className="w-full px-4 py-3 rounded-[12px] flex flex-col gap-2" style={{ border: '1px solid var(--neutral-300)', background: 'var(--neutral-100)' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[12px]" style={{ color: 'var(--text-secondary)', fontFamily: 'Roboto, sans-serif' }}>Password</p>
                        <p className="text-[15px] font-semibold" style={{ color: 'var(--neutral-800)', fontFamily: 'Roboto, sans-serif' }}>
                            {isGoogleUser ? 'Managed by Google' : '••••••••'}
                        </p>
                    </div>
                    {editing !== 'password' && (
                        <button
                            onClick={() => setEditing('password')}
                            className="px-3 py-1 rounded-full text-[13px] font-semibold border"
                            style={{ borderColor: 'var(--brand-100)', color: 'var(--brand-100)', fontFamily: 'Roboto, sans-serif' }}
                        >
                            {isGoogleUser ? 'Set password' : 'Change'}
                        </button>
                    )}
                </div>
                {editing === 'password' && (
                    <ChangePasswordForm
                        isGoogleUser={isGoogleUser}
                        onDone={() => setEditing(null)}
                        onCancel={() => setEditing(null)}
                        onSuccess={onSuccess}
                    />
                )}
            </div>

            {isGoogleUser && (
                <p className="text-[12px]" style={{ color: 'var(--text-secondary)', fontFamily: 'Roboto, sans-serif' }}>
                    Your account was created with Google. Identity changes require a Google re-authentication popup.
                </p>
            )}
        </div>
    );
}
