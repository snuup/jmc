import { defineConfig } from 'vite'

// vite.config.js
export default defineConfig({
    oxc: {
        jsx: {
            development: false,
        }
    },
    plugins: [
        {
            name: "strip-pure",
            renderChunk: (code: string) => code.replace(/\/\*\s*@__PURE__\s*\*\/\s*/g, "")
        }
    ],
    build: {
        minify: false,
        modulePreload: false,
        rolldownOptions: {
            platform: 'browser',
            output: {
                format: 'es',
                entryFileNames: 'app.js',
                assetFileNames: '[name].[ext]',
            }
        }
    }
})