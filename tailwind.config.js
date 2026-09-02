/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1C1B1A',
        bone: '#F7F5F0',
        sand: '#E8E1D3',
        sandline: '#D9CFB8',
        indigo: {
          DEFAULT: '#2E3A59',
          dark: '#202A42',
          light: '#4C5C82',
        },
        clay: '#B5533C',
        okgreen: '#3F6B4A',
      },
      fontFamily: {
        // System-stack fonts so the project builds with zero external font
        // downloads. Swap these for next/font/google (Archivo Black / Inter /
        // IBM Plex Mono) once you have full internet access — see README.
        display: ['Arial Black', 'Helvetica Neue', 'Arial', 'sans-serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        widest2: '.22em',
      },
      backgroundImage: {
        stitch:
          'repeating-linear-gradient(90deg, currentColor 0, currentColor 6px, transparent 6px, transparent 12px)',
      },
    },
  },
  plugins: [],
};
