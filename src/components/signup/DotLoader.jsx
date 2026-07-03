const DOT_POSITIONS = [
    { top: 0,  left: 18 },
    { top: 13, left: 0  },
    { top: 13, left: 36 },
    { top: 33, left: 0  },
    { top: 33, left: 36 },
    { top: 46, left: 18 },
];

export default function DotLoader() {
    return (
        <div className="relative" style={{ width: 49, height: 59 }}>
            {DOT_POSITIONS.map((pos, index) => (
                <span
                    key={index}
                    className="absolute rounded-full animate-pulse"
                    style={{
                        top: pos.top,
                        left: pos.left,
                        width: 13,
                        height: 13,
                        backgroundColor: index === 0 ? 'var(--brand-200)' : 'var(--neutral-300)',
                        animationDelay: `${index * 120}ms`,
                    }}
                />
            ))}
        </div>
    );
}
