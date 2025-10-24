import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#d1d5db',
            '--tw-prose-headings': '#f3f4f6',
            '--tw-prose-lead': '#9ca3af',
            '--tw-prose-links': '#60a5fa',
            '--tw-prose-bold': '#ffffff',
            '--tw-prose-counters': '#60a5fa',
            '--tw-prose-bullets': '#60a5fa',
            '--tw-prose-hr': '#1f2937',
            '--tw-prose-quotes': '#9ca3af',
            '--tw-prose-quote-borders': '#60a5fa',
            '--tw-prose-captions': '#9ca3af',
            '--tw-prose-code': '#c084fc',
            '--tw-prose-pre-code': '#e5e7eb',
            '--tw-prose-pre-bg': '#111827',
            '--tw-prose-th-borders': '#1f2937',
            '--tw-prose-td-borders': '#1f2937',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
