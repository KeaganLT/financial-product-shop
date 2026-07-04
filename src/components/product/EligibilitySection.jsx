import { useNavigate } from 'react-router-dom';

function CheckCircle({ pass }) {
    return pass ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
            <circle cx="8" cy="8" r="8" fill="#168C34" />
            <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
            <circle cx="8" cy="8" r="8" fill="#C51C13" />
            <path d="M5 5l6 6M11 5l-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

export default function EligibilitySection({ eligibility, eligibilityChecks }) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-3">
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: '20px', fontWeight: 700, lineHeight: '28px', letterSpacing: '0.35px', color: 'var(--text-primary)' }}>
                Your eligibility
            </h3>
            <div
                className="flex items-center gap-2"
                style={{ fontFamily: 'Roboto, sans-serif', fontSize: '15px', fontWeight: 600, color: eligibility.isEligible ? '#168C34' : '#C51C13' }}
            >
                {eligibility.isEligible ? (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="9" fill="#168C34" />
                        <path d="M5 9l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="9" fill="#C51C13" />
                        <path d="M6 6l6 6M12 6l-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                )}
                {eligibility.isEligible ? 'You qualify for this product' : 'You do not currently qualify'}
            </div>

            {!eligibility.isEligible && eligibilityChecks && (
                <div className="flex flex-col gap-2">
                    {Object.values(eligibilityChecks).map((check) => (
                        <div
                            key={check.label}
                            className="flex items-start gap-3 px-3 py-2 rounded-[8px]"
                            style={{ background: 'var(--neutral-100)', border: '1px solid var(--neutral-300)', borderLeft: `3px solid ${check.pass ? '#168C34' : '#C51C13'}` }}
                        >
                            <CheckCircle pass={check.pass} />
                            <div className="flex flex-col gap-0.5">
                                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{check.label}</span>
                                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: 'var(--text-secondary)' }}>{check.detail}</span>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => navigate('/account')}
                        className="self-start mt-1"
                        style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, color: '#1860BF', textDecoration: 'underline' }}
                    >
                        Go to Account to resolve →
                    </button>
                </div>
            )}

            {!eligibility.isEligible && !eligibilityChecks && (
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Loading eligibility details…
                </p>
            )}
        </div>
    );
}
