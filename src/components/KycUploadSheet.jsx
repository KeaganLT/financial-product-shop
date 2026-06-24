import { useEffect, useRef, useState } from 'react';

function isMobileDevice() {
    return window.matchMedia('(pointer: coarse)').matches;
}

const CAMERA_TIPS = [
    {
        title: 'Start with good lighting',
        body: 'Take the photo in a well-lit space. The flash might cause glare on you photo.',
    },
    {
        title: 'Details visible',
        body: 'Ensure that the photo clearly displays your First name, Surname as well as residential address.',
    },
    {
        title: 'Document period',
        body: 'Please ensure that the document snapshot you upload is no older that 3 months.',
    },
];

function CameraGlyph() {
    return (
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 3 7.5 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.5L15 3H9Z" stroke="#000000" strokeWidth={1.5} strokeLinejoin="round" />
            <circle cx="12" cy="13" r="3.5" stroke="#000000" strokeWidth={1.5} />
        </svg>
    );
}

function PhotoGlyph() {
    return (
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="#000000" strokeWidth={1.5} />
            <circle cx="8.5" cy="9.5" r="1.5" stroke="#000000" strokeWidth={1.5} />
            <path d="M21 16 16.5 11 13 14.5 10.5 12 3 18.5" stroke="#000000" strokeWidth={1.5} strokeLinejoin="round" />
        </svg>
    );
}

function DocumentGlyph() {
    return (
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="#000000" strokeWidth={1.5} strokeLinejoin="round" />
            <path d="M14 3v4h4" stroke="#000000" strokeWidth={1.5} strokeLinejoin="round" />
            <path d="M8 12h8M8 16h8" stroke="#000000" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
    );
}

