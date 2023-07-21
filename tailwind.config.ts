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
      keyframes: {
        overlayShow: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        drawerShadowShow: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        contentShow: {
          from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
        slide: {
          from: { opacity: '0', transform: 'translate(-20%, -50%) scale(1)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
      },
      animation: {
        overlayShow: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        overlayDrawerShow: 'drawerShadowShow 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        contentShow: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        slide: 'slide 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        fade: 'slide 250ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
  safelist: ["verticalText"],
} satisfies Config;
