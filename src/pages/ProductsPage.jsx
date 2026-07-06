import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import HeroSlider from '../components/HeroSlider';
import SectionRow from '../components/SectionRow';
import DiscoverSection from '../components/DiscoverSection';
import ProductGrid from '../components/ProductGrid';
import ProductSearchBar from '../components/ProductSearchBar';
import { HeroSliderSkeleton, SectionRowSkeleton, DiscoverSectionSkeleton } from '../components/Skeletons';
import { getProducts } from '../services/productService';
import { getEligibility, getSubscriptions } from '../services/subscriptionService';
import { getProfile } from '../services/customerService';
import { getKycStatus } from '../services/kycStatus';
import { getBankDetails } from '../services/bankingService';

function OnboardingChecklist({ customerId, token, onDismiss }) {
    const navigate = useNavigate();
    const [checks, setChecks] = useState(null);

    useEffect(() => {
        Promise.all([
            getProfile(token).catch(() => null),
            getKycStatus(customerId).catch(() => null),
        ]).then(([profile, kyc]) => {
            setChecks({
                customerType: !!profile?.customerType,
                kycDocs: !!(kyc?.proofOfResidence && kyc?.selfie),
                bankLinked: !!getBankDetails(customerId),
            });
        });
    }, [customerId, token]);

    if (!checks) return null;
    const allDone = Object.values(checks).every(Boolean);
    if (allDone) return null;

    const items = [
        { key: 'customerType', label: 'Set your customer type', path: '/account' },
        { key: 'kycDocs',      label: 'Upload ID documents (KYC)', path: '/account' },
        { key: 'bankLinked',   label: 'Add a debit order account', path: '/account/bank' },
    ];
    const done  = items.filter((i) => checks[i.key]).length;
    const total = items.length;

    return (
        <div
            className="mx-4 md:mx-0 mt-4 rounded-[14px] overflow-hidden"
            style={{ border: '1px solid #C7D9FF', background: '#F8FAFF' }}
        >
            <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1C1C' }}>
                        Finish setting up your account
                    </p>
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#8E8E93' }}>
                        {done} of {total} steps completed
                    </p>
                </div>
                <button onClick={onDismiss} style={{ color: '#C7C7CC', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>
            </div>

            {/* Progress bar */}
            <div className="px-4 pb-3">
                <div className="w-full h-1.5 rounded-full" style={{ background: '#E5E5EA' }}>
                    <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(done / total) * 100}%`, background: 'linear-gradient(90deg, #1860BF, #1AB0DE)' }}
                    />
                </div>
            </div>

            <div className="flex flex-col divide-y" style={{ borderTop: '1px solid #E5E5EA' }}>
                {items.map(({ key, label, path }) => (
                    <button
                        key={key}
                        onClick={() => navigate(path)}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left"
                        style={{ background: 'transparent' }}
                    >
                        <span
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: checks[key] ? '#168C34' : '#E5E5EA' }}
                        >
                            {checks[key] ? (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <path d="M2 5l2.5 2.5 3.5-3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C7C7CC', display: 'block' }} />
                            )}
                        </span>
                        <span style={{
                            fontFamily: 'Roboto, sans-serif', fontSize: 14,
                            color: checks[key] ? '#8E8E93' : '#1C1C1C',
                            textDecoration: checks[key] ? 'line-through' : 'none',
                            flex: 1,
                        }}>
                            {label}
                        </span>
                        {!checks[key] && (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 4l4 4-4 4" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

const CATEGORIES = [
    { key: 'all',        label: 'All' },
    { key: 'insurance',  label: 'Insurance' },
    { key: 'investment', label: 'Investments' },
    { key: 'device',     label: 'Device' },
];

function matchesCategory(product, category) {
    if (category === 'all') return true;
    const n = (product.name ?? '').toLowerCase();
    if (category === 'insurance')  return n.includes('insurance');
    if (category === 'investment') return n.includes('investment') || n.includes('annuity') || n.includes('fund');
    if (category === 'device')     return n.includes('device') || n.includes('contract');
    return true;
}

export default function ProductsPage() {
    const { isLoggedIn, auth } = useAuth();

    const [products, setProducts] = useState([]);
    const [eligibleIds, setEligibleIds] = useState(null);
    const [ownedProductIds, setOwnedProductIds] = useState(new Set());
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [query, setQuery] = useState('');
    const [viewAll, setViewAll] = useState(null);
    const [showChecklist, setShowChecklist] = useState(() => {
        // Only show once per session, not every page visit
        return sessionStorage.getItem('checklist_dismissed') !== '1';
    });

    useEffect(() => {
        getProducts()
            .then((data) => {
                setProducts(Array.isArray(data) ? data : []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!isLoggedIn || products.length === 0) {
            queueMicrotask(() => setEligibleIds(null));
            return;
        }

        const productIds = products.map((p) => p.id);
        Promise.all([
            getEligibility(productIds, auth.token),
            getSubscriptions(auth.token),
        ])
            .then(([eligResults, subs]) => {
                const ids = new Set(eligResults.filter((r) => r.isEligible).map((r) => r.productId));
                setEligibleIds(ids);

                const owned = new Set(
                    (Array.isArray(subs) ? subs : []).map((s) => {
                        const prod = Array.isArray(s.product) ? s.product[0] : s.product;
                        return s.productId ?? prod?.id ?? null;
                    }).filter(Boolean)
                );
                setOwnedProductIds(owned);
            })
            .catch(() => setEligibleIds(null));
    }, [isLoggedIn, products, auth?.token]);

    const visibleProducts = products
        .filter((p) => !ownedProductIds.has(p.id))
        .filter((p) => matchesCategory(p, activeCategory));

    const recommended = eligibleIds
        ? visibleProducts.filter((p) => eligibleIds.has(p.id))
        : [];
    const newArrivals = eligibleIds
        ? visibleProducts.filter((p) => !eligibleIds.has(p.id))
        : visibleProducts;

    const trimmedQuery = query.trim().toLowerCase();
    const searchResults = visibleProducts.filter((p) =>
        (p.name ?? '').toLowerCase().includes(trimmedQuery) ||
        (p.description ?? '').toLowerCase().includes(trimmedQuery)
    );

    const gridProducts = viewAll === 'recommended' ? recommended
        : viewAll === 'newArrivals' ? newArrivals
        : searchResults;
    const gridTitle = viewAll === 'recommended' ? 'Recommended for you'
        : viewAll === 'newArrivals' ? 'New arrivals'
        : `Results for “${query.trim()}”`;
    const showGrid = trimmedQuery.length > 0 || viewAll !== null;

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-[411px] md:max-w-5xl mx-auto pt-[73px] pb-[88px] md:pb-16">

                {loading && (
                    <>
                        <div className="mt-4">
                            <HeroSliderSkeleton />
                        </div>
                        {isLoggedIn ? (
                            <>
                                <SectionRowSkeleton />
                                <SectionRowSkeleton />
                            </>
                        ) : (
                            <DiscoverSectionSkeleton />
                        )}
                    </>
                )}

                {error && (
                    <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-600 font-medium">Could not load products</p>
                        <p className="text-xs text-red-400 mt-1">
                            Make sure your Docker services are running on port 8080
                        </p>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {isLoggedIn && showChecklist && (
                            <OnboardingChecklist
                                customerId={auth.customerId}
                                token={auth.token}
                                onDismiss={() => {
                                    setShowChecklist(false);
                                    sessionStorage.setItem('checklist_dismissed', '1');
                                }}
                            />
                        )}

                        {!showGrid && (
                            <div className="mt-4">
                                <HeroSlider />
                            </div>
                        )}

                        <ProductSearchBar
                            value={query}
                            onChange={(v) => { setQuery(v); if (v) setViewAll(null); }}
                        />

                        {/* Category filter chips */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar px-6 md:px-0 mt-4 pb-1">
                            {CATEGORIES.map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveCategory(key)}
                                    className="flex-shrink-0 px-4 h-[32px] rounded-full text-[13px] font-semibold border transition-colors"
                                    style={{
                                        borderColor: activeCategory === key ? '#1860BF' : 'var(--neutral-400)',
                                        background:  activeCategory === key ? '#1860BF' : 'var(--neutral-100)',
                                        color:       activeCategory === key ? '#fff' : 'var(--neutral-700)',
                                        fontFamily: 'Roboto, sans-serif',
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {showGrid ? (
                            <div className="flex flex-col gap-3 mt-5 px-6 md:px-0">
                                <div className="flex items-center justify-between">
                                    <h2 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {gridTitle}
                                    </h2>
                                    {viewAll !== null && (
                                        <button
                                            onClick={() => setViewAll(null)}
                                            style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 600, color: '#1860BF' }}
                                        >
                                            ← Back
                                        </button>
                                    )}
                                </div>
                                <ProductGrid
                                    products={gridProducts}
                                    emptyLabel={trimmedQuery ? 'No products match your search' : 'Nothing here yet'}
                                />
                            </div>
                        ) : isLoggedIn ? (
                            <>
                                {recommended.length > 0 && (
                                    <SectionRow
                                        title="Recommended for you"
                                        products={recommended}
                                        onViewAll={() => setViewAll('recommended')}
                                    />
                                )}

                                {newArrivals.length > 0 && (
                                    <SectionRow
                                        title="New arrivals"
                                        products={newArrivals}
                                        onViewAll={() => setViewAll('newArrivals')}
                                    />
                                )}

                                {visibleProducts.length === 0 && (
                                    <div className="flex flex-col items-center py-16 px-6 text-center">
                                        <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>No products yet</p>
                                        <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>Check back soon</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <DiscoverSection products={products} />
                        )}
                    </>
                )}
            </main>

            <BottomNav />
        </div>
    );
}