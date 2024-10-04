import type { Config } from "tailwindcss";
const withMT = require("@material-tailwind/react/utils/withMT");

const config: Config = withMT({
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extends: {
            fontFamily: {
                itim: ["var(--font-itim)", "cursive"],
            },
        },
    },
    plugins: [],
});

export default config;
