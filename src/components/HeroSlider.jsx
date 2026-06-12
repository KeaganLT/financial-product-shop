// Matches Figma hero slider spec:
// - Dark cards: #1C1C1C background, border-radius 28
// - Padding 16px inside card
// - Item spacing 8px between cards
// - Padding left/right 26px from screen edge
// - Offer tag: #1AAFDE, border-radius 4
// - Title: #F2F2F7, Body 15/Semibold
// - Subtitle: #F2F2F7, Tagline 11
// - Button: border 0.5, border-radius 14, text #F2F2F7, Tagline 13

const slides = [
    {
        id: 1,
        tag: '25% off',
        title: 'All Mobile Device Contracts',
        subtitle: 'Various models available',
        buttonLabel: 'View offers',
        image: 'https://placehold.co/300x161/1C1C1C/ffffff?text=Devices',
    },
    {
        id: 2,
        tag: '10% off',
        title: 'Short-Term Investment',
        subtitle: 'Start from R2,500 p/m',
        buttonLabel: 'View offers',
        image: 'https://placehold.co/56x193/888/ffffff?text=+',
    },
];

export default function HeroSlider() {
    return (
        // Horizontal scroll container — matches Figma slider wrapper
        // padding-left 26px, item spacing 8px, padding-bottom 20px
        <div className="flex gap-2 overflow-x-auto scroll-smooth px-[26px] pb-5 no-scrollbar">
            {slides.map((slide) => (
                <div
                    key={slide.id}
                    className="relative flex-shrink-0 overflow-hidden"
                    style={{
                        width: '300px',
                        height: '193px',
                        backgroundColor: '#1C1C1C',
                        borderRadius: '28px',
                    }}
                >
                    {/* Background image */}
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                    />

                    {/* Content overlay — padding 16px, item-spacing 8px, bottom-left aligned */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 gap-2">
                        {/* Offer tag — #1AAFDE, border-radius 4 */}
                        <span
                            className="self-start text-white text-[10px] font-semibold px-1.5 py-0.5"
                            style={{ backgroundColor: '#1AAFDE', borderRadius: '4px' }}
                        >
              {slide.tag}
            </span>

                        {/* Title — #F2F2F7, semibold, Body 15 */}
                        <p className="text-[15px] font-semibold leading-tight" style={{ color: '#F2F2F7' }}>
                            {slide.title}
                        </p>

                        {/* Subtitle + button row */}
                        <div className="flex items-center justify-between">
                            <p className="text-[11px]" style={{ color: '#F2F2F7' }}>
                                {slide.subtitle}
                            </p>
                            {/* Button — border 0.5, border-radius 14 */}
                            <button
                                className="text-[13px] px-3 py-1"
                                style={{
                                    color: '#F2F2F7',
                                    border: '0.5px solid #F2F2F7',
                                    borderRadius: '14px',
                                }}
                            >
                                {slide.buttonLabel}
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Narrow peek card — matches Figma second partial card visible on right */}
            <div
                className="flex-shrink-0"
                style={{
                    width: '56px',
                    height: '193px',
                    backgroundColor: '#1C1C1C',
                    borderRadius: '28px',
                    opacity: 0.5,
                }}
            />
        </div>
    );
}