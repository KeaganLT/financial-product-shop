// Skeleton components mirror the exact shape and size of the real components
// The shimmer animation creates the "loading" feel
// Each skeleton matches its real counterpart 1-to-1 so there's no layout shift

// ─── Base shimmer animation ───────────────────────────────────────────────────
// Used by every skeleton block — a grey box with a moving highlight
function SkeletonBlock({ className = '' }) {
    return (
        <div
            className={`bg-gray-100 rounded-lg overflow-hidden relative ${className}`}
        >
            {/* The shimmer — a white gradient that slides across */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                    animation: 'shimmer 1.5s infinite',
                    backgroundSize: '200% 100%',
                }}
            />
        </div>
    );
}

// ─── Hero slider skeleton ─────────────────────────────────────────────────────
// Matches HeroSlider: dark rounded card 300x193, with a smaller peek card
export function HeroSliderSkeleton() {
    return (
        <div className="flex gap-2 px-[26px] pb-5">
            {/* Main slide */}
            <SkeletonBlock
                className="flex-shrink-0 rounded-[28px]"
                style={{ width: '300px', height: '193px' }}
            />
            {/* Peek card */}
            <SkeletonBlock
                className="flex-shrink-0 rounded-[28px] opacity-50"
                style={{ width: '56px', height: '193px' }}
            />
        </div>
    );
}

// ─── Product card skeleton ────────────────────────────────────────────────────
// Matches ProductCard size="small": 155px wide, image + title + price
export function ProductCardSkeleton() {
    return (
        <div className="w-[155px] min-w-[155px] bg-white rounded-xl overflow-hidden flex flex-col"
             style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
            {/* Image area */}
            <SkeletonBlock className="w-full rounded-none" style={{ height: '120px' }} />
            {/* Text area */}
            <div className="p-3 flex flex-col gap-2">
                {/* Title — two lines */}
                <SkeletonBlock className="h-3 w-full rounded-full" />
                <SkeletonBlock className="h-3 w-3/4 rounded-full" />
                {/* Price */}
                <SkeletonBlock className="h-2.5 w-1/2 rounded-full mt-1" />
            </div>
        </div>
    );
}

// ─── Section row skeleton ─────────────────────────────────────────────────────
// Matches SectionRow: heading + view all + horizontal row of 3 cards
export function SectionRowSkeleton() {
    return (
        <div className="flex flex-col gap-4 pt-4 pb-2">
            {/* Section header */}
            <div className="flex items-center justify-between px-6">
                <SkeletonBlock className="h-5 w-40 rounded-full" />
                <SkeletonBlock className="h-4 w-16 rounded-full" />
            </div>
            {/* Horizontal card row — show 2.5 cards to hint at scrolling */}
            <div className="flex gap-4 px-6 pb-5 overflow-hidden">
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                {/* Half card peeking — hints there are more */}
                <div className="w-[80px] min-w-[80px] bg-white rounded-xl overflow-hidden"
                     style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                >
                    <SkeletonBlock className="w-full h-[120px] rounded-none" />
                    <div className="p-3 flex flex-col gap-2">
                        <SkeletonBlock className="h-3 w-full rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Discover section skeleton ────────────────────────────────────────────────
// Matches DiscoverSection: title + filter tabs + 2-column grid
export function DiscoverSectionSkeleton() {
    return (
        <div className="flex flex-col">
            {/* "Discover" heading */}
            <div className="px-6 pt-5 pb-3">
                <SkeletonBlock className="h-7 w-28 rounded-full" />
            </div>
            {/* Filter tabs */}
            <div className="flex gap-2 px-6 pb-4">
                {[80, 72, 96, 64].map((w, i) => (
                    <SkeletonBlock
                        key={i}
                        className="h-8 rounded-full flex-shrink-0"
                        style={{ width: `${w}px` }}
                    />
                ))}
            </div>
            {/* 2-column grid — 4 cards */}
            <div className="grid grid-cols-2 gap-4 px-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden"
                         style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                    >
                        <SkeletonBlock className="w-full h-[120px] rounded-none" />
                        <div className="p-3 flex flex-col gap-2">
                            <SkeletonBlock className="h-3 w-full rounded-full" />
                            <SkeletonBlock className="h-3 w-3/4 rounded-full" />
                            <SkeletonBlock className="h-2.5 w-1/2 rounded-full mt-1" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Product detail skeleton ──────────────────────────────────────────────────
// Matches ProductDetailPage layout
export function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen bg-white">
            {/* Top app bar skeleton */}
            <div className="fixed top-0 left-0 right-0 bg-white z-50 flex items-center px-4"
                 style={{ height: '64px', borderBottom: '1px solid #E5E5EA' }}>
                <div className="max-w-[411px] mx-auto w-full flex items-center gap-3">
                    <SkeletonBlock className="w-6 h-6 rounded-full flex-shrink-0" />
                    <SkeletonBlock className="h-5 w-48 rounded-full" />
                </div>
            </div>

            <div className="pt-16 pb-24 max-w-[411px] mx-auto">
                {/* Image skeleton — matches 289px height */}
                <div className="px-6 pt-4">
                    <SkeletonBlock className="w-full rounded-[8px]" style={{ height: '289px' }} />
                </div>

                <div className="px-6 pt-6 flex flex-col gap-6">
                    {/* Title — two lines at 28px */}
                    <div className="flex flex-col gap-2">
                        <SkeletonBlock className="h-8 w-full rounded" />
                        <SkeletonBlock className="h-8 w-3/5 rounded" />
                    </div>

                    {/* Description — 3 lines at 20px */}
                    <div className="flex flex-col gap-3">
                        <SkeletonBlock className="h-5 w-full rounded" />
                        <SkeletonBlock className="h-5 w-full rounded" />
                        <SkeletonBlock className="h-5 w-4/5 rounded" />
                        <SkeletonBlock className="h-5 w-24 rounded" />
                    </div>

                    <div style={{ height: '1px', backgroundColor: '#F2F2F7' }} />

                    {/* Related products section heading */}
                    <SkeletonBlock className="h-6 w-36 rounded" />

                    {/* Related cards row */}
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex-shrink-0 rounded-[12px] overflow-hidden flex flex-col gap-2 p-3"
                                 style={{ width: '284px', height: '192px', border: '1px solid #E5E5EA' }}>
                                <SkeletonBlock className="w-full rounded-[8px]" style={{ height: '120px' }} />
                                <SkeletonBlock className="h-4 w-3/4 rounded" />
                                <SkeletonBlock className="h-3 w-1/2 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky footer skeleton */}
            <div className="fixed bottom-0 left-0 right-0 bg-white"
                 style={{ borderTop: '0.5px solid #C7C7CC', height: '69px' }}>
                <div className="max-w-[411px] mx-auto flex items-center justify-between px-7 h-full">
                    <div className="flex flex-col gap-1">
                        <SkeletonBlock className="h-6 w-20 rounded" />
                        <SkeletonBlock className="h-4 w-16 rounded" />
                    </div>
                    <SkeletonBlock className="h-[42px] w-[177px] rounded-full" />
                </div>
            </div>
        </div>
    );
}