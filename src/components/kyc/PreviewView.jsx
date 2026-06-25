function SelfiePreview({ source, previewUrl, onSubmit, onChange }) {
    return (
        <div
            className="w-full max-w-[390px] relative flex flex-col items-center px-9 py-6 md:rounded-xl md:overflow-hidden"
            style={{ backgroundColor: '#1C1C1C', height: '844px', maxHeight: '100vh' }}
            onClick={(e) => e.stopPropagation()}
        >
            <button type="button" className="self-start mb-4" onClick={onChange} aria-label="Back">
                <svg width={11} height={18} viewBox="0 0 11 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.5 1 1.5 9l8 8" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            <div
                className="overflow-hidden"
                style={{ width: '244px', height: '244px', borderRadius: '50%', border: '2px solid #F2F2F7', backgroundColor: '#000000' }}
            >
                {previewUrl && (
                    <img src={previewUrl} alt="Selfie preview" className="w-full h-full object-cover" />
                )}
            </div>

            {source === 'camera' && (
                <div className="flex flex-col items-center gap-1 mt-6 mb-4">
                    <p className="text-[17px] font-semibold" style={{ color: '#FFFFFF', letterSpacing: '0.0035em' }}>
                        Review your photo
                    </p>
                    <p className="text-[13px] text-center" style={{ color: '#8E8E93' }}>
                        Make sure your face is well-lit, clear and your entire face is visible
                    </p>
                </div>
            )}

            <div className="w-full flex flex-col gap-3 mt-auto">
                <button
                    type="button"
                    className="w-full py-[10px] rounded-full text-[17px] font-semibold"
                    style={{ backgroundColor: '#FFFFFF', color: '#000000', letterSpacing: '0.0035em' }}
                    onClick={onSubmit}
                >
                    {source === 'camera' ? 'Submit photo' : 'Submit my selfie'}
                </button>
                <button
                    type="button"
                    className="w-full py-[10px] rounded-full text-[17px] font-semibold border"
                    style={{ borderColor: '#FFFFFF', color: '#FFFFFF', letterSpacing: '0.0035em' }}
                    onClick={onChange}
                >
                    {source === 'camera' ? 'Retake photo' : 'Change my selfie'}
                </button>
            </div>
        </div>
    );
}

function DocumentPreview({ source, previewUrl, pendingFile, onSubmit, onChange }) {
    return (
        <div
            className="w-full max-w-[390px] rounded-t-xl md:rounded-xl px-8 py-6 flex flex-col gap-4"
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
                    onClick={onSubmit}
                >
                    {source === 'document' ? 'Submit document' : 'Submit photo'}
                </button>
                <button
                    type="button"
                    className="w-full py-[10px] rounded-full text-[17px] font-semibold border"
                    style={{ borderColor: '#000000', color: '#000000', letterSpacing: '0.0035em' }}
                    onClick={onChange}
                >
                    {source === 'document' ? 'Change document' : 'Change photo'}
                </button>
            </div>
        </div>
    );
}

export default function PreviewView({ isSelfie, source, previewUrl, pendingFile, onSubmit, onChange }) {
    return isSelfie
        ? <SelfiePreview source={source} previewUrl={previewUrl} onSubmit={onSubmit} onChange={onChange} />
        : <DocumentPreview source={source} previewUrl={previewUrl} pendingFile={pendingFile} onSubmit={onSubmit} onChange={onChange} />;
}