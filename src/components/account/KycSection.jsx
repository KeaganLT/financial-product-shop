import KycUploadRow from '../kyc/KycUploadRow.jsx';
import KYCSuccess from '../../assets/KYCSuccess.jsx';
import InfoBanner from '../InfoBanner.jsx';
import SectionHeading from './SectionHeading.jsx';

export default function KycSection({ status, uploadError, onUpload }) {
    const isVerified = status?.proofOfResidence && status?.selfie;

    return (
        <>
            {!isVerified && status !== null && (
                <InfoBanner variant="warning" title="Your account is incomplete">
                    Upload your proof of residence and selfie below to unlock all products.
                </InfoBanner>
            )}

            <div className="w-full flex flex-col gap-3">
                <SectionHeading
                    icon={(
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="#1860BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                >
                    Identity verification
                </SectionHeading>

                <div
                    className="w-full rounded-[12px] px-4 py-4 flex flex-col items-center gap-2 text-center"
                    style={{ border: '1px solid var(--neutral-300)', background: 'var(--neutral-100)', borderLeft: `3px solid ${isVerified ? '#168C34' : '#B96A00'}` }}
                >
                    {isVerified && <KYCSuccess width={120} height={90} verified />}
                    <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {isVerified ? 'Identity verified' : 'Identity not verified'}
                    </p>
                    <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                        {isVerified
                            ? 'Your proof of residence and selfie are on file.'
                            : 'Upload a proof of residence and selfie to verify your identity.'}
                    </p>
                </div>
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
                    <p className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>Checking document status…</p>
                )}
                {uploadError && <p className="text-[13px] text-red-500">{uploadError}</p>}
            </div>
        </>
    );
}
