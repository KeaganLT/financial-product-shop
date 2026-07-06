import { useNavigate } from 'react-router-dom';

const FOOTER_LINKS = [
    {
        heading: 'Products',
        links: [
            { label: 'Insurance', path: '/products' },
            { label: 'Investments', path: '/products' },
            { label: 'Device Contracts', path: '/products' },
        ],
    },
    {
        heading: 'Account',
        links: [
            { label: 'My Account', path: '/account' },
            { label: 'Subscriptions', path: '/subscriptions' },
            { label: 'Cart', path: '/cart' },
        ],
    },
    {
        heading: 'Company',
        links: [
            { label: 'About Us', path: '/products' },
            { label: 'Contact', path: '/products' },
            { label: 'Privacy Policy', path: '/products' },
            { label: 'Terms of Service', path: '/products' },
        ],
    },
];

export default function Footer() {
    const navigate = useNavigate();

    return (
        <footer
            className="hidden md:block"
            style={{ backgroundColor: '#0F1B2D', color: '#FFFFFF' }}
        >
            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Top row: brand + link columns */}
                <div className="grid grid-cols-4 gap-8">
                    {/* Brand column */}
                    <div className="flex flex-col gap-4">
                        <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Roboto, sans-serif', color: '#FFFFFF' }}>
                            InsureTechGuard
                        </span>
                        <p style={{ fontSize: '13px', fontFamily: 'Roboto, sans-serif', color: '#8E9AAB', lineHeight: '20px' }}>
                            Your trusted partner for insurance, investments, and financial products.
                        </p>
                        <p style={{ fontSize: '12px', fontFamily: 'Roboto, sans-serif', color: '#5C6B7A' }}>
                            FSP Licence No. 12345
                        </p>
                    </div>

                    {/* Link columns */}
                    {FOOTER_LINKS.map((col) => (
                        <div key={col.heading} className="flex flex-col gap-3">
                            <h4 style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'Roboto, sans-serif', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                {col.heading}
                            </h4>
                            <ul className="flex flex-col gap-2">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <button
                                            onClick={() => navigate(link.path)}
                                            style={{ fontSize: '13px', fontFamily: 'Roboto, sans-serif', color: '#8E9AAB' }}
                                            className="hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: '#1E2D3D', marginTop: '48px', marginBottom: '24px' }} />

                {/* Bottom row */}
                <div className="flex items-center justify-between">
                    <p style={{ fontSize: '12px', fontFamily: 'Roboto, sans-serif', color: '#5C6B7A' }}>
                        © 2025 InsureTechGuard (Pty) Ltd. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        {['Privacy', 'Terms', 'Cookies'].map((item) => (
                            <button
                                key={item}
                                style={{ fontSize: '12px', fontFamily: 'Roboto, sans-serif', color: '#5C6B7A' }}
                                className="hover:text-white transition-colors"
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
