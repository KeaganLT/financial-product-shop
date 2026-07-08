export default function StatusBadge({ fulfilmentType, contractSigned = false }) {
    const isImmediate = (fulfilmentType || '').toLowerCase().includes('immediate');
    const isActive = contractSigned || isImmediate;

    const label = isActive
        ? 'Active'
        : 'Active: Pending approval';

    return (
        <span
            style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 100,
                fontSize: 11,
                fontFamily: 'Roboto, sans-serif',
                lineHeight: '16px',
                fontWeight: 500,
                background: isActive ? '#E6F9ED' : '#FFF4E5',
                color: isActive ? '#1A7A3C' : '#995900',
            }}
        >
            {label}
        </span>
    );
}
