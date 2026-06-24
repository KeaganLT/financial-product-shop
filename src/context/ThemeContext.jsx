import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'theme-preference';
const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

function getSystemTheme() {
    return window.matchMedia(PREFERS_DARK_QUERY).matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
    const [preference, setPreference] = useState(
        () => window.localStorage.getItem(STORAGE_KEY) || 'system'
    );
    const [systemTheme, setSystemTheme] = useState(getSystemTheme);

    // Track the OS/browser color-scheme preference live, so "system" mode
    // updates immediately if the user flips their OS setting.
    useEffect(() => {
        const mediaQuery = window.matchMedia(PREFERS_DARK_QUERY);
        const handleChange = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const resolvedTheme = preference === 'system' ? systemTheme : preference;

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', resolvedTheme);
    }, [resolvedTheme]);

    function setThemePreference(next) {
        setPreference(next);
        window.localStorage.setItem(STORAGE_KEY, next);
    }

    return (
        <ThemeContext.Provider value={{ preference, resolvedTheme, setThemePreference }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return ctx;
}
