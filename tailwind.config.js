/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Map theme CSS variables into Tailwind color names so we can
           gradually swap existing classes to the new palette without
           changing every file. These resolve at runtime to the CSS vars. */
        primary: 'var(--color-primary)',
        'primary-600': 'var(--color-primary-600)',
        accent: 'var(--color-accent)',
        surface: 'var(--color-surface)',
        'bg-1': 'var(--color-bg-1)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',
      },
      keyframes: {
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        gradientShift: 'gradientShift 10s ease infinite',
        float: 'float 3s ease-in-out infinite',
        fadeInUp: 'fadeInUp 900ms ease both',
        fadeInUpDelayed: 'fadeInUp 900ms ease 120ms both',
        fadeIn: 'fadeIn 1.2s ease 500ms both',
      },
      backgroundImage: {
        gradientLanding: 'linear-gradient(120deg, #2a0f24ff, #3b1e2aff)',
        markRadial: 'radial-gradient(circle at 50% 50%, #bb0d0dff, transparent 65%)',
      },
      dropShadow: {
        mark: '0 6px 16px rgba(194, 5, 5, 0.4)',
      },
    },
  },
  plugins: [],
}


