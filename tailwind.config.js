/** @type {import('tailwindcss').Config} */
export default {
    content: ["./app/components/**/*.{vue,js}", "./app/layouts/**/*.vue", "./app/pages/**/*.vue", "./app/app.vue", "./content/**/*.md"],
    theme: {
        extend: {},
    },
    plugins: [require("daisyui")],
};
