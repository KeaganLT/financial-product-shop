export const APP_ENV = import.meta.env.VITE_APP_ENV || 'production';

export const isProduction = APP_ENV === 'production';
export const isStaging    = APP_ENV === 'staging';
export const isDevelopment = APP_ENV === 'development';

export const BRAND_PRIMARY   = import.meta.env.VITE_BRAND_PRIMARY   || '#1860BF';
export const BRAND_SECONDARY = import.meta.env.VITE_BRAND_SECONDARY || '#1AB0DE';

export const features = {
    googleSignIn: import.meta.env.VITE_FEATURE_GOOGLE_SIGNIN !== 'false',
    pwaInstall:   import.meta.env.VITE_FEATURE_PWA_INSTALL   !== 'false',
    share:        import.meta.env.VITE_FEATURE_SHARE         !== 'false',
};

export function applyBrandTheme() {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--brand-100', BRAND_PRIMARY);
    root.style.setProperty('--brand-200', BRAND_SECONDARY);
    root.style.setProperty('--gradient-brand', `linear-gradient(90deg, ${BRAND_PRIMARY} 0%, ${BRAND_SECONDARY} 100%)`);
}
