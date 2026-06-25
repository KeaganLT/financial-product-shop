import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import KycUploadRow from '../components/kyc/KycUploadRow.jsx';
import KYCSuccess from '../assets/KYCSuccess.jsx';
import { uploadKycDocument, trackEvent } from '../services/firebase.js';
import { getKycStatus } from '../services/kycStatus.js';

export default function AccountPage() {
    const navigate = useNavigate();
    const { auth, isLoggedIn, logout } = useAuth();

    const [status, setStatus] = useState(null);
    const [uploadError, setUploadError] = useState('');

    useEffect(() => {
        if (!isLoggedIn) {
            setStatus(null);
            return;
        }
        getKycStatus(auth.customerId).then(setStatus);
    }, [isLoggedIn, auth?.customerId]);


    const isVerified = status?.proofOfResidence && status?.selfie;

    async function handleUpload(docType, file) {
        setUploadError('');
        try {
            await uploadKycDocument(auth.customerId, docType, file);
            trackEvent('kyc_document_updated', { docType });
            setStatus(await getKycStatus(auth.customerId));
        } catch (err) {
            setUploadError(err.message || 'Failed to upload document');
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-[411px] mx-auto pt-[73px] pb-[88px] px-6 flex flex-col items-center gap-6">
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
                    </div>
                )}

                {isLoggedIn && (
                    <>
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

                        <div className="w-full flex flex-col gap-3">
                            <h2 className="text-[13px] font-semibold uppercase" style={{ color: '#8E8E93', letterSpacing: '0.05em' }}>
                                More
                            </h2>
                            <div
                                className="w-full px-4 py-5 rounded-lg text-center"
                                style={{ backgroundColor: '#F2F2F7' }}
                            >
                                <p className="text-[13px]" style={{ color: '#8E8E93' }}>
                                    Additional account settings will appear here.
                                </p>
                            </div>
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