export default function KycUploadSheet({ isOpen, onClose, onConfirm, capture }) {
    const [view, setView] = useState('options');
    const [pendingFile, setPendingFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [cameraError, setCameraError] = useState('');

    const cameraInputRef = useRef(null);
    const photoInputRef = useRef(null);
    const documentInputRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    function stopCameraStream() {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
    }

    useEffect(() => {
        if (view !== 'camera') {
            return;
        }
        let cancelled = false;
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: capture === 'user' ? 'user' : 'environment' } })
            .then((stream) => {
                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((err) => {
                console.error('Camera access failed:', err.name, err.message);
                if (!cancelled) {
                    setCameraError(`${err.name}: ${err.message}`);
                    setView('prep');
                }
            });

        return () => {
            cancelled = true;
            stopCameraStream();
        };
    }, [view, capture]);

    function clearPreview() {
        setPreviewUrl((url) => {
            if (url) URL.revokeObjectURL(url);
            return null;
        });
    }

    function handleClose() {
        stopCameraStream();
        setView('options');
        setPendingFile(null);
        clearPreview();
        onClose();
    }

    function handleStartCamera() {
        setCameraError('');
        if (isMobileDevice()) {
            cameraInputRef.current?.click();
            return;
        }
        if (!navigator.mediaDevices?.getUserMedia) {
            console.error('navigator.mediaDevices.getUserMedia is unavailable (insecure context or unsupported browser)');
            setCameraError('Camera access requires HTTPS (or localhost). Falling back to file upload.');
            cameraInputRef.current?.click();
            return;
        }
        setView('camera');
    }

    function handleCapturePhoto() {
        const video = videoRef.current;
        if (!video) {
            return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            if (!blob) {
                return;
            }
            stopCameraStream();
            handleFileChosen(new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' }));
        }, 'image/jpeg');
    }

    function handleFileChosen(file) {
        if (!file) {
            return;
        }
        setPendingFile(file);
        clearPreview();
        if (file.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(file));
        }
        setView('preview');
    }

    function handleSubmitPhoto() {
        onConfirm(pendingFile);
        handleClose();
    }

    function handleRetake() {
        setPendingFile(null);
        clearPreview();
        setView('prep');
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={handleClose}
        >
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture={capture}
                className="hidden"
                onChange={(e) => handleFileChosen(e.target.files?.[0] ?? null)}
            />
            <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChosen(e.target.files?.[0] ?? null)}
            />
            <input
                ref={documentInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => handleFileChosen(e.target.files?.[0] ?? null)}
            />

            {view === 'options' && (
                <div
                    className="w-full max-w-[390px] rounded-t-xl px-7 pt-7 pb-9 flex flex-col gap-6"
                    style={{ backgroundColor: '#FFFFFF' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-[17px] font-semibold" style={{ color: '#000000', letterSpacing: '0.0035em' }}>
                        Upload document
                    </h3>
                    <div className="flex flex-col gap-6">
                        <button
                            type="button"
                            className="flex items-center gap-3 text-[15px] text-left"
                            style={{ color: '#000000' }}
                            onClick={() => setView('prep')}
                        >
                            <CameraGlyph /> Take photo with camera
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-3 text-[15px] text-left"
                            style={{ color: '#000000' }}
                            onClick={() => photoInputRef.current?.click()}
                        >
                            <PhotoGlyph /> Upload photo
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-3 text-[15px] text-left"
                            style={{ color: '#000000' }}
                            onClick={() => documentInputRef.current?.click()}
                        >
                            <DocumentGlyph /> Upload document
                        </button>
                    </div>
                </div>
            )}

            {view === 'prep' && (
                <div
                    className="w-full max-w-[390px] rounded-t-xl px-8 pt-6 pb-7 flex flex-col gap-6"
                    style={{ backgroundColor: '#FFFFFF' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        type="button"
                        className="self-end text-[20px] leading-none"
                        style={{ color: '#000000' }}
                        onClick={handleClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                    <h3 className="text-[20px] font-bold -mt-6" style={{ color: '#000000', letterSpacing: '0.35px' }}>
                        Prep for your photo
                    </h3>
                    <div className="flex flex-col gap-4">
                        {CAMERA_TIPS.map((tip) => (
                            <div key={tip.title} className="flex flex-col gap-0.5">
                                <p className="text-[15px] font-semibold" style={{ color: '#000000' }}>{tip.title}</p>
                                <p className="text-[15px]" style={{ color: '#8E8E93' }}>{tip.body}</p>
                            </div>
                        ))}
                    </div>
                    {cameraError && (
                        <p className="text-[13px] -mt-2" style={{ color: '#FF3B30' }}>{cameraError}</p>
                    )}
                    <button
                        type="button"
                        className="w-full py-[10px] rounded-full text-[17px] font-semibold text-white"
                        style={{ background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)', letterSpacing: '0.0035em' }}
                        onClick={handleStartCamera}
                    >
                        Got it
                    </button>
                </div>
            )}

            {view === 'camera' && (
                <div
                    className="w-full max-w-[390px] rounded-t-xl px-8 py-6 flex flex-col gap-4"
                    style={{ backgroundColor: '#FFFFFF' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full max-h-[280px] object-contain rounded-lg"
                        style={{ backgroundColor: '#000000', transform: capture === 'user' ? 'scaleX(-1)' : 'none' }}
                    />
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            className="w-full py-[10px] rounded-full text-[17px] font-semibold"
                            style={{ backgroundColor: '#000000', color: '#FFFFFF', letterSpacing: '0.0035em' }}
                            onClick={handleCapturePhoto}
                        >
                            Take photo
                        </button>
                        <button
                            type="button"
                            className="w-full py-[10px] rounded-full text-[17px] font-semibold border"
                            style={{ borderColor: '#000000', color: '#000000', letterSpacing: '0.0035em' }}
                            onClick={() => {
                                stopCameraStream();
                                setView('prep');
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {view === 'preview' && (
                <div
                    className="w-full max-w-[390px] rounded-t-xl px-8 py-6 flex flex-col gap-4"
                    style={{ backgroundColor: '#FFFFFF' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Document preview"
                            className="w-full max-h-[280px] object-contain rounded-lg"
                            style={{ backgroundColor: '#F2F2F7' }}
                        />
                    ) : (
                        <p className="text-[15px] text-center" style={{ color: '#000000' }}>{pendingFile?.name}</p>
                    )}
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            className="w-full py-[10px] rounded-full text-[17px] font-semibold"
                            style={{ backgroundColor: '#000000', color: '#FFFFFF', letterSpacing: '0.0035em' }}
                            onClick={handleSubmitPhoto}
                        >
                            Submit photo
                        </button>
                        <button
                            type="button"
                            className="w-full py-[10px] rounded-full text-[17px] font-semibold border"
                            style={{ borderColor: '#000000', color: '#000000', letterSpacing: '0.0035em' }}
                            onClick={handleRetake}
                        >
                            Retake photo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
