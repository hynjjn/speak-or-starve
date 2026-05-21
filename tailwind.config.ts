import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', '"Courier New"', "monospace"],
        dialog: ['"VT323"', '"Courier New"', "monospace"],
      },
      colors: {
        bone: "#f5f0d8",
        ut: {
          black: "#0a0a0a",
          dust: "#1a1a1a",
          frame: "#ffffff",
          text: "#ffffff",
          dim: "#a8a8a8",
          hp: "#ffe600",
          dmg: "#ff2b2b",
          soul: "#ff0000",
          fight: "#ff7b00",
          act: "#fff700",
          item: "#34c2ff",
          mercy: "#aaff5a",
          forest: "#0d2b1a",
          sand: "#d8b878",
          ocean: "#1e5fa8",
        },
      },
      boxShadow: {
        pixel: "0 0 0 4px #ffffff",
      },
      keyframes: {
        blink: {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        shake: {
          "0%, 100%": { transform: "translate(0,0)" },
          "20%": { transform: "translate(-4px,2px)" },
          "40%": { transform: "translate(4px,-2px)" },
          "60%": { transform: "translate(-3px,-3px)" },
          "80%": { transform: "translate(3px,3px)" },
        },
        flash: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
      },
      animation: {
        blink: "blink 1s steps(1,end) infinite",
        bob: "bob 1.2s ease-in-out infinite",
        shake: "shake 0.4s linear",
        flash: "flash 0.15s linear 4",
      },
    },
  },
  plugins: [],
};
export default config;
