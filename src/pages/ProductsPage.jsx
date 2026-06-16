import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import HeroSlider from '../components/HeroSlider';
import SectionRow from '../components/SectionRow';
import DiscoverSection from '../components/DiscoverSection';
import { getProducts } from '../services/productService';

export default function ProductsPage() {
    const { isLoggedIn, user } = useAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    useEffect(() => {
        getProducts()
            .then((data) => {
                // Safety check — make sure we always set an array
                // Log the raw data so you can see exactly what the API returns
                console.log('Products from API:', data);
                setProducts(Array.isArray(data) ? data : []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    // Split products into two sections for the logged-in view
    const half        = Math.ceil(products.length / 2);
    const recommended = products.slice(0, half);
    const newArrivals = products.slice(half);

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-[411px] mx-auto pt-[73px] pb-[72px]">

                {/* Loading spinner */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-4 border-[#1860BF] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-600 font-medium">Could not load products</p>
                        <p className="text-xs text-red-400 mt-1">
                            Make sure your Docker services are running on port 8080
                        </p>
                    </div>
                )}

                {/* Main content — only shown when not loading and no error */}
                {!loading && !error && (
                    <>
                        {/* Hero slider shown to everyone */}
                        <div className="mt-4">
                            <HeroSlider />
                        </div>

                        {isLoggedIn ? (
                            // ── LOGGED IN: personalised sections ──
                            <>
                                <div className="px-6 pt-4 pb-1">
                                    <p className="text-[13px] text-gray-400">
                                        Welcome back,{' '}
                                        <span className="text-black font-semibold">
                      {user?.firstName || 'there'}
                    </span>
                                    </p>
                                </div>

                                {recommended.length > 0 && (
                                    <SectionRow
                                        title="Recommended for you"
                                        products={recommended}
                                        viewAllPath="/products"
                                    />
                                )}

                                {newArrivals.length > 0 && (
                                    <SectionRow
                                        title="New arrivals"
                                        products={newArrivals}
                                        viewAllPath="/products"
                                    />
                                )}

                                {/* Empty state */}
                                {products.length === 0 && (
                                    <div className="flex flex-col items-center py-16 px-6 text-center">
                                        <p className="text-[15px] font-semibold text-black">No products yet</p>
                                        <p className="text-[13px] text-gray-400 mt-1">Check back soon</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            // ── GUEST: discover layout with filter tabs ──
                            <DiscoverSection products={products} />
                        )}
                    </>
                )}
            </main>

            <BottomNav />
        </div>
    );
}