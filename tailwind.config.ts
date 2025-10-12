import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f9fafb",
        card: "#ffffff",
        "text-headings": "#111827",
        "text-body": "#374151",
        "text-muted": "#6b7280",
        "primary-accent": "#4f46e5",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Lora", "Georgia", "serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            a: {
              color: '#4f46e5',
              fontWeight: '600',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
                color: '#4338ca',
              },
            },
            h2: {
              color: '#111827',
              fontWeight: '800',
            },
            h3: {
              color: '#111827',
              fontWeight: '700',
            },
            h4: {
              color: '#111827',
              fontWeight: '600',
            },
            strong: {
              color: '#111827',
              fontWeight: '700',
            },
            blockquote: {
              borderLeftColor: '#4f46e5',
              color: '#374151',
            },
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

