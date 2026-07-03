import { useTheme } from '../../context/ThemeContext.jsx';

export default function AppearanceSection() {
    const { preference, setThemePreference } = useTheme();

    return (
        <div className="w-full flex flex-col gap-3">
            <h2 className="text-[13px] font-semibold uppercase" style={{ color: '#8E8E93', letterSpacing: '0.05em' }}>
                Appearance
            </h2>
            <div
                className="w-full px-4 py-3 rounded-lg flex items-center justify-between border"
                style={{ borderColor: 'var(--neutral-300)', backgroundColor: 'var(--neutral-100)' }}
            >
                <div>
                    <p className="text-[15px] font-semibold" style={{ color: 'var(--neutral-800)' }}>Theme</p>
                    <p className="text-[12px] mt-0.5" style={{ color: '#8E8E93' }}>
                        {preference === 'dark' ? 'Dark mode' : 'Light mode'}
                    </p>
                </div>
                <div className="flex rounded-full overflow-hidden border" style={{ borderColor: 'var(--neutral-300)' }}>
                    {[
                        { key: 'light', label: '☀️ Light' },
                        { key: 'dark',  label: '🌙 Dark' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setThemePreference(key)}
                            className="px-3 py-1.5 text-[13px] font-semibold transition-colors"
                            style={{
                                background: preference === key ? 'var(--brand-100)' : 'transparent',
                                color: preference === key ? '#fff' : 'var(--neutral-600)',
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
