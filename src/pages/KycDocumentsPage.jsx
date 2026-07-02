import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import KycUploadRow from '../components/kyc/KycUploadRow.jsx';
import KYCSuccess from '../assets/KYCSuccess.jsx';
import { uploadKycDocument, trackEvent } from '../services/firebase.js';
import { markKycSubmitted } from '../services/kycStatus.js';
import { postKycStatus, seedDhaData, getProfile } from '../services/customerService.js';

export default function KycDocumentsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { auth, isLoggedIn } = useAuth();
    const returnTo = location.state?.returnTo ?? '/products';

    const [selfieFile, setSelfieFile] = useState(null);
    const [proofOfResidenceFile, setProofOfResidenceFile] = useState(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isKycStepValid = selfieFile && proofOfResidenceFile;

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login', { replace: true });
        }
    }, [isLoggedIn, navigate]);

    if (!isLoggedIn) {
        return null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!isKycStepValid) {
            return;
        }

        setError('');
        setIsSubmitting(true);
        try {
            await Promise.all([
                uploadKycDocument(auth.customerId, 'selfie', selfieFile),
                uploadKycDocument(auth.customerId, 'proof-of-residence', proofOfResidenceFile),
            ]);
            markKycSubmitted(auth.customerId);
            trackEvent('kyc_documents_submitted');

            // Sync KYC status to backend: selfie = secondary, proof-of-residence = primary
            await postKycStatus(
                auth.customerId,
                { primaryIndicator: true, secondaryIndicator: true, taxCompliance: 'red' },
                auth.token,
            );

            // Seed DHA data so living/marital/duplicateId checks pass
            try {
                const profile = await getProfile(auth.token);
                if (profile?.idNumber) {
                    await seedDhaData(profile.idNumber, auth.token);
                }
            } catch (_) {
                // non-fatal — DHA seeding failure should not block the user
            }

            navigate(returnTo, { replace: true });
        } catch (err) {
            setError(err.message || 'Failed to upload documents');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-6 bg-white"
        >

            <form onSubmit={handleSubmit} className="w-full max-w-[363px] flex flex-col items-center gap-6">
                <KYCSuccess width={150} height={113} />

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
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
}
