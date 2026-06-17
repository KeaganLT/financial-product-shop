import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product, size = 'default' }) {
    const navigate = useNavigate();

    const cardWidth  = size === 'small' ? 'w-[155px] min-w-[155px]' : 'w-full';
    const imgHeight  = size === 'small' ? 'h-[120px]' : size === 'grid' ? '' : 'h-[150px]';
    const imgClasses = size === 'grid' ? 'aspect-square' : imgHeight;

    return (
        <div
            className={`${cardWidth} bg-white rounded-xl overflow-hidden cursor-pointer flex flex-col`}
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
            onClick={() => navigate(`/products/${product.id}`)}
        >
            <div className={`relative w-full overflow-hidden ${imgClasses}`}>
                <img
                    src={product.imageUrl || 'https://placehold.co/300x150?text=No+Image'}
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