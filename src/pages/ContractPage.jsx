import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/customerService';
import { getBankDetails } from '../services/bankingService';
import { generateContractPdf, downloadContract, getContractBlob } from '../services/contractService';
import { uploadSignedContract } from '../services/firebase';
import { saveContractRecord, getContractRecord } from '../services/contractStorageService';
import { useToast } from '../context/ToastContext';
import Section from '../components/contract/Section.jsx';
import ContractPreview from '../components/contract/ContractPreview.jsx';

function currentTimestamp() {
    return Date.now();
}

export default function ContractPage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { auth, isLoggedIn } = useAuth();
    const { showToast } = useToast();

    const product    = state?.product ?? null;
    const bankDetails = state?.bankDetails ?? null;

    const [profile, setProfile]               = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [signature, setSignature]           = useState('');
    const [signedAt, setSignedAt]             = useState(null);
    const [agreed, setAgreed]                 = useState(false);
    const [sigError, setSigError]             = useState('');
    const [uploading, setUploading]           = useState(false);
    const [uploadedUrl, setUploadedUrl]       = useState('');
    const [uploadError, setUploadError]       = useState('');
    const [ownFile, setOwnFile]               = useState(null);

    useEffect(() => {
        if (!isLoggedIn) { navigate('/login'); return; }
        if (!product) { navigate('/subscriptions'); return; }
        getProfile(auth.token)
            .then(setProfile)
            .catch(() => setProfile(null))
            .finally(() => setProfileLoading(false));
    }, [isLoggedIn]);

    useEffect(() => {
        if (!auth?.customerId || !product?.id) {
            queueMicrotask(() => setProfileLoading(false));
            return;
        }
        getContractRecord(auth.customerId, product.id)
            .then((record) => {
                if (record) {
                    if (record.downloadUrl) setUploadedUrl(record.downloadUrl);
                    if (record.signature)   setSignature(record.signature);
                }
            })
            .catch(() => {});
    }, [auth?.customerId, product?.id]);

    const resolvedBank = bankDetails ?? (auth?.customerId ? getBankDetails(auth.customerId) : null);

    function buildDoc(withSig) {
        return generateContractPdf({
            product,
            bankDetails: resolvedBank,
            profile,
            signature:  withSig ? signature.trim() : null,
            signedAt:   withSig ? signedAt : null,
        });
    }

    function handleDownloadUnsigned() {
        const doc = buildDoc(false);
        downloadContract(doc, `${product.name.replace(/\s+/g, '-')}-contract.pdf`);
    }

    function handleSignAndDownload() {
        if (!agreed)           { setSigError('Please accept the declaration first.'); return; }
        if (!signature.trim()) { setSigError('Please type your full name as a signature.'); return; }
        setSigError('');
        const now = currentTimestamp();
        const sig = signature.trim();
        setSignedAt(now);
        const pdfDoc = generateContractPdf({ product, bankDetails: resolvedBank, profile, signature: sig, signedAt: now });
        downloadContract(pdfDoc, `${product.name.replace(/\s+/g, '-')}-signed-contract.pdf`);
        uploadAndSave(pdfDoc, sig, now);
    }

    async function uploadAndSave(doc, sig, ts) {
        if (!auth?.customerId || !product?.id) return;
        setUploading(true);
        setUploadError('');
        try {
            const blob = getContractBlob(doc);
            const url  = await uploadSignedContract(auth.customerId, product.id, blob);
            setUploadedUrl(url);
            await saveContractRecord(auth.customerId, product.id, {
                signature: sig, signedAt: ts, downloadUrl: url,
                productName: product.name, productPrice: product.price,
                bankName: resolvedBank?.bankName, last4: resolvedBank?.last4,
                accountType: resolvedBank?.accountType, debitDay: resolvedBank?.debitDay,
            });
            showToast('Contract signed and stored securely.', 'success');
        } catch {
            setUploadError('Contract saved locally — upload to cloud failed. You can upload your signed copy below.');
        } finally {
            setUploading(false);
        }
    }

    async function handleUploadOwnFile() {
        if (!ownFile || !auth?.customerId || !product?.id) return;
        setUploading(true);
        setUploadError('');
        try {
            const url = await uploadSignedContract(auth.customerId, product.id, ownFile);
            setUploadedUrl(url);
            setOwnFile(null);
            await saveContractRecord(auth.customerId, product.id, {
                signature: null, signedAt: null, downloadUrl: url,
                productName: product.name, productPrice: product.price,
                bankName: resolvedBank?.bankName, last4: resolvedBank?.last4,
                accountType: resolvedBank?.accountType, debitDay: resolvedBank?.debitDay,
            });
            showToast('Signed contract uploaded.', 'success');
        } catch {
            setUploadError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    }

    if (!product) return null;

    return (
        <div className="min-h-screen" style={{ background: 'var(--neutral-100)' }}>
            <div
                className="fixed top-0 left-0 right-0 z-50"
                style={{ backgroundColor: 'var(--neutral-100)', borderBottom: '1px solid #E5E5EA' }}
            >
                <div className="max-w-[480px] md:max-w-2xl mx-auto px-4 flex items-center gap-3" style={{ height: 64 }}>
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#49454F" />
                        </svg>
                    </button>
                    <div>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 17, fontWeight: 600, color: 'var(--neutral-800)' }}>Your contract</p>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#8E8E93' }}>{product.name}</p>
                    </div>
                </div>
            </div>

            <div className="pt-[76px] pb-12 max-w-[480px] md:max-w-2xl mx-auto px-6 flex flex-col gap-6">
                {uploadedUrl ? (
                    <div className="flex items-start gap-3 px-4 py-3 rounded-[10px]" style={{ background: '#F0FFF4', border: '1px solid #A3E9B8' }}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                            <circle cx="10" cy="10" r="10" fill="#168C34" />
                            <path d="M6 10l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div>
                            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A5C30' }}>Signed contract uploaded</p>
                            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#3C3C43' }}>Your signed contract has been stored securely.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start gap-3 px-4 py-3 rounded-[10px]" style={{ background: '#FFF8E6', border: '1px solid #FFD97A' }}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                            <circle cx="10" cy="10" r="10" fill="#F5A623" />
                            <rect x="9" y="5" width="2" height="6" rx="1" fill="white" />
                            <circle cx="10" cy="14" r="1" fill="white" />
                        </svg>
                        <div>
                            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#7A4F00' }}>Signature required</p>
                            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#3C3C43' }}>Please sign this contract to complete your product agreement.</p>
                        </div>
                    </div>
                )}

                <ContractPreview product={product} profile={profile} profileLoading={profileLoading} resolvedBank={resolvedBank} />

                <Section heading="Download">
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#8E8E93' }}>
                        Download the contract as a PDF to read, print, or sign manually, then upload the signed copy below.
                    </p>
                    <button
                        onClick={handleDownloadUnsigned}
                        className="w-full h-[46px] rounded-[100px] flex items-center justify-center gap-2 border font-semibold"
                        style={{ borderColor: '#1860BF', color: '#1860BF', fontFamily: 'Roboto, sans-serif', fontSize: 15 }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M12 16l-4-4h3V4h2v8h3l-4 4zM4 20h16v2H4v-2z" fill="#1860BF" />
                        </svg>
                        Download PDF
                    </button>
                </Section>

                {!uploadedUrl && (
                    <Section heading="Sign digitally">
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#8E8E93' }}>
                            Sign online — your signature will be embedded in the PDF and saved to your account.
                        </p>
                        <label className="flex items-start gap-3 cursor-pointer p-2 -m-2">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={() => { setAgreed((v) => !v); setSigError(''); }}
                                className="sr-only"
                            />
                            <div
                                aria-hidden="true"
                                className="w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border-2"
                                style={{ borderColor: agreed ? '#1860BF' : '#C7C7CC', background: agreed ? '#1860BF' : 'white' }}
                            >
                                {agreed && (
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#3C3C43', lineHeight: '19px', textAlign: 'left' }}>
                                I confirm I have read this agreement, that all details are correct, and I authorise the debit order as stated.
                            </span>
                        </label>
                        <div className="flex flex-col gap-1">
                            <label style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--neutral-800)' }}>
                                Type your full name as signature
                            </label>
                            <input
                                type="text"
                                value={signature}
                                onChange={(e) => { setSignature(e.target.value); setSigError(''); }}
                                placeholder="e.g. Keagan Truter"
                                className="w-full h-[46px] rounded-[10px] px-3 border"
                                style={{ fontFamily: '"Brush Script MT", cursive, Roboto, sans-serif', fontSize: 18, borderColor: sigError && !signature ? '#C51C13' : '#C7C7CC', color: '#1860BF' }}
                            />
                            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#8E8E93' }}>
                                By typing your name you are providing a legally binding digital signature.
                            </p>
                        </div>
                        {sigError && <p role="alert" style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#C51C13' }}>{sigError}</p>}
                        <button
                            onClick={handleSignAndDownload}
                            disabled={uploading}
                            className="w-full h-[50px] rounded-[100px] font-semibold text-white flex items-center justify-center gap-2"
                            style={{ background: uploading ? '#A0AEC0' : 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)', fontFamily: 'Roboto, sans-serif', fontSize: 16, cursor: uploading ? 'not-allowed' : 'pointer' }}
                        >
                            {uploading ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading…</>
                            ) : (
                                <><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 8l4 4h-3v8h-2v-8H8l4-4zM4 4h16v2H4V4z" fill="white" /></svg>Sign & download</>
                            )}
                        </button>
                    </Section>
                )}

                {!uploadedUrl && (
                    <Section heading="Upload signed copy">
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#8E8E93' }}>
                            Already signed a physical or scanned copy? Upload it here.
                        </p>
                        <label className="w-full h-[46px] rounded-[100px] border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer" style={{ borderColor: ownFile ? '#168C34' : '#C7C7CC' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 8l4 4h-3v8h-2v-8H8l4-4zM4 4h16v2H4V4z" fill={ownFile ? '#168C34' : '#8E8E93'} />
                            </svg>
                            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: ownFile ? '#168C34' : '#8E8E93', fontWeight: ownFile ? 600 : 400 }}>
                                {ownFile ? ownFile.name : 'Choose PDF or image…'}
                            </span>
                            <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => setOwnFile(e.target.files[0] ?? null)} />
                        </label>
                        {ownFile && (
                            <button
                                onClick={handleUploadOwnFile}
                                disabled={uploading}
                                className="w-full h-[46px] rounded-[100px] font-semibold text-white"
                                style={{ background: uploading ? '#A0AEC0' : '#168C34', fontFamily: 'Roboto, sans-serif', fontSize: 15 }}
                            >
                                {uploading ? 'Uploading…' : 'Upload signed copy'}
                            </button>
                        )}
                        {uploadError && <p role="alert" style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#C51C13' }}>{uploadError}</p>}
                    </Section>
                )}

                {uploadedUrl && (
                    <Section heading="Signed contract">
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#8E8E93' }}>
                            Your signed contract is stored securely. You can download a copy below.
                        </p>
                        <a
                            href={uploadedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-[46px] rounded-[100px] flex items-center justify-center gap-2 border font-semibold"
                            style={{ borderColor: '#168C34', color: '#168C34', fontFamily: 'Roboto, sans-serif', fontSize: 15 }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 16l-4-4h3V4h2v8h3l-4 4zM4 20h16v2H4v-2z" fill="#168C34" />
                            </svg>
                            Download signed copy
                        </a>
                    </Section>
                )}
            </div>
        </div>
    );
}
