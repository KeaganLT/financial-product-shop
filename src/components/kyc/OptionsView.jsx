export default function OptionsView({ onTakePhoto, onUploadPhoto, onUploadDocument, onCancel }) {
    return (
        <div
            className="w-full max-w-[390px] px-2 pb-2 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="w-full rounded-[10px] overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(25px)' }}>
                <button
                    type="button"
                    className="w-full text-center text-[18px] py-[20px]"
                    style={{ color: '#007AFF' }}
                    onClick={onTakePhoto}
                >
                    Camera
                </button>
                <div style={{ borderTop: '1px solid #D8D8D8' }} />
                <button
                    type="button"
                    className="w-full text-center text-[18px] py-[20px]"
                    style={{ color: '#007AFF' }}
                    onClick={onUploadPhoto}
                >
                    Photo &amp; Video Library
                </button>
                <div style={{ borderTop: '1px solid #D8D8D8' }} />
                <button
                    type="button"
                    className="w-full text-center text-[18px] py-[20px]"
                    style={{ color: '#007AFF' }}
                    onClick={onUploadDocument}
                >
                    Document
                </button>
            </div>
            <div className="w-full rounded-[10px] overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(25px)' }}>
                <button
                    type="button"
                    className="w-full text-center text-[18px] font-bold py-[20px]"
                    style={{ color: '#007AFF' }}
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}