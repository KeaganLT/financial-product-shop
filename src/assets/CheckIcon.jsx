export default function CheckIcon({ width = 32, height = 32, color = '#1C1C1C' }) {
    return (
        <svg width={width} height={height} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M26.0979 8.3315C26.6051 8.79976 26.6368 9.59058 26.1685 10.0979L14.1685 23.0979C13.9319 23.3542 13.5989 23.5 13.25 23.5C12.9011 23.5 12.5681 23.3542 12.3315 23.0979L6.3315 16.5979C5.86325 16.0906 5.89488 15.2998 6.40216 14.8315C6.90943 14.3632 7.70026 14.3949 8.16851 14.9022L13.25 20.4071L24.3315 8.40216C24.7998 7.89488 25.5906 7.86325 26.0979 8.3315Z" fill={color} />
        </svg>
    );
}