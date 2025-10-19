import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/containers/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: "#4078FF", //button-linear-left
        second: "#6A89D4", //button-linear-right

        // Achromatic colors
        red: "#F85449",
        white: "#FFFFFF",
        sky: "#E5F0FE",
        blue: "#5481EC",
        darkblue: "#264989",
        rightgray: "#E9E9E9",
        gray: "#ADADAD",
        fontgray: "#686868",
        darkgray: "#575757",

        // 그 외 추가 컬러
        // ...
      },
      fontSize: {
        //폰트 사이즈
        h2: "20px",
        h3: "18px",
        h4: "16px", //  Button
        h5: "15px",
        h6: "14px", // Popup Button
        h7: "12px",
      },
      screens: {},
      fontFamily: {
        pretendard: ["var(--font-pretendard)"],
      },
    },
  },
  plugins: [],
};
export default config;
