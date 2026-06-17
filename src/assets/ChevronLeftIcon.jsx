export default function ChevronLeftIcon({ width = 32, height = 32, color = '#1C1C1C' }) {
    return (
        <svg width={width} height={height} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M19.5371 26.0827L10.2922 16.9458C9.90262 16.5612 9.90262 15.9398 10.2922 15.5542L19.5371 6.41733C20.0995 5.86089 21.0144 5.86089 21.5777 6.41733C22.14 6.97378 22.14 7.87687 21.5777 8.43332L13.6691 16.2505L21.5777 24.0657C22.14 24.6231 22.14 25.5262 21.5777 26.0827C21.0144 26.6391 20.0995 26.6391 19.5371 26.0827Z" fill={color} />
        </svg>
    );
}