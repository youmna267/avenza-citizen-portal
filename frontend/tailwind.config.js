/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /* Government blue scale */
        gov: {
          950: '#040d1c',
          900: '#0d2d5e',   /* sidebar / dark headings */
          800: '#163d7a',
          700: '#1a4d96',
          600: '#1a56a0',   /* primary accent */
          500: '#2a6ab5',
          400: '#4a90d9',
          300: '#7ab4e8',
          200: '#b0d4f4',
          100: '#dceaf8',
          50:  '#eef4fc',   /* page background */
        },
        /* CSS-variable-backed semantic tokens */
        bg:               'var(--color-bg)',
        surface:          'var(--color-surface)',
        'surface-alt':    'var(--color-surface-alt)',
        border:           'var(--color-border)',
        ink:              'var(--color-text)',
        'ink-muted':      'var(--color-text-muted)',
        sidebar:          'var(--color-sidebar)',
        'sidebar-text':   'var(--color-sidebar-text)',
        'sidebar-active': 'var(--color-sidebar-active)',
        accent:           'var(--color-accent)',
        'accent-hover':   'var(--color-accent-hover)',
        btn:              'var(--color-btn)',
        'btn-hover':      'var(--color-btn-hover)',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};
