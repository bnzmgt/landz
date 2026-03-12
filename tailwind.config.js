/** @type {import('tailwindcss').Config} */
export default {
    content: ["./app/components/**/*.{vue,js}", "./app/layouts/**/*.vue", "./app/pages/**/*.vue", "./app/app.vue", "./content/**/*.md"],
    theme: {
        container: {
            center: true,
            padding: "1rem",
            screens: {
                lg: "1100px",
                xl: "1200px",
            },
        },
        extend: {
            colors: {
                primary: "#ee4d2d",
                "primary-hover": "#D73211",
                "primary-light": "#F53D2D",
                price: "#ee4d2d",
            },
        },
    },

    plugins: [require("daisyui"), require("@tailwindcss/line-clamp")],
    daisyui: {
        themes: [
            {
                dotuqu: {
                    primary: "#EE4D2D",
                    "primary-content": "#ffffff",

                    secondary: "#F53D2D",
                    "secondary-content": "#ffffff",

                    accent: "#FFA41B",
                    "accent-content": "#000000",

                    neutral: "#333333",
                    "neutral-content": "#ffffff",

                    "base-100": "#ffffff",
                    "base-200": "#F5F5F5",
                    "base-300": "#EEEEEE",
                    "base-content": "#333333",

                    info: "#1E90FF",
                    success: "#26C281",
                    warning: "#FFA41B",
                    error: "#FF424F",
                },
            },
        ],
    },
};
