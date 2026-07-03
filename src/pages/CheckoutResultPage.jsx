import { useLocation, useNavigate } from 'react-router-dom';

export default function CheckoutResultPage() {
    const navigate = useNavigate();
    const { state } = useLocation();

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <div className="flex items-center px-1 bg-white" style={{ height: 64, borderBottom: '1px solid #E5E5EA' }}>
                <div className="max-w-[411px] mx-auto w-full flex items-center gap-1">
                    <div className="w-12" />
                    <h1
                        className="flex-1"
                        style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 400, lineHeight: '28px', letterSpacing: '0.35px', color: '#1D1B20' }}
                    >
                        Order summary
                    </h1>
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 max-w-[411px] mx-auto w-full px-6 flex flex-col items-center justify-center gap-6 pb-20">
                {/* Green checkmark */}
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="60" r="60" fill="#168C34" />
                    <path
                        d="M36 62l18 18 30-36"
                        stroke="white"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>

                <p
                    className="text-center text-black"
                    style={{ fontFamily: 'Roboto, sans-serif', fontSize: 20, fontWeight: 700, lineHeight: '28px', letterSpacing: '0.35px' }}
                >
                    Thank you for your order.
                </p>
            </main>

            {/* Footer button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white" style={{ borderTop: '1px solid #E5E5EA' }}>
                <div className="max-w-[411px] mx-auto px-7 pt-4 pb-6">
                    <button
                        onClick={() => navigate('/products')}
                        className="w-full h-[42px] rounded-[100px] font-semibold text-white"
                        style={{
                            background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)',
                            fontSize: 17,
                            letterSpacing: '0.0035em',
                            fontFamily: 'Roboto, sans-serif',
                        }}
                    >
                        Continue browsing
                    </button>
                </div>
            </div>
        </div>
    );
}
