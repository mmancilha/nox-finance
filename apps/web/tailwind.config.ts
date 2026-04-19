import type { Config } from 'tailwindcss';

/**
 * Tailwind do Nox — tokens da marca obrigatórios (.cursorrules).
 * NÃO adicione cores hex aqui fora do namespace `nox`.
 * NÃO use fontes diferentes de DM Sans.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nox: {
          bg: '#080808',
          bg2: '#101010',
          bg3: '#181818',
          txt: '#F5F5F7',
          txt2: '#A1A1A6',
          txt3: '#6C6C70',
          accent: '#F07854',
          green: '#30D158',
          red: '#FF453A',
          border: '#222222',
          border2: '#161616',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Escala final do PLANO_DESENVOLVIMENTO.md
        hero: ['72px', { lineHeight: '0.95', letterSpacing: '-0.04em', fontWeight: '800' }],
        h1: ['48px', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '800' }],
        h2: ['36px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
        h3: ['22px', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '700' }],
        body: ['16px', { lineHeight: '1.65', fontWeight: '300' }],
        caption: ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        label: ['11px', { lineHeight: '1.3', letterSpacing: '0.12em', fontWeight: '500' }],
      },
      borderRadius: {
        pill: '50px',
      },
      backdropBlur: {
        nav: '28px',
      },
      boxShadow: {
        nav: '0 8px 40px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse at center, rgba(240,120,84,0.08), transparent 60%)',
      },
    },
  },
  plugins: [],
};

export default config;
