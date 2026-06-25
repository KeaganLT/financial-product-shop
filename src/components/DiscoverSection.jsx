import { useState } from 'react';
import ProductCard from './ProductCard';

const TABS = ['All', 'Insurance', 'Investments', 'Cover', 'Accounts'];

const CATEGORY_BY_ID = {
    1: 'Insurance',
    2: 'Insurance',
    3: 'Insurance',
    4: 'Insurance',
    6: 'Investments',
    7: 'Investments',
    8: 'Investments',
    9: 'Investments',
};

export default function DiscoverSection({ products }) {
    const [activeTab, setActiveTab] = useState('All');

    const filtered = activeTab === 'All'
        ? products
        : products.filter((product) => CATEGORY_BY_ID[product.id] === activeTab);

    return (
        <div className="flex flex-col">

            <div className="flex flex-col gap-4 pt-6 px-6">
                <h2
                    style={{
                        color: '#1C1C1C',
                        fontSize: '28px',
                        fontWeight: 700,
                        lineHeight: '34px',
                        letterSpacing: '0.41px',
                    }}
                >
                    Discover
                </h2>

                <div className="flex gap-2 overflow-x-auto no-scrollbar">
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
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-16 px-6 text-center">
                    <p className="text-[15px] font-semibold text-black">No products here yet</p>
                    <p className="text-[13px] text-gray-400 mt-1">Try a different filter</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-6 pb-5 pt-4">
                    {filtered.map((product) => (
                        <ProductCard key={product.id} product={product} size="grid" />
                    ))}
                </div>
            )}
        </div>
    );
}