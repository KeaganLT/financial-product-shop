export default function StatusBadge({ fulfilmentType }) {
    const isImmediate = (fulfilmentType || '').toLowerCase().includes('immediate');
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
                background: isImmediate ? '#E6F9ED' : '#FFF4E5',
                color: isImmediate ? '#1A7A3C' : '#995900',
            }}
        >
            {isImmediate ? 'Active: Immediate' : 'Active: Pending approval'}
        </span>
    );
}
