import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ember: {
          bg: "#0D0D0F",
          surface: "#17171A",
          raised: "#222226",
          border: "#2F2F35",
          primary: "#FF6A00",
          soft: "#FF9A3C",
          red: "#E6391A",
          amber: "#FFC857",
          text: "#F5F2EB",
          muted: "#A3A3A3",
          success: "#3DDC84",
          danger: "#FF4D4D"
        }
      },
      boxShadow: {
        ember: "0 0 40px rgba(255, 106, 0, 0.18)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"]
      }
    },
  },
  plugins: [],
} satisfies Config;
