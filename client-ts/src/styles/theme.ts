import { Itim } from "next/font/google";

export const itim = Itim({
    weight: ["400"],
    subsets: ["thai"],
    display: "swap",
    variable: "--font-itim",
});

export const theme = {
    typography: {
        styles: {
            variants: {
                lead: {
                    className: "font-itim",
                },
                small: {
                    className: "font-itim",
                },
                h1: {
                    className: "font-itim",
                },
                h2: {
                    className: "font-itim",
                },
                h3: {
                    className: "font-itim",
                },
                h4: {
                    className: "font-itim",
                },
                h5: {
                    className: "font-itim",
                },
                h6: {
                    className: "font-itim",
                },
                paragraph: { className: "font-itim" },
            },
        },
    }
};
