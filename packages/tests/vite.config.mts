// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [
        {
            name: "strip-pure",
            renderChunk: (code: string) => code.replace(/\/\*\s*@__PURE__\s*\*\/\s*/g, "")
        }
    ],
    build: {
        minify: false,
        lib: {
            entry: 'jmc.test.tsx',
            name: 'jmc-test',
            fileName: 'index'
        },
        rollupOptions: {
            // Keep dependencies from being bundled into your library
            external: ['vitest', 'happy-dom']
        }
    }
})