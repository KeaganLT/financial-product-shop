import { useTheme } from '../context/ThemeContext.jsx';

const NEXT_PREFERENCE = {
    light: 'dark',
    dark: 'system',
    system: 'light',
};

const LABEL = {
    light: 'Light',
    dark: 'Dark',
    system: 'Auto',
};

export default function ThemeToggle({ className = '' }) {
    const { preference, setThemePreference } = useTheme();

    return (
        <button
            type="button"
            onClick={() => setThemePreference(NEXT_PREFERENCE[preference])}
            className={`text-[13px] px-3 py-1.5 rounded-full border ${className}`}
            style={{ color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}
            aria-label={`Theme: ${LABEL[preference]}. Click to change.`}
        >
            {LABEL[preference]}
        </button>
    );
}
