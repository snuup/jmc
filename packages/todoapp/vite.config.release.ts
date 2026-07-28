import { defineConfig } from 'vite'

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
        minify: true,
        // modulePreload: false,
        modulePreload: {
            polyfill: false
        },
        rolldownOptions: {

            output: {
                // format: 'es',
                // Use [name] so the entry maps to app.js instead of clashing
                entryFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            }
        }
    }
})