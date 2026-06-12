import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProductById } from '../services/productService';

export default function ProductDetailPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {isLoggedIn} = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getProductById(id)
            .then((data) => setProduct(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#1860BF] border-t-transparent rounded-full animate-spin"/>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-4">
                <p className="text-red-500 text-sm">{error}</p>
                <button
                    onClick={() => navigate('/products')}
                    className="text-[#1860BF] text-sm font-semibold"
                >
                    ← Back to Products
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">

            {/* Back button */}
            <div className="px-6 pt-12 pb-4">
                <button
                    onClick={() => navigate('/products')}
                    className="flex items-center gap-1 text-[#1860BF] text-[14px] font-semibold"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="#1860BF" strokeWidth="2"
                              strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back
                </button>
            </div>

            {/* Hero image */}
            <img
                src={product.imageUrl || 'https://placehold.co/411x220?text=No+Image'}
                alt={product.name}
                className="w-full object-cover"
                style={{maxHeight: '220px'}}
            />

            {/* Content */}
            <div className="px-6 pt-5 pb-24 flex flex-col gap-4">

                {/* Name + price row */}
                <div className="flex items-start justify-between gap-3">
                    <h1 className="text-[20px] font-bold text-black leading-tight flex-1">
                        {product.name}
                    </h1>
                    <span className="text-[17px] font-semibold text-[#1860BF] whitespace-nowrap">
            R {Number(product.price).toFixed(0)} p/m
          </span>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100"/>

                {/* Description */}
                <div className="flex flex-col gap-1">
                    <h2 className="text-[15px] font-semibold text-black">About this product</h2>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                        {product.description}
                    </p>
                </div>

                {/* Eligibility note */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[12px] text-gray-400 leading-relaxed">
                        Eligibility checks are performed at checkout. You need to be logged in to proceed.
                    </p>
                </div>
            </div>

            {/* Fixed bottom CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4">
                <div className="max-w-[411px] mx-auto">
                    <button
                        onClick={() => isLoggedIn ? navigate('/cart') : navigate('/login')}
                        className="w-full py-3.5 rounded-xl text-white text-[15px] font-semibold"
                        style={{backgroundColor: '#1860BF'}}
                    >
                        {isLoggedIn ? 'Add to Cart' : 'Login to Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    )
}