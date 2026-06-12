import { useState } from 'react';
import ProductCard from './ProductCard';

// Matches Figma "Guest User Home" — Discover layout with filter tabs
// Tabs: All | Popular | Investment | More
// Products shown in a 2-column grid below the tabs

const TABS = ['All', 'Popular', 'Investment', 'More'];

export default function DiscoverSection({ products }) {
    const [activeTab, setActiveTab] = useState('All');

    // Filter products based on active tab
    // Once the API returns category data this can filter by product.category
    // For now All shows everything, others show subsets by index as placeholder
    const filtered = activeTab === 'All'
        ? products
        : products.filter((_, i) => i % TABS.indexOf(activeTab) === 0);

    return (
        <div className="flex flex-col">

            {/* Section title */}
            <div className="px-6 pt-5 pb-3">
                <h2 className="text-[22px] font-bold text-black">Discover</h2>
            </div>

            {/* Filter tabs row — horizontal scroll so more tabs can be added */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-6 pb-4">
                {TABS.map((tab) => {
                    const active = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium
                transition-colors duration-150
                ${active
                                ? 'bg-[#1860BF] text-white'
                                : 'bg-gray-100 text-gray-500'
                            }
              `}
                        >
                            {tab}
                        </button>
                    );
                })}
            </div>

            {/* 2-column product grid */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-16 px-6 text-center">
                    <p className="text-[15px] font-semibold text-black">No products here yet</p>
                    <p className="text-[13px] text-gray-400 mt-1">Try a different filter</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 px-6">
                    {filtered.map((product) => (
                        <ProductCard key={product.id} product={product} size="small" />
                    ))}
                </div>
            )}
        </div>
    );
}