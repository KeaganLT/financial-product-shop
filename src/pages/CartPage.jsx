import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartIcon from '../assets/CartIcon';

const EmptyCartIllustration = ({ itemCount = 0 }) => (
    <div className="relative flex items-center justify-center w-[183px] h-[141px] mx-auto">
        <div
            className="absolute inset-0 m-auto rounded-full"
            style={{
                width: 133,
                height: 133,
                border: '8px solid #F2F2F7',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            }}
        />
        <div
            className="absolute rounded-full bg-white flex items-center justify-center"
            style={{
                width: 104,
                height: 104,
                border: '2px solid #1860BF',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            }}
        >
            <CartIcon size={38} color="#1860BF" />
        </div>

        <div className="absolute" style={{ left: 0, top: 106 }}>
            <div className="rounded-full mb-[6px]" style={{ width: 25, height: 2, background: '#E5E5EA' }} />
            <div className="rounded-full mb-[6px]" style={{ width: 19, height: 2, background: '#E5E5EA' }} />
            <div className="rounded-full" style={{ width: 5, height: 2, background: '#E5E5EA' }} />
        </div>

        <div className="absolute" style={{ right: 0, top: 27 }}>
            <div className="rounded-full mb-[6px]" style={{ width: 21, height: 2, background: '#E5E5EA' }} />
            <div className="rounded-full mb-[6px]" style={{ width: 25, height: 2, background: '#E5E5EA' }} />
            <div className="rounded-full" style={{ width: 10, height: 2, background: '#E5E5EA' }} />
        </div>

        <div
            className="absolute flex items-center justify-center rounded-full bg-[#E5E5EA] text-white font-semibold"
            style={{
                width: 35,
                height: 35,
                top: 0,
                right: 0,
                fontSize: 13,
                border: '3px solid white',
                color: '#8E8E93',
            }}
        >
            {itemCount}
        </div>
    </div>
);

const CartItemCard = ({ product, onRemove }) => (
    <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-[#E5E5EA]">
        <div className="w-12 h-12 rounded-xl bg-[#EBF3FF] flex items-center justify-center flex-shrink-0">
            <CartIcon size={22} color="#1860BF" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1C2435] text-sm leading-tight truncate">{product.name}</p>
            <p className="text-xs text-[#8E8E93] mt-0.5">{product.type ?? 'Insurance product'}</p>
        </div>
        <button
            onClick={() => onRemove(product.id)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
            aria-label={`Remove ${product.name}`}
        >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="#FF3B30" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        </button>
    </div>
);

export default function CartPage() {
    const navigate = useNavigate();
    const { items, removeItem } = useCart();
    const isEmpty = items.length === 0;

    function handleCheckout() {
        navigate('/checkout');
    }

    return (
        <div className="min-h-screen bg-[#F2F2F7] flex flex-col">

            <header
                className="sticky top-0 z-10 flex items-center px-4 pt-14 pb-3"
                style={{ background: 'rgba(248,248,248,0.92)', backdropFilter: 'blur(7.5px)', borderBottom: '1px solid #E5E5EA' }}
            >
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 flex items-center justify-center -ml-1"
                    aria-label="Go back"
                >
                    <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
                        <path d="M9 1L1 9l8 8" stroke="#1860BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <h1 className="flex-1 text-center font-semibold text-[17px] text-black tracking-[-0.41px]">Cart</h1>
                <div className="w-8" />
            </header>

            <main className="flex-1 flex flex-col px-5 pb-36">
                {isEmpty ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-10">
                        <div className="flex flex-col items-center gap-5">
                            <EmptyCartIllustration itemCount={0} />
                            <p
                                className="font-bold text-[20px] text-[#1C1C1C] tracking-[0.35px]"
                                style={{ fontFamily: 'SF Pro Display, -apple-system, sans-serif' }}
                            >
                                Your cart is empty
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/products')}
                            className="w-full max-w-[334px] h-[50px] rounded-[14px] font-semibold text-[17px] text-white flex items-center justify-center tracking-[0.0035em]"
                            style={{
                                background: 'linear-gradient(89.03deg, #185FBE 21.81%, #1AC3E5 117.86%)',
                                fontFamily: 'SF Pro Display, -apple-system, sans-serif',
                            }}
                        >
                            Continue browsing
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 pt-6">
                        <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wide px-1 mb-1">
                            {items.length} {items.length === 1 ? 'item' : 'items'}
                        </p>

                        {items.map((item) => (
                            <CartItemCard key={item.id} product={item} onRemove={removeItem} />
                        ))}

                        <div className="h-px bg-[#E5E5EA] my-2" />

                        <div className="bg-white rounded-2xl p-4 border border-[#E5E5EA]">
                            <div className="flex justify-between text-sm text-[#1C2435]">
                                <span className="text-[#8E8E93]">Products selected</span>
                                <span className="font-semibold">{items.length}</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {!isEmpty && (
                <div
                    className="fixed bottom-[83px] left-0 right-0 px-5 pb-4 pt-3"
                    style={{ background: 'rgba(248,248,248,0.95)', borderTop: '1px solid #E5E5EA', backdropFilter: 'blur(7.5px)' }}
                >
                    <button
                        onClick={handleCheckout}
                        className="w-full h-[50px] rounded-[14px] font-semibold text-[17px] text-white flex items-center justify-center tracking-[0.0035em]"
                        style={{
                            background: 'linear-gradient(89.03deg, #185FBE 21.81%, #1AC3E5 117.86%)',
                            fontFamily: 'SF Pro Display, -apple-system, sans-serif',
                        }}
                    >
                        Proceed to checkout
                    </button>
                </div>
            )}
        </div>
    );
}
