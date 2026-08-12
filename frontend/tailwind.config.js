/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#eef5f0',
          100: '#d3e6da',
          200: '#a6cdb5',
          300: '#79b390',
          400: '#4c9a6b',
          500: '#2f7d4f',
          600: '#1f6640',
          700: '#194f33',
          800: '#153f29',
          900: '#0f2e1e',
        },
        amber: {
          50: '#fdf6e8',
          100: '#faeac3',
          200: '#f5d585',
          300: '#f2a93b',
          400: '#e2932a',
          500: '#c67c1f',
        },
        clay: '#c0392b',
        paper: '#f2f5ef',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
