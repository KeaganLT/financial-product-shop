function SkeletonBlock({ className = '' }) {
    return (
        <div
            className={`bg-gray-100 rounded-lg overflow-hidden relative ${className}`}
        >
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

export function HeroSliderSkeleton() {
    return (
        <div className="flex gap-2 px-6 pb-5">
            <SkeletonBlock
                className="flex-shrink-0 rounded-[28px]"
                style={{ width: '300px', height: '193px' }}
            />
            <SkeletonBlock
                className="flex-shrink-0 rounded-[28px] opacity-50"
                style={{ width: '56px', height: '193px' }}
            />
        </div>
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="w-[155px] min-w-[155px] bg-white rounded-xl overflow-hidden flex flex-col"
             style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
            <SkeletonBlock className="w-full rounded-none" style={{ height: '120px' }} />
            <div className="p-3 flex flex-col gap-2">
                <SkeletonBlock className="h-3 w-full rounded-full" />
                <SkeletonBlock className="h-3 w-3/4 rounded-full" />
                <SkeletonBlock className="h-2.5 w-1/2 rounded-full mt-1" />
            </div>
        </div>
    );
}

export function SectionRowSkeleton() {
    return (
        <div className="flex flex-col gap-4 pt-4 pb-2">
            <div className="flex items-center justify-between px-6">
                <SkeletonBlock className="h-5 w-40 rounded-full" />
                <SkeletonBlock className="h-4 w-16 rounded-full" />
            </div>
            <div className="flex gap-4 px-6 pb-5 overflow-hidden">
                <ProductCardSkeleton />
                <ProductCardSkeleton />
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

export function DiscoverSectionSkeleton() {
    return (
        <div className="flex flex-col">
            <div className="px-6 pt-5 pb-3">
                <SkeletonBlock className="h-7 w-28 rounded-full" />
            </div>
            <div className="flex gap-2 px-6 pb-4">
                {[56, 80, 96, 72, 88].map((w, i) => (
                    <SkeletonBlock
                        key={i}
                        className="h-8 rounded-full flex-shrink-0"
                        style={{ width: `${w}px` }}
                    />
                ))}
            </div>
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

export function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen bg-white">
            <div className="fixed top-0 left-0 right-0 bg-white z-50 flex items-center px-4"
                 style={{ height: '64px', borderBottom: '1px solid #E5E5EA' }}>
                <div className="max-w-[411px] mx-auto w-full flex items-center gap-3">
                    <SkeletonBlock className="w-6 h-6 rounded-full flex-shrink-0" />
                    <SkeletonBlock className="h-5 w-48 rounded-full" />
                </div>
            </div>

            <div className="pt-16 pb-24 max-w-[411px] mx-auto">
                <div className="px-6 pt-4">
                    <SkeletonBlock className="w-full rounded-[8px]" style={{ height: '289px' }} />
                </div>

                <div className="px-6 pt-6 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <SkeletonBlock className="h-8 w-full rounded" />
                        <SkeletonBlock className="h-8 w-3/5 rounded" />
                    </div>

                    <div className="flex flex-col gap-3">
                        <SkeletonBlock className="h-5 w-full rounded" />
                        <SkeletonBlock className="h-5 w-full rounded" />
                        <SkeletonBlock className="h-5 w-4/5 rounded" />
                        <SkeletonBlock className="h-5 w-24 rounded" />
                    </div>

                    <div style={{ height: '1px', backgroundColor: '#F2F2F7' }} />

                    <SkeletonBlock className="h-6 w-36 rounded" />

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
