module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inknut: ['"Inknut Antiqua"', 'serif'],
      },
      colors: {
        'sour-lavender': '#cba6f7',
        'sour-lavender-light': '#e3d6fa',
        'sour-plum': '#4b006e',
        'sour-gradient-from': '#b266ff',
        'sour-gradient-to': '#8a2be2',
      },
      boxShadow: {
        'sour-neon': '0 0 16px 2px #cba6f7aa',
      },
    },
  },
  plugins: [],
}; 