import type { Config } from 'tailwindcss';

/**
 * Design tokens — defined once, reused everywhere.
 *
 * Structure comes from whitespace + 1px hairlines, never from card boxes.
 * Amber is reserved for key numbers, prices, active states and primary CTAs.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0B0B0F', raised: '#131318' },
        amber: { DEFAULT: '#FFB11A', soft: '#C9A86A' },
        // Single 1px rule colour used for every divider on the site.
        hairline: 'rgba(255,255,255,0.12)',
        // Text ramp. `muted` is the WCAG AA floor on #0B0B0F (6.8:1) —
        // never go darker for anything that must be read.
        fg: { DEFAULT: '#F5F5F7', soft: '#B4B4BC', muted: '#9A9AA5' },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Tight line-height + negative tracking on display type,
        // comfortable 1.6+ on body copy.
        display: ['clamp(2.75rem, 6vw, 5.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        h1: ['clamp(2.25rem, 4vw, 3.75rem)', { lineHeight: '1.03', letterSpacing: '-0.025em' }],
        h2: ['clamp(1.75rem, 3vw, 2.75rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        h3: ['clamp(1.375rem, 2vw, 2rem)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        h4: ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.6' }],
        body: ['0.9375rem', { lineHeight: '1.65' }],
        small: ['0.8125rem', { lineHeight: '1.6' }],
        label: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.18em' }],
        spec: ['0.75rem', { lineHeight: '1.55' }],
      },
      maxWidth: {
        // ~65–70ch reading measure for body copy.
        measure: '68ch',
        page: '84rem',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
export default config;
