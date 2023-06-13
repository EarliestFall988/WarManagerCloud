import { type Config } from "tailwindcss";
// import forms from "@tailwindcss/forms";

// const f = forms({
//   strategy: "class",
// });

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        bhall: "url('../../public/bhall.png')",
      },
    },
  },
  plugins: [],
  safelist: ["verticalText"],
} satisfies Config;
