import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import KycUploadRow from '../components/kyc/KycUploadRow.jsx';
import KYCSuccess from '../assets/KYCSuccess.jsx';
import { uploadKycDocument, trackEvent } from '../services/firebase.js';
import { getKycStatus } from '../services/kycStatus.js';
import { getProfile, getTypes, updateCustomerType, addAccount, removeAccount, postKycStatus, seedDhaData } from '../services/customerService.js';

export default function AccountPage() {
    const navigate = useNavigate();
    const { auth, isLoggedIn, logout } = useAuth();

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

                        <button
                            type="button"
                            onClick={logout}
                            className="w-full py-[10px] rounded-full text-[17px] font-semibold border"
                            style={{ borderColor: '#000000', color: '#000000', letterSpacing: '0.0035em' }}
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
