import KycUploadRow from '../kyc/KycUploadRow.jsx';
import KYCSuccess from '../../assets/KYCSuccess.jsx';
import InfoBanner from '../InfoBanner.jsx';

export default function KycSection({ status, uploadError, onUpload }) {
    const isVerified = status?.proofOfResidence && status?.selfie;

    return (
        <>
            {!isVerified && status !== null && (
                <InfoBanner variant="warning" title="Your account is incomplete">
                    Upload your proof of residence and selfie below to unlock all products.
                </InfoBanner>
            )}

            <div className="w-full flex flex-col items-center gap-3 text-center">
                {isVerified && <KYCSuccess width={120} height={90} verified />}
                <p className="text-[17px] font-semibold" style={{ color: 'var(--neutral-800)' }}>
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
                            onSelect={(file) => onUpload('proof-of-residence', file)}
                        />
                        <KycUploadRow
                            label="Selfie upload"
                            status={status.selfie ? 'Uploaded · Tap to update' : 'Not uploaded'}
                            isUploaded={status.selfie}
                            capture="user"
                            onSelect={(file) => onUpload('selfie', file)}
                        />
                    </div>
                ) : (
                    <p className="text-[15px]" style={{ color: '#8E8E93' }}>Checking document status…</p>
                )}
                {uploadError && <p className="text-[13px] text-red-500">{uploadError}</p>}
            </div>
        </>
    );
}
