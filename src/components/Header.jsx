import Logo from './Logo';

export default function Header() {
    return (
        <header
            className="fixed top-0 left-0 right-0 z-50"
            style={{ backgroundColor: 'var(--neutral-100)', borderBottom: '1px solid var(--neutral-300)' }}
        >
            <div
                className="max-w-[411px] mx-auto relative flex items-center justify-center px-6"
                style={{ height: '64px' }}
            >
                <div className="flex items-center gap-2">
                    <Logo size="sm" className="w-8 h-8" />
                    <span
                        style={{
                            fontSize: '17px',
                            fontWeight: 600,
                            lineHeight: '22px',
                            color: '#000000',
                            letterSpacing: '0.0035em',
                        }}
                    >
            InsureTech<strong>Guard</strong>
          </span>
                </div>
            </div>
        </header>
    );
}