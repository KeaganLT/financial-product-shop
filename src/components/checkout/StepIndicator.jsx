export default function StepIndicator({ current, total }) {
    return (
        <div className="flex items-center gap-2 px-6 pb-4">
            {Array.from({ length: total }, (_, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                    <div
                        className="h-1.5 w-full rounded-full transition-all"
                        style={{ background: i < current ? 'var(--brand-100)' : 'var(--neutral-300)' }}
                    />
                </div>
            ))}
        </div>
    );
}
