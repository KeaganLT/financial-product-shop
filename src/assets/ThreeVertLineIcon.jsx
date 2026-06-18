export default function ThreeVertLinesIcon({ width = 15, height = 15, color = '#8E8E93' }) {
    return (
        <svg width={width} height={height} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 0.5C1 0.223858 1.22386 0 1.5 0C1.77614 0 2 0.223858 2 0.5V14.5C2 14.7761 1.77614 15 1.5 15C1.22386 15 1 14.7761 1 14.5V0.5Z" fill={color} />
            <path d="M7 0.5C7 0.223858 7.22386 0 7.5 0C7.77614 0 8 0.223858 8 0.5V14.5C8 14.7761 7.77614 15 7.5 15C7.22386 15 7 14.7761 7 14.5V0.5Z" fill={color} />
            <path d="M13 0.5C13 0.223858 13.2239 0 13.5 0C13.7761 0 14 0.223858 14 0.5V14.5C14 14.7761 13.7761 15 13.5 15C13.2239 15 13 14.7761 13 14.5V0.5Z" fill={color} />
        </svg>
    );
}