/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',

        // Or if using `src` directory:
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                orange: {
                    50: '#fe7216',
                },
                blue: {
                    50: '#08cec2',
                    60: '#09e8d9',
                    70: '#0affef',
                },
            },
        },
    },
    plugins: [],
}
