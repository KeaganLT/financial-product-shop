import ProductCard from './ProductCard';

export default function ProductGrid({ products, emptyLabel = 'No products found' }) {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center py-16 px-6 text-center">
                <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>{emptyLabel}</p>
                <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>Try a different search or category.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-6 md:px-0 pt-2">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
