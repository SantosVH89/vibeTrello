/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        tinta: '#102033',
        linea: '#d5e0ee',
        fondo: '#f3f7fb',
        acento: '#2563eb'
      }
    }
  },
  plugins: []
};
