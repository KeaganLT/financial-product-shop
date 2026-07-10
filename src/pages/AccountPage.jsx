import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import AccountDetailsSection from '../components/account/AccountDetailsSection.jsx';
import KycSection from '../components/account/KycSection.jsx';
import CustomerTypeSection from '../components/account/CustomerTypeSection.jsx';
import AccountTypesSection from '../components/account/AccountTypesSection.jsx';
import AppearanceSection from '../components/account/AppearanceSection.jsx';
import { uploadKycDocument, trackEvent } from '../services/firebase.js';
import { getKycStatus } from '../services/kycStatus.js';
import { getProfile, getTypes, updateCustomerType, addAccount, removeAccount, postKycStatus, seedDhaData } from '../services/customerService.js';
import { useToast } from '../context/ToastContext.jsx';

//account page
export default function AccountPage() {
    const navigate = useNavigate();
    const { auth, isLoggedIn, logout } = useAuth();
    const { showToast } = useToast();

    const [status, setStatus]           = useState(null);
    const [uploadError, setUploadError] = useState('');
    const [profile, setProfile]         = useState(null);
    const [types, setTypes]             = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError]     = useState('');
    const [settingType, setSettingType]       = useState(false);
    const [typeError, setTypeError]           = useState('');
    const [accountLoading, setAccountLoading] = useState(null);

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

    useEffect(() => {
        if (!isLoggedIn) {
            queueMicrotask(() => {
                setStatus(null);
                setProfile(null);
                setTypes(null);
            });
            return;
        }
        getKycStatus(auth.customerId).then(setStatus);
        queueMicrotask(loadProfileAndTypes);
    }, [isLoggedIn, auth?.customerId]);

    async function handleUpload(docType, file) {
        setUploadError('');
        try {
            await uploadKycDocument(auth.customerId, docType, file);
            trackEvent('kyc_document_updated', { docType });
            const newStatus = await getKycStatus(auth.customerId);
            setStatus(newStatus);
            if (newStatus.proofOfResidence && newStatus.selfie) {
                const p = profile ?? await getProfile(auth.token);
                const numericCustomerId = p?.id ?? auth.customerId;
                await postKycStatus(
                    numericCustomerId,
                    { primaryIndicator: true, secondaryIndicator: true, taxCompliance: 'amber' },
                    auth.token,
                );
                if (p?.idNumber) await seedDhaData(p.idNumber, auth.token).catch(() => {});
            }
        } catch (err) {
            setUploadError(err.message || 'Failed to upload document');
        }
    }

    async function handleSelectCustomerType(typeId) {
        if (profile?.customerType) return;
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
            const updated = await getProfile(auth.token);
            setProfile(updated);
        } catch {
            setTypeError('Failed to update accounts. Please try again.');
        } finally {
            setAccountLoading(null);
        }
    }

    const currentAccountTypeIds = new Set(
        (profile?.customerAccounts ?? profile?.accounts ?? []).map((a) => a.accountTypeId ?? a.id ?? a.typeId)
    );

    return (
        <div className="min-h-screen" style={{ background: 'var(--neutral-100)' }}>
            <Header />

            <main className="max-w-[411px] md:max-w-3xl mx-auto pt-[73px] pb-[88px] md:pb-16 px-6 flex flex-col gap-4">
                <h1 className="text-[20px] font-semibold mt-6" style={{ color: 'var(--neutral-800)', fontFamily: 'Roboto, sans-serif' }}>
                    Account
                </h1>

                {!isLoggedIn && (
                    <div className="w-full flex flex-col items-center gap-4 text-center">
                        <p className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>
                            Sign in to view your profile and manage identity verification.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-[10px] rounded-full text-[17px] font-semibold text-white"
                            style={{ background: 'var(--gradient-brand)' }}
                        >
                            Sign in
                        </button>
                        <p className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>
                            Don&apos;t have an account?{' '}
                            <button onClick={() => navigate('/signup')} className="font-semibold" style={{ color: 'var(--brand-100)' }}>
                                Sign up
                            </button>
                        </p>
                    </div>
                )}

                {isLoggedIn && (
                    <>
                        <AccountDetailsSection onSuccess={(msg) => showToast(msg, 'success')} />

                        <KycSection
                            status={status}
                            uploadError={uploadError}
                            onUpload={handleUpload}
                        />

                        <CustomerTypeSection
                            profile={profile}
                            types={types}
                            loading={profileLoading}
                            error={profileError || typeError}
                            settingType={settingType}
                            onSelect={handleSelectCustomerType}
                        />

                        <AccountTypesSection
                            types={types}
                            loading={profileLoading}
                            error={profileError}
                            currentAccountTypeIds={currentAccountTypeIds}
                            accountLoading={accountLoading}
                            onToggle={handleToggleAccount}
                        />

                        <AppearanceSection />

                        <button
                            type="button"
                            onClick={logout}
                            className="w-full py-[10px] rounded-full text-[17px] font-semibold border mt-2"
                            style={{ borderColor: '#C51C13', color: '#C51C13' }}
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
