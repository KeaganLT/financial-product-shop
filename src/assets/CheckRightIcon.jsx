export default function ChevronRightIcon({ width = 32, height = 32, color = '#1C1C1C' }) {
    return (
        <svg width={width} height={height} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M12.4629 26.0827L21.7078 16.9458C22.0974 16.5612 22.0974 15.9398 21.7078 15.5542L12.4629 6.41733C11.9005 5.86089 10.9856 5.86089 10.4223 6.41733C9.85997 6.97378 9.85997 7.87687 10.4223 8.43332L18.3309 16.2505L10.4223 24.0657C9.85997 24.6231 9.85997 25.5262 10.4223 26.0827C10.9856 26.6391 11.9005 26.6391 12.4629 26.0827Z" fill={color} />
        </svg>
    );
}