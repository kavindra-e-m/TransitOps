/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      backgroundColor: {
        primary: 'var(--bg-primary)',
        sidebar: 'var(--bg-sidebar)',
        card: 'var(--bg-card)',
        'card-hover': 'var(--bg-card-hover)',
        input: 'var(--bg-input)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'status-available': 'var(--status-available)',
        'status-ontrip': 'var(--status-ontrip)',
        'status-shop': 'var(--status-shop)',
        'status-retired': 'var(--status-retired)',
        'status-draft': 'var(--status-draft)',
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'status-available': 'var(--status-available)',
        'status-ontrip': 'var(--status-ontrip)',
        'status-shop': 'var(--status-shop)',
        'status-retired': 'var(--status-retired)',
        'status-draft': 'var(--status-draft)',
      },
      borderColor: {
        default: 'var(--border-default)',
        focus: 'var(--border-focus)',
        accent: 'var(--accent)',
        'status-available': 'var(--status-available)',
        'status-ontrip': 'var(--status-ontrip)',
        'status-shop': 'var(--status-shop)',
        'status-retired': 'var(--status-retired)',
        'status-draft': 'var(--status-draft)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
