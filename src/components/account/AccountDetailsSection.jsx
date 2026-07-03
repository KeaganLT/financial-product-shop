import { useState } from 'react';
import { auth as firebaseAuth, getSignInProvider } from '../../services/firebase.js';
import ChangeEmailForm from './ChangeEmailForm.jsx';
import ChangePasswordForm from './ChangePasswordForm.jsx';

function SectionLabel({ children }) {
    return (
        <h2 className="text-[13px] font-semibold uppercase" style={{ color: '#8E8E93', letterSpacing: '0.05em' }}>
            {children}
        </h2>
    );
}

function CredentialRow({ label, value, onEdit, editLabel }) {
    return (
        <div className="w-full px-4 py-3 rounded-lg flex items-center justify-between border" style={{ borderColor: '#E5E5EA' }}>
            <div>
                <p className="text-[12px]" style={{ color: '#8E8E93', fontFamily: 'Roboto, sans-serif' }}>{label}</p>
                <p className="text-[15px] font-semibold" style={{ color: 'var(--neutral-800)', fontFamily: 'Roboto, sans-serif' }}>{value}</p>
            </div>
            <button
                onClick={onEdit}
                className="px-3 py-1 rounded-full text-[13px] font-semibold border"
                style={{ borderColor: '#1860BF', color: '#1860BF', fontFamily: 'Roboto, sans-serif' }}
            >
                {editLabel}
            </button>
        </div>
    );
}

export default function AccountDetailsSection({ onSuccess }) {
    const [editing, setEditing] = useState(null);
    const isGoogleUser = getSignInProvider() === 'google.com';
    const currentEmail = firebaseAuth.currentUser?.email ?? '—';

    return (
        <div className="w-full flex flex-col gap-3">
            <SectionLabel>Account details</SectionLabel>

            <div className="w-full px-4 py-3 rounded-lg flex flex-col gap-2" style={{ border: '1px solid #E5E5EA' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[12px]" style={{ color: '#8E8E93', fontFamily: 'Roboto, sans-serif' }}>Email / Username</p>
                        <p className="text-[15px] font-semibold" style={{ color: 'var(--neutral-800)', fontFamily: 'Roboto, sans-serif' }}>{currentEmail}</p>
                    </div>
                    {editing !== 'email' && (
                        <button
                            onClick={() => setEditing('email')}
                            className="px-3 py-1 rounded-full text-[13px] font-semibold border"
                            style={{ borderColor: '#1860BF', color: '#1860BF', fontFamily: 'Roboto, sans-serif' }}
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

            <div className="w-full px-4 py-3 rounded-lg flex flex-col gap-2" style={{ border: '1px solid #E5E5EA' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[12px]" style={{ color: '#8E8E93', fontFamily: 'Roboto, sans-serif' }}>Password</p>
                        <p className="text-[15px] font-semibold" style={{ color: 'var(--neutral-800)', fontFamily: 'Roboto, sans-serif' }}>
                            {isGoogleUser ? 'Managed by Google' : '••••••••'}
                        </p>
                    </div>
                    {editing !== 'password' && (
                        <button
                            onClick={() => setEditing('password')}
                            className="px-3 py-1 rounded-full text-[13px] font-semibold border"
                            style={{ borderColor: '#1860BF', color: '#1860BF', fontFamily: 'Roboto, sans-serif' }}
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
                <p className="text-[12px]" style={{ color: '#8E8E93', fontFamily: 'Roboto, sans-serif' }}>
                    Your account was created with Google. Identity changes require a Google re-authentication popup.
                </p>
            )}
        </div>
    );
}
