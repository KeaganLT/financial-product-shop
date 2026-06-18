import LogoMark from './LogoMark.jsx';
import backgroundImage from '../assets/background.jpg';

export default function SplashScreen({ isVisible, fadeMs = 400 }) {
    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-opacity"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: isVisible ? 1 : 0,
                pointerEvents: isVisible ? 'auto' : 'none',
                transitionDuration: `${fadeMs}ms`,
            }}
        >
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(180deg, rgba(24, 96, 191, 0.7) 0%, rgba(26, 174, 221, 0.7) 100%)',
                    mixBlendMode: 'darken',
                }}
            />

            <div className="relative flex flex-col items-center gap-4">
                <LogoMark size={64} className="brightness-0 invert" />
                <p className="text-[16px] text-white" style={{ letterSpacing: '0.07em' }}>
                    InsureTech<strong className="font-bold">Guard</strong>
                </p>
            </div>
        </div>
    );
}