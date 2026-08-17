/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas:     'var(--canvas)',
        'surface-0':'var(--surface-0)',
        'surface-1':'var(--surface-1)',
        'surface-2':'var(--surface-2)',
        'surface-3':'var(--surface-3)',
        'surface-4':'var(--surface-4)',
        hairline: {
          DEFAULT: 'var(--hairline)',
          strong:  'var(--hairline-strong)',
          focus:   'var(--hairline-focus)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          light:   'var(--primary-light)',
          glow:    'var(--primary-glow)',
          bg:      'var(--primary-bg)',
        },
        'on-primary': 'var(--on-primary)',
        ink: {
          DEFAULT: 'var(--ink)',
          muted:   'var(--ink-muted)',
          subtle:  'var(--ink-subtle)',
          ghost:   'var(--ink-ghost)',
        },
        success: {
          DEFAULT: 'var(--success)',
          bg:      'var(--success-bg)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          bg:      'var(--warning-bg)',
        },
        error: {
          DEFAULT: 'var(--error)',
          bg:      'var(--error-bg)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        xs:   'var(--r-xs)',
        sm:   'var(--r-sm)',
        md:   'var(--r-md)',
        lg:   'var(--r-lg)',
        xl:   'var(--r-xl)',
        '2xl':'var(--r-2xl)',
        pill: 'var(--r-pill)',
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter:  '-0.03em',
        tight:    '-0.02em',
        loose:    '0.04em',
        loosest:  '0.07em',
      },
      boxShadow: {
        sm:   'var(--shadow-sm)',
        md:   'var(--shadow-md)',
        lg:   'var(--shadow-lg)',
        xl:   'var(--shadow-xl)',
        glow: 'var(--shadow-glow)',
      },
      animation: {
        'fade-up':  'fadeUp 0.35s ease both',
        'fade-in':  'fadeIn 0.25s ease both',
        'spin-fast':'spin 0.8s linear infinite',
        shimmer:    'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(12px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to':   { opacity: '1' },
        },
        shimmer: {
          '0%':   { 'background-position': '-200% 0' },
          '100%': { 'background-position':  '200% 0' },
        },
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-grid': '28px 28px',
      },
    },
  },
  plugins: [],
}
