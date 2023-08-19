/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["public/*.{html,js}"],
    theme: {
      extend: {
        fontFamily: {
            'lexend': ["Lexend, sans-serif"]
        },
        colors: {
            'white': '#fff',
            'black': '#000',
            'EV-dark-gray': '#BABABA',
            'EV-purple': '#BD74C9',
            'EV-green': '#74C996',
            'EV-black': '#202020',
            'EV-gray': '#E0DADA',
        },
      },
    },
    plugins: [],
  }