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
        <div className="flex gap-2 overflow-x-auto scroll-smooth px-6 pb-5 no-scrollbar">
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
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                    />

                    <div className="absolute inset-0 flex flex-col justify-end py-4 px-6 gap-2.5">
                        <span
                            className="self-start inline-block"
                            style={{
                                backgroundColor: '#1AAFDE',
                                borderRadius: '4px',
                                color: '#F2F2F7',
                                fontSize: '11px',
                                lineHeight: '14px',
                                letterSpacing: '0.41px',
                                padding: '2px 6px',
                            }}
                        >
              {slide.tag}
            </span>

                        <p
                            style={{
                                color: '#F2F2F7',
                                fontSize: '17px',
                                fontWeight: 600,
                                lineHeight: '22px',
                                letterSpacing: '0.0035em',
                            }}
                        >
                            {slide.title}
                        </p>

                        <div className="flex items-center justify-between">
                            <p
                                style={{
                                    color: '#F2F2F7',
                                    fontSize: '13px',
                                    lineHeight: '18px',
                                    letterSpacing: '0.41px',
                                }}
                            >
                                {slide.subtitle}
                            </p>
                            <button
                                className="flex items-center justify-center"
                                style={{
                                    height: '25px',
                                    width: '86px',
                                    color: '#F2F2F7',
                                    border: '0.5px solid #F2F2F7',
                                    borderRadius: '14px',
                                    fontSize: '13px',
                                    lineHeight: '18px',
                                    letterSpacing: '0.41px',
                                    textAlign: 'center',
                                }}
                            >
                                {slide.buttonLabel}
                            </button>
                        </div>
                    </div>
                </div>
            ))}

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