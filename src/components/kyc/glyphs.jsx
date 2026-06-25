export function CameraGlyph() {
    return (
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 3 7.5 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.5L15 3H9Z" stroke="#000000" strokeWidth={1.5} strokeLinejoin="round" />
            <circle cx="12" cy="13" r="3.5" stroke="#000000" strokeWidth={1.5} />
        </svg>
    );
}

export function PhotoGlyph() {
    return (
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="#000000" strokeWidth={1.5} />
            <circle cx="8.5" cy="9.5" r="1.5" stroke="#000000" strokeWidth={1.5} />
            <path d="M21 16 16.5 11 13 14.5 10.5 12 3 18.5" stroke="#000000" strokeWidth={1.5} strokeLinejoin="round" />
        </svg>
    );
}

export function DocumentGlyph() {
    return (
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="#000000" strokeWidth={1.5} strokeLinejoin="round" />
            <path d="M14 3v4h4" stroke="#000000" strokeWidth={1.5} strokeLinejoin="round" />
            <path d="M8 12h8M8 16h8" stroke="#000000" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
    );
}