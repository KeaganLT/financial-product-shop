import { APP_ENV, isProduction } from '../config/env.js';

export default function EnvRibbon() {
    if (isProduction) return null;

    return (
        <div
            className="fixed bottom-2 left-2 z-[80] px-2 py-0.5 rounded pointer-events-none"
            style={{
                background: 'var(--brand-100)',
                color: '#fff',
                fontFamily: 'Roboto, sans-serif',
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                opacity: 0.9,
            }}
        >
            {APP_ENV}
        </div>
    );
}
