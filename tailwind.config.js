module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#fff7f0',
          100: '#ffebd5',
          200: '#ffd4a8',
          300: '#ffb570',
          400: '#ff8c3a',
          500: '#ff6b1a',
          600: '#f04e16',
          700: '#c7350f',
          800: '#9e2b10',
          900: '#7f2611',
        },
        brown: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#5c3d1f',
        },
        primary: {
          DEFAULT: '#e67e22',
          light: '#f39c12',
          dark: '#d35400',
        },
        background: {
          light: '#FFE8D6',
          DEFAULT: '#FFB38A',
          gradient: 'linear-gradient(135deg, #FFE8D6 0%, #FFB38A 100%)',
        },
      },
      fontFamily: {
        parisienne: ['"Parisienne"', 'cursive'],
        cormorant: ['"Cormorant Garamond"', 'serif']
      },
      backgroundImage: {
        'gradient-bg': 'linear-gradient(135deg, #FFE8D6 0%, #FFB38A 100%)',
        'gradient-button': 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
      },
      boxShadow: {
        'card': '0 15px 40px rgba(0, 0, 0, 0.1)',
        'button': '0 4px 15px rgba(230, 126, 34, 0.4)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
