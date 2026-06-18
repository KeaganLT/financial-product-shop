import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import HeroSlider from '../components/HeroSlider';
import SectionRow from '../components/SectionRow';
import DiscoverSection from '../components/DiscoverSection';
import { HeroSliderSkeleton, SectionRowSkeleton, DiscoverSectionSkeleton } from '../components/Skeletons';
import { getProducts } from '../services/productService';

export default function ProductsPage() {
    const { isLoggedIn } = useAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    useEffect(() => {
        getProducts()
            .then((data) => {
                setProducts(Array.isArray(data) ? data : []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const half        = Math.ceil(products.length / 2);
    const recommended = products.slice(0, half);
    const newArrivals = products.slice(half);

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-[411px] mx-auto pt-[73px] pb-[88px]">

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
                        <div className="mt-4">
                            <HeroSlider />
                        </div>

                        {isLoggedIn ? (
                            <>
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

                                {products.length === 0 && (
                                    <div className="flex flex-col items-center py-16 px-6 text-center">
                                        <p className="text-[15px] font-semibold text-black">No products yet</p>
                                        <p className="text-[13px] text-gray-400 mt-1">Check back soon</p>
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