export default function Section({ heading, children }) {
    return (
        <div className="flex flex-col gap-2">
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--neutral-800)', borderLeft: '3px solid var(--brand-100)', paddingLeft: 8 }}>
                {heading}
            </h3>
            {children}
        </div>
    );
}
