import { useNavigate } from 'react-router-dom';
import { getProductPlaceholder } from '../assets/placeholders/index.js';

export default function ProductCard({ product, size = 'default' }) {
    const navigate = useNavigate();

    const cardWidth  = size === 'small' ? 'w-[155px] min-w-[155px]' : 'w-full';
    const imgHeight  = size === 'small' ? 'h-[120px]' : size === 'grid' ? '' : 'h-[150px]';
    const imgClasses = size === 'grid' ? 'aspect-square' : imgHeight;

    return (
        <div
            className={`${cardWidth} rounded-xl overflow-hidden cursor-pointer flex flex-col transition-all duration-150`}
            style={{
                backgroundColor: 'var(--neutral-100)',
                border: '1px solid var(--neutral-300)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
            onClick={() => navigate(`/products/${product.id}`)}
        >
            <div className={`relative w-full overflow-hidden ${imgClasses}`}>
                <img
                    src={product.imageUrl || getProductPlaceholder(product.name)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-3 flex flex-col gap-0.5">
                <p
                    className="text-[13px] font-semibold text-black leading-tight"
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {product.name}
                </p>
                <p className="text-[11px] text-gray-400">
                    from R{Number(product.price).toFixed(0)} p/m
                </p>
            </div>
        </div>
    );
}