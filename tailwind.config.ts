import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hl: {
          bg: '#051E1C',        // фон
          surface: '#0B2E2C',   // панели/карточки
          border: '#12433F',    // бордеры
          primary: '#36D7B7',   // акцент
          success: '#6FFFB0',   // позитив / кнопка All / чекбокс
          danger: '#FF6F61',    // негатив / Clear
          muted: '#8AA3A0',     // вторичный текст
        },
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        card: '0 0 0 1px rgba(18,67,63,0.9), 0 8px 24px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
};
export default config;
