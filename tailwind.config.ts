import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:       '#060f16',
        surface:  '#0d1e2b',
        panel:    '#0f2333',
        panelB:   '#0a1a26',
        border:   '#1e3a4a',
        accent:   '#3a8fa8',
        accent2:  '#7acce0',
        muted:    '#6a9aaa',
        text:     '#c8dfe8',
        gold:     '#d4a847',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
