module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        apricot: {
          100: '#FFE8D6',
          200: '#FFD1B7',
          300: '#FFB38A',
          400: '#FF946B',
          500: '#FF7B4A',
          600: '#FF5E2E',
          700: '#E8491D',
        },
        warm: {
          100: '#FFF5EB',
          200: '#FFEBD6',
          300: '#FFDFBF',
        }
      },
      fontFamily: {
        parisienne: ['"Parisienne"', 'cursive'],
        cormorant: ['"Cormorant Garamond"', 'serif']
      },
      backgroundImage: {
        'gradient-apricot': 'linear-gradient(to bottom right, #FFE8D6, #FFB38A)',
      }
    },
  },
  plugins: [],
};
