/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // カスタムカラーがあれば追加
      },
    },
  },
  plugins: [],
  darkMode: 'media', // OSの設定に基づいてダークモードを切り替え
} 