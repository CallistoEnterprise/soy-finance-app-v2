import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        flicker1: {
          "0%": {opacity: "0.3"},
          "25%": {opacity: "1"},
          "50%, 100%": {opacity: "0.3"}
        },
        flicker2: {
          "0%, 25%": {opacity: "0.3"},
          "50%": {opacity: "1"},
          "75%, 100%": {opacity: "0.3"}
        },
        flicker3: {
          "0%, 50%": {opacity: "0.3"},
          "75%": {opacity: "1"},
          "100%": {opacity: "0.3"}
        },

      },
      animation: {
        flicker1: "flicker1 ease-in 1.5s infinite",
        flicker2: "flicker2 ease-in 1.5s infinite",
        flicker3: "flicker3 ease-in 1.5s infinite"
      },
      gridTemplateAreas: {
        'farms': [
          'search search',
          'staked sorting'
        ],
      },
      backgroundImage: {
        global: "linear-gradient(311.09deg, #F5F3FC 0%, #F8FAFF 52.68%, #F6FDEF 99%)",
        'global-dark': "linear-gradient(0deg, #101010 0%, #101010 100%)",
        'empty-state': "linear-gradient(0deg, #353535 0%, #353535 100%)",
        "farms-slider-0": "linear-gradient(91.78deg, #C8E6E4 0%, #FBF3CC 43.38%, #FFBDAA 100%)",
        "farms-slider-1": "linear-gradient(90.76deg, #FDE5BD -1.83%, #F6F2FF 43.75%, #CDEFFF 100%)",
        "farms-slider-2": "linear-gradient(90.76deg, #F4D5DC -1.83%, #FDEDAD 43.75%, #BBE6A7 100%)",
        "farms-slider-3": "linear-gradient(90.76deg, #D0F0FF 24.06%, #F1D0F4 67.33%, #D1EEFE 96%)",
      },
      gridTemplateRows: {
        layout: "auto 1fr auto"
      },
      gridTemplateColumns: {
        content: "1fr 453px",
        history: "194fr 94fr 147fr 185fr 137fr 72fr",
        farm: "220px 90px 1fr 210px 1fr 120px 30px",
        roi: "90px 110px 1fr",
        'svg-end': "1fr 24px",
      },
      borderWidth: {
        '2.5': "10px"
      }
    },
    screens: {
      'xs': "450px",
      'sm': "600px",
      'md': "768px",
      'lg': "1024px",
      'xl': "1366px",
      "2xl": "1920px"
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',

      'primary-bg': 'rgb(var(--primary-bg) / <alpha-value>)',
      'secondary-bg': 'rgb(var(--secondary-bg) / <alpha-value>)',

      'primary-text': 'rgb(var(--primary-text) / <alpha-value>)',
      'secondary-text': 'rgb(var(--secondary-text) / <alpha-value>)',

      'primary-border': 'rgb(var(--primary-border) / <alpha-value>)',
      'active-border': 'rgb(var(--active-border) / <alpha-value>)',

      'green': 'rgb(var(--green) / <alpha-value>)',
      'violet': 'rgb(var(--violet) / <alpha-value>)',
      'pink': 'rgb(var(--pink) / <alpha-value>)',
      'red': 'rgb(var(--red) / <alpha-value>)',
      'orange': 'rgb(var(--orange) / <alpha-value>)',
      'blue': 'rgb(var(--blue) / <alpha-value>)',
      'black': '#000000',
      'white': "#FFFFFF",

      'green-saturated': 'rgb(var(--green-saturated) / <alpha-value>)',
      'grey-light': 'rgb(var(--grey-light) / <alpha-value>)',

      'primary-hover': 'rgb(var(--primary-hover) / <alpha-value>)',
      'secondary-hover': 'rgb(var(--secondary-hover) / <alpha-value>)'
    },
    spacing: {
      '0': '0px',
      '0.5': "2px",
      '1': '4px',
      '1.5': '6px',
      '2': '8px',
      '2.5': "10px",
      '3': '12px',
      '3.5': '14px',
      '4': '16px',
      '5': '20px',
      '5.5': '22px',
      '6': '24px',
      '7': '28px',
      '8': '32px',
      '9': '36px',
      '10': '40px',
      '11': '44px',
      '12': '48px'
    },
    borderRadius: {
      '0': '0px',
      '0.5': '2px',
      '1': '4px',
      '1.5': '6px',
      '2': '8px',
      '2.5': '10px',
      '3': '12px',
      '4': '16px',
      '5': '20px',
      '25': "100px",
      'full': '50%'
    },
    fontSize: {
      8: ['8px', '10px'],
      12: ['12px', '14px'],
      14: ['14px', '22px'],
      16: ['16px', '26px'],
      18: ['18px', '28px'],
      20: ['20px', '32px'],
      24: ['24px', '32px'],
      28: ['28px', '32px'],
      32: ['32px', '32px']
    }
  },
  plugins: [
    require('@savvywombat/tailwindcss-grid-areas')
  ],
}
export default config
