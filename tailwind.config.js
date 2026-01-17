/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        background: "var(--color-background)",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        hover: "var(--color-text-hover)",
      },
      fontFamily: {
        primary: "var(--font-primary)",
        secondary: "var(--font-secondary)",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      fontSize: {
        // Default xs is 0.75rem (12px)
        // Creating a new 'xxs' at 0.625rem (10px)
        'xxs': ['0.625rem', { lineHeight: '1rem' }],
        // Creating a 'micro' at 0.5rem (8px)
        'micro': ['0.5rem', { lineHeight: '0.75rem' }],
      },
    },
  },
  plugins: [],
}
