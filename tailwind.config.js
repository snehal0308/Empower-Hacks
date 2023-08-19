/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./dist/*.{html,js}"],
    theme: {
      extend: {
        fontFamily: {
            'lexend': ["Lexend"]
        },
        colors: {
            'main': '#fff',
        },
      },
    },
    plugins: [],
  }