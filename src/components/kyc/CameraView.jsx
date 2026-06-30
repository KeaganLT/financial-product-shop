function SelfieCamera({ videoRef, onCapture, onCancel }) {
    return (
        <div
            className="w-full max-w-[390px] relative flex flex-col items-center md:rounded-xl md:overflow-hidden"
            style={{ backgroundColor: '#1C1C1C', height: '100dvh', maxHeight: '844px' }}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                type="button"
                className="absolute z-10"
                style={{ left: '24px', top: '64px' }}
                onClick={onCancel}
                aria-label="Close"
            >
                <svg width={18} height={18} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L17 17M17 1L1 17" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
                </svg>
            </button>

            <div
                className="flex flex-col items-center gap-6 w-full h-full"
                style={{ paddingTop: '110px', paddingBottom: '48px', paddingLeft: '36px', paddingRight: '36px' }}
            >
                <div
                    className="overflow-hidden w-full flex-shrink-0"
                    style={{ aspectRatio: '319 / 441', borderRadius: '50%', border: '2px solid #F2F2F7', backgroundColor: '#000000', maxHeight: '60%' }}
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                    />
                </div>

                <p className="text-[17px] font-semibold text-center" style={{ color: '#F2F2F7', letterSpacing: '0.0035em' }}>
                    Move into the frame, check the lighting, then tap the shutter
                </p>

                <button
                    type="button"
                    className="rounded-full flex-shrink-0 mt-auto"
                    style={{ width: '70px', height: '70px', border: '4px solid #FFFFFF' }}
                    onClick={onCapture}
                    aria-label="Take photo"
                >
                    <span className="block rounded-full" style={{ width: '58px', height: '58px', margin: '2px', backgroundColor: '#FFFFFF' }} />
                </button>
            </div>
        </div>
    );
}

function DocumentCamera({ videoRef, onCapture, onCancel }) {
    return (
        <div
            className="w-full max-w-[390px] rounded-t-xl md:rounded-xl px-8 py-6 flex flex-col gap-4"
            style={{ backgroundColor: '#FFFFFF' }}
            onClick={(e) => e.stopPropagation()}
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-[280px] object-contain rounded-lg"
                style={{ backgroundColor: '#000000' }}
            />
            <div className="flex flex-col gap-3">
                <button
                    type="button"
                    className="w-full py-[10px] rounded-full text-[17px] font-semibold"
                    style={{ backgroundColor: '#000000', color: '#FFFFFF', letterSpacing: '0.0035em' }}
                    onClick={onCapture}
                >
                    Take photo
                </button>
                <button
                    type="button"
                    className="w-full py-[10px] rounded-full text-[17px] font-semibold border"
                    style={{ borderColor: '#000000', color: '#000000', letterSpacing: '0.0035em' }}
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default function CameraView({ isSelfie, videoRef, onCapture, onCancel }) {
    return isSelfie
        ? <SelfieCamera videoRef={videoRef} onCapture={onCapture} onCancel={onCancel} />
        : <DocumentCamera videoRef={videoRef} onCapture={onCapture} onCancel={onCancel} />;
}