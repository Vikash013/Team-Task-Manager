/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17211c',
        mist: '#f4f7f5',
        line: '#dbe5dd',
        pine: '#1f6f54',
        coral: '#c75146',
        gold: '#b98921'
      },
      boxShadow: {
        soft: '0 18px 50px rgba(23, 33, 28, 0.08)'
      }
    }
  },
  plugins: []
};
