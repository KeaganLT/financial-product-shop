export default function InfoRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2" style={{ borderBottom: '1px solid var(--neutral-300)' }}>
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--neutral-800)', textAlign: 'right' }}>{value}</span>
        </div>
    );
}
