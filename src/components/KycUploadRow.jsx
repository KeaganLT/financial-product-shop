import { useState } from 'react';
import CheckIcon from '../assets/CheckIcon.jsx';
import KycUploadSheet from './KycUploadSheet.jsx';

export default function KycUploadRow({ label, status, isUploaded, capture, onSelect }) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsSheetOpen(true)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left"
                style={{ backgroundColor: 'var(--surface-field)' }}
            >
                <span className="flex flex-col">
                    <span className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
                    <span className="text-[13px]" style={{ color: isUploaded ? '#34C759' : 'var(--text-secondary)' }}>
                        {status}
                    </span>
                </span>
                {isUploaded ? (
                    <CheckIcon width={20} height={20} color="#34C759" />
                ) : (
                    <svg width={8} height={14} viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L7 7L1 13" stroke="var(--text-secondary)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </button>

            <KycUploadSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                onConfirm={onSelect}
                capture={capture}
            />
        </>
    );
}
