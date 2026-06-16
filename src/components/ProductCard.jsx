import { useNavigate } from 'react-router-dom';

// Matches Figma product card spec:
// - White background, rounded corners
// - Image fills top portion
// - Optional "25% OFF" badge: #1AAFDE bg, border-radius 4, white text
// - Product title: black, bold, max 2 lines then truncate
// - Price: grey, "from R350 p/m" format

export default function ProductCard({ product, size = 'default' }) {
    const navigate = useNavigate();

    const cardWidth = size === 'small' ? 'w-[155px] min-w-[155px]' : 'w-full';
    const imgHeight = size === 'small' ? 'h-[120px]' : 'h-[150px]';

    const hasDiscount = product.discount || product.discountPercent;
    const discountLabel = product.discountPercent
        ? `${product.discountPercent}% OFF`
        : '25% OFF';

    return (
        <div
            className={`${cardWidth} bg-white rounded-xl overflow-hidden cursor-pointer flex flex-col`}
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
            onClick={() => navigate(`/products/${product.id}`)}
        >
            <div className={`relative ${imgHeight} w-full overflow-hidden`}>
                <img
                    src={product.imageUrl || 'https://placehold.co/300x150?text=No+Image'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
                {hasDiscount && (
                    <span
                        className="absolute top-2 left-2 text-white text-[10px] font-semibold px-1.5 py-0.5 leading-tight"
                        style={{ backgroundColor: '#1AAFDE', borderRadius: '4px' }}
                    >
            {discountLabel}
          </span>
                )}
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