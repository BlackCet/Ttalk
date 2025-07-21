
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
       'pastel-cream': '#FFF2E0',  // FFF2E0
        'lavender-blue': '#C0C9EE', // C0C9EE
        'slate-blue': '#A2AADB',    // A2AADB
        'deep-purple': '#898AC4',   // 898AC4
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],

  daisyui: {
    themes: ["light"], 
    base: true,
    styled: true,
    utils: true,
    logs: true,
  },
}