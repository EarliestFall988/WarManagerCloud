import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'bhall': "url('../../public/bhall.png')",
      }
    },
  },
  plugins: [],
} satisfies Config;
