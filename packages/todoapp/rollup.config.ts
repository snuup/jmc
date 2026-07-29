import terser from "@rollup/plugin-terser";

export default {
    input: "build/todoapp/src/app.js",

    output: {
        file: "dist/index.js",
        format: "es",
        sourcemap: true
    },

    plugins: [
        terser()
    ]
};