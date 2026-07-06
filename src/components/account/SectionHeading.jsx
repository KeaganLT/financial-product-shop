export default function SectionHeading({ icon, children }) {
    return (
        <div className="flex items-center gap-2 mt-2">
            {icon}
            <span
                style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1860BF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                }}
            >
                {children}
            </span>
            <span className="flex-1 h-px" style={{ background: '#1860BF', opacity: 0.2 }} />
        </div>
    );
}
