/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors:{
        'input-label':"#518BA7",
        "tl-dark":"#001F27",
        "tl-primary":"#8BE8E5",
        "tl-primary-medium":"#31B7BC",
        "tl-primary-opaque":"#F2FFFE",
        "tl-dark-light":"#49454F",
        "tl-dark-medium":"#71787E",
        "tl-gray":"#DDE3EA",
        "tl-gray-medium":"#60757C",
        "tl-light":"#F9FDFF",
        "tl-warning":"#FFB959",
        "tl-light-opaque":"#F6FAFF",
        "tl-crayola":"#313B3F",
        "tl-silver":"#8B9198",
        "tl-light-silver":"#D9D9D9",
        "tl-gray-lavender":"#CAC4D0",
        "tl-dark-gray":"#41474D",
        "tl-dark-transparent":"#001F271F",
        "tl-bagde-chat-date": "#DEECF3",
        "tl-error":"#D34C67",
        "tl-blue":"#075A81",
        "tl-blue-light":"#DFEDF2",
        "tl-blue-water":"#D4F4F2",
        "tl-gray-border":"#A7A7A8",
        "tl-dark-2":"#A7A7A8"
      },
      borderColor:{
        'input-border':"#518BA7",
        "tl-dark":"#001F27",
        "tl-primary-medium":"#31B7BC",
        "tl-primary":"#8BE8E5",
        "tl-dark-light":"#49454F",
        "tl-dark-medium":"#71787E"
      },
      fontSize:{
        "base-2": ["15px", "20px"],
        "base-3": ["17px", "22px"],
        "3.5xl": ["32px", "38px"]
      }
    }
  },
  plugins: [],
}
