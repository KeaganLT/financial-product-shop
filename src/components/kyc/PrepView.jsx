export default function PrepView({ isSelfie, tips, cameraError, onClose, onGotIt, onUseFilePicker }) {
    return (
        <div
            className="w-full max-w-[390px] rounded-t-xl md:rounded-xl px-8 pt-6 pb-7 flex flex-col gap-6"
            style={{ backgroundColor: '#FFFFFF' }}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                type="button"
                className="self-end text-[20px] leading-none"
                style={{ color: '#000000' }}
                onClick={onClose}
                aria-label="Close"
            >
                ×
            </button>
            <h3 className="text-[20px] font-bold -mt-6" style={{ color: '#000000', letterSpacing: '0.35px' }}>
                {isSelfie ? 'Prep for your selfie' : 'Prep for your photo'}
            </h3>
            <div className="flex flex-col gap-4">
                {tips.map((tip) => (
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
                style={{ background: 'var(--gradient-brand)', letterSpacing: '0.0035em' }}
                onClick={onGotIt}
            >
                Got it
            </button>
            {cameraError && (
                <button
                    type="button"
                    className="w-full py-[10px] rounded-full text-[17px] font-semibold border"
                    style={{ borderColor: '#000000', color: '#000000', letterSpacing: '0.0035em' }}
                    onClick={onUseFilePicker}
                >
                    Upload a photo instead
                </button>
            )}
        </div>
    );
}