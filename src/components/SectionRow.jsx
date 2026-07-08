import ProductCard from './ProductCard';

// Matches Figma section wrapper specs:
// "Recommended for you" and "New arrivals" sections share the same layout:
// - Section heading: #000000, Headline 3 Bold
// - "View all" link: #1860BF, Body 15/Semibold, with arrow right (width 14)
// - Heading wrapper height: 28px
// - Padding: top 16, bottom 8, left 24, right 24
// - Item spacing between cards: 16px
// - Cards scroll horizontally, padding-bottom 20px

export default function SectionRow({ title, products, onViewAll }) {
    return (
        // Outer wrapper: vertical, padding top 16, bottom 8, left/right 24
        <div className="flex flex-col gap-4 pt-4 pb-2">

            {/* Section header row — height 28px, space-between */}
            <div className="flex items-center justify-between px-6" style={{ minHeight: '28px' }}>
                {/* Section title — Headline 3 Bold */}
                <h2 className="text-[17px] font-bold" style={{ color: 'var(--text-primary)' }}>
                    {title}
                </h2>

                {/* View all — #1860BF, Body 15/Semibold, with arrow */}
                <button
                    className="flex items-center gap-1 text-[15px] font-semibold"
                    style={{ color: '#1860BF' }}
                    onClick={onViewAll}
                >
                    View all
                    {/* Arrow right — width 14 as per Figma */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M9 18l6-6-6-6"
                            stroke="#1860BF"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            {/* Horizontal scroll row — item spacing 16px, padding-bottom 20px, padding sides 24px */}
            <div className="flex gap-4 overflow-x-auto scroll-smooth px-6 pb-5 no-scrollbar">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} size="small" />
                ))}
            </div>
        </div>
    );
}