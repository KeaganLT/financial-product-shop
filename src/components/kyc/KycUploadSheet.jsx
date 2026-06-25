import { useEffect, useRef, useState } from 'react';
import { DOCUMENT_TIPS, SELFIE_TIPS } from './tips.js';
import OptionsView from './OptionsView.jsx';
import PrepView from './PrepView.jsx';
import CameraView from './CameraView.jsx';
import PreviewView from './PreviewView.jsx';

export default function KycUploadSheet({ isOpen, onClose, onConfirm, capture }) {
    const isSelfie = capture === 'user';
    const tips = isSelfie ? SELFIE_TIPS : DOCUMENT_TIPS;
    const [view, setView] = useState('options');
    const [pendingFile, setPendingFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [cameraError, setCameraError] = useState('');
    const [source, setSource] = useState(null);

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
        setSource(null);
        clearPreview();
        onClose();
    }

    function handleStartCamera() {
        setCameraError('');
        if (!navigator.mediaDevices?.getUserMedia) {
            const reason = !window.isSecureContext
                ? `Camera access requires HTTPS (or localhost) — this page is loaded over an insecure origin (${window.location.origin}).`
                : 'Camera access is not supported in this browser.';
            console.error('Camera unavailable:', reason);
            setCameraError(reason);
            return;
        }
        setView('camera');
    }

    function handleUseFilePicker() {
        setCameraError('');
        cameraInputRef.current?.click();
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
            handleFileChosen(new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' }), 'camera');
        }, 'image/jpeg');
    }

    function handleFileChosen(file, chosenSource) {
        if (!file) {
            return;
        }
        setSource(chosenSource);
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

    function handleChangePhoto() {
        setPendingFile(null);
        clearPreview();
        if (source === 'library') {
            photoInputRef.current?.click();
            return;
        }
        if (source === 'document') {
            documentInputRef.current?.click();
            return;
        }
        setView('prep');
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end md:items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={handleClose}
        >
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture={capture}
                className="hidden"
                onChange={(e) => handleFileChosen(e.target.files?.[0] ?? null, 'camera')}
            />
            <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChosen(e.target.files?.[0] ?? null, 'library')}
            />
            <input
                ref={documentInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => handleFileChosen(e.target.files?.[0] ?? null, 'document')}
            />

            {view === 'options' && (
                <OptionsView
                    onTakePhoto={() => setView('prep')}
                    onUploadPhoto={() => photoInputRef.current?.click()}
                    onUploadDocument={() => documentInputRef.current?.click()}
                    onCancel={handleClose}
                />
            )}

            {view === 'prep' && (
                <PrepView
                    isSelfie={isSelfie}
                    tips={tips}
                    cameraError={cameraError}
                    onClose={handleClose}
                    onGotIt={handleStartCamera}
                    onUseFilePicker={handleUseFilePicker}
                />
            )}

            {view === 'camera' && (
                <CameraView
                    isSelfie={isSelfie}
                    videoRef={videoRef}
                    onCapture={handleCapturePhoto}
                    onCancel={() => {
                        stopCameraStream();
                        setView('prep');
                    }}
                />
            )}

            {view === 'preview' && (
                <PreviewView
                    isSelfie={isSelfie}
                    source={source}
                    previewUrl={previewUrl}
                    pendingFile={pendingFile}
                    onSubmit={handleSubmitPhoto}
                    onChange={handleChangePhoto}
                />
            )}
        </div>
    );
}