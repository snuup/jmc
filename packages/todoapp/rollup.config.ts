import terser from "@rollup/plugin-terser"
import postcss from 'rollup-plugin-postcss'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import gzip from 'rollup-plugin-gzip'

export default {
    input: "./dist/todoapp/src/app.js",

    output: {
        file: "dist/index.js",
        format: "es",
        sourcemap: true
    },

    plugins: [
        terser({
            mangle: {
                properties: {
                    regex: /.*/,
                },
            },
        }),
        nodeResolve(),
        postcss({ extract: 'app.css' }),
        gzip({ fileName: '.gz' }),
    ]
};