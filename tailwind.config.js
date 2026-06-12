/** @type {import('tailwindcss').Config} */
export default {
    // Tell Tailwind where to look for class names
    // It scans these files and only includes the CSS classes you actually use
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}