import { useNavigate } from 'react-router-dom';
import { getProductPlaceholder } from '../../assets/placeholders/index.js';

export default function RelatedProducts({ products }) {
    const navigate = useNavigate();

    if (!products.length) return null;

    return (
        <div className="flex flex-col gap-4 pb-2">
            <h3
                style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '20px',
                    fontWeight: 700,
                    lineHeight: '28px',
                    letterSpacing: '0.35px',
                    color: '#000000',
                }}
            >
                Related product
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-5 no-scrollbar -mx-6 px-6">
                {products.map((related) => (
                    <button
                        key={related.id}
                        onClick={() => navigate(`/products/${related.id}`)}
                        className="flex-shrink-0 text-left"
                        style={{
                            width: '284px',
                            height: '192px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #C7C7CC',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                        }}
                    >
                        <div
                            className="w-full overflow-hidden"
                            style={{ height: '120px', borderRadius: '8px', backgroundColor: '#D9D9D9' }}
                        >
                            <img
                                src={related.imageUrl || getProductPlaceholder(related.name)}
                                alt={related.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col gap-0">
                            <p
                                className="truncate"
                                style={{
                                    fontFamily: 'Roboto, sans-serif',
                                    fontSize: '17px',
                                    fontWeight: 600,
                                    lineHeight: '22px',
                                    letterSpacing: '0.0035em',
                                    color: '#000000',
                                }}
                            >
                                {related.name}
                            </p>
                            <p
                                style={{
                                    fontFamily: 'Roboto, sans-serif',
                                    fontSize: '13px',
                                    fontWeight: 400,
                                    lineHeight: '18px',
                                    letterSpacing: '0.41px',
                                    color: '#8E8E93',
                                }}
                            >
                                from R{Number(related.price).toFixed(0)} p/m
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
