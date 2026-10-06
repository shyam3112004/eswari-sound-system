import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0B0B0F', raised: '#131318' },
        amber: { DEFAULT: '#FFB11A', soft: '#C9A86A' },
        haze: '#38BDF8',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: { card: '16px', pill: '999px' },
    },
  },
  plugins: [],
};
export default config;
