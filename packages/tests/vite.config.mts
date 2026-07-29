// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [
        {
            name: "strip-pure",
            transform: (code: string) => code.replace(/\/\*\s*@__PURE__\s*\*\/\s*/g, "")
        }
    ],
    build: {
        minify: false,
        lib: {
            entry: 'h.test.tsx',
            name: 'jmc-test',
            fileName: 'index'
        },
        rolldownOptions: {
            treeshake: false,
            // Keep dependencies from being bundled into your library
            external: ['vitest', 'happy-dom'],
            // transform: {
            //     jsx: {
            //         pure: false, // Prevents marking JSX transformations as pure side-effect-free code
            //     },
            // },
        }
    }
})