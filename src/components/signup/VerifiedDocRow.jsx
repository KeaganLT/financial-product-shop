import CheckIcon from '../../assets/CheckIcon.jsx';

export default function VerifiedDocRow({ label }) {
    return (
        <div
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg"
            style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)' }}
        >
            <span className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
            <span
                className="flex items-center justify-center rounded-full"
                style={{ width: 22, height: 22, backgroundColor: '#34C759' }}
            >
                <CheckIcon width={13} height={13} color="#FFFFFF" />
            </span>
        </div>
    );
}
