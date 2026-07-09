import { useTheme } from '../../context/ThemeContext.jsx';

import SectionHeading from './SectionHeading.jsx';

const THEME_ICON = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="5" stroke="var(--brand-100)" strokeWidth="2" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="var(--brand-100)" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export default function AppearanceSection() {
    const { preference, setThemePreference } = useTheme();

    return (
        <div className="w-full flex flex-col gap-3">
            <SectionHeading icon={THEME_ICON}>Appearance</SectionHeading>
            <div
                className="w-full px-4 py-3 rounded-[12px] flex items-center justify-between border"
                style={{ borderColor: 'var(--neutral-300)', backgroundColor: 'var(--neutral-100)' }}
            >
                <div>
                    <p className="text-[15px] font-semibold" style={{ color: 'var(--neutral-800)' }}>Theme</p>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
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
