/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',
        secondary: '#3b82f6',
        accent: '#10b981',
        danger: '#ef4444',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
