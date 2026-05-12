/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#0f1117',
        surface: '#13161f',
        elevated: '#1e2130',
        card: 'rgba(255,255,255,0.04)',
        accent: '#6c63ff',
        'accent-light': '#8b85ff',
        'accent-muted': 'rgba(108,99,255,0.15)',
        'border-subtle': 'rgba(255,255,255,0.06)',
        'border-default': 'rgba(255,255,255,0.08)',
        'text-primary': '#f0f0f0',
        'text-secondary': 'rgba(255,255,255,0.5)',
        'text-muted': 'rgba(255,255,255,0.25)',
        online: '#22c55e',
        green: '#22c55e',
        red: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'bubble': '20px',
        'card': '16px',
        'xl2': '20px',
        'xl3': '24px',
      },
      boxShadow: {
        'accent': '0 4px 15px rgba(108,99,255,0.4)',
        'accent-lg': '0 6px 25px rgba(108,99,255,0.5)',
        'glass': '0 8px 32px rgba(0,0,0,0.3)',
        'card': '0 25px 50px rgba(0,0,0,0.5)',
      },
      keyframes: {
        messageIn: {
          from: { opacity: 0, transform: 'translateY(10px) scale(0.97)' },
          to: { opacity: 1, transform: 'translateY(0) scale(1)' }
        },
        typingBounce: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: 0.5 },
          '30%': { transform: 'translateY(-6px)', opacity: 1 }
        },
        badgePulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' }
        },
        onlinePulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(34,197,94,0.4)' },
          '100%': { boxShadow: '0 0 0 6px transparent' }
        },
        float: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(30px,-30px) scale(1.05)' },
          '66%': { transform: 'translate(-20px,20px) scale(0.95)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' }
        },
        toastIn: {
          from: { opacity: 0, transform: 'translateX(100%)' },
          to: { opacity: 1, transform: 'translateX(0)' }
        }
      },
      animation: {
        'message-in': 'messageIn 0.2s ease forwards',
        'typing': 'typingBounce 1s ease infinite',
        'badge-pulse': 'badgePulse 2s ease infinite',
        'online-pulse': 'onlinePulse 2s ease infinite',
        'float': 'float 20s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'toast-in': 'toastIn 0.3s ease forwards',
      }
    },
  },
  plugins: [],
}
