import { getProductPlaceholder } from '../../assets/placeholders/index.js';

function getCoverPoints(productName = '') {
    const n = productName.toLowerCase();
    if (n.includes('insurance')) {
        return ['Accidental damage', 'Theft & loss', 'International coverage', 'No excess on first claim'];
    }
    if (n.includes('investment') || n.includes('annuity') || n.includes('fund')) {
        return ['Competitive interest rates', 'Flexible terms', 'Tax-efficient returns', 'Monthly interest payments'];
    }
    return ['Full coverage', 'Easy claims process', 'Dedicated support'];
}

export default function StepProductReview({ product, onNext }) {
    const coverPoints = getCoverPoints(product?.name);

    return (
        <div className="flex flex-col gap-6 px-6 pt-4 pb-8">
            <div>
                <h2 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Review your product
                </h2>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Here's what you're signing up for.
                </p>
            </div>

            <div className="rounded-[12px] border overflow-hidden" style={{ borderColor: 'var(--neutral-300)' }}>
                <div className="w-full overflow-hidden bg-[var(--neutral-300)]" style={{ height: 160 }}>
                    <img
                        src={product.imageUrl || getProductPlaceholder(product.name)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="px-4 py-4 flex flex-col gap-3">
                    <div>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {product.name}
                        </p>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
                            {product.description?.slice(0, 120)}{product.description?.length > 120 ? '…' : ''}
                        </p>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 24, fontWeight: 700, color: '#1860BF' }}>
                            R{Number(product.price).toFixed(2)}
                        </span>
                        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: 'var(--text-secondary)' }}>/ month</span>
                    </div>
                    <div style={{ height: 1, background: 'var(--neutral-300)' }} />
                    <div>
                        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                            What's covered
                        </p>
                        <ul className="flex flex-col gap-2">
                            {coverPoints.map((point) => (
                                <li key={point} className="flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="8" r="8" fill="#E6F9ED" />
                                        <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#168C34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: 'var(--neutral-700)' }}>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <button
                onClick={onNext}
                className="w-full h-[50px] rounded-[100px] font-semibold text-white"
                style={{ background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)', fontFamily: 'Roboto, sans-serif', fontSize: 17 }}
            >
                Continue
            </button>
        </div>
    );
}
