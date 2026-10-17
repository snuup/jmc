import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

const src = (file: string) => fileURLToPath(new URL(`./src/${file}`, import.meta.url))

export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
        environment: 'happy-dom',
        snapshotFormat: {
            printBasicPrototype: false,
            escapeString: false,
        },
        diff: {
            printBasicPrototype: false,
        },
        projects: [
            {
                // classic JSX: every .tsx file imports jsx and jsxf
                extends: true,
                oxc: { jsx: { development: false, runtime: 'classic', pragma: 'jsx', pragmaFrag: 'jsxf' } },
                test: { name: 'classic', include: ['./tests/*.test.{js,ts,tsx}'] },
            },
            {
                // automatic JSX: the compiler imports from @snupo/jmc/jsx-runtime, here resolved to the sources
                extends: true,
                oxc: { jsx: { runtime: 'automatic', importSource: '@snupo/jmc' } },
                resolve: {
                    alias: [
                        { find: /^@snupo\/jmc$/, replacement: src('index.ts') },
                        { find: /^@snupo\/jmc\/jsx-runtime$/, replacement: src('jsx-runtime.ts') },
                        { find: /^@snupo\/jmc\/jsx-dev-runtime$/, replacement: src('jsx-dev-runtime.ts') },
                    ],
                },
                test: { name: 'automatic', include: ['./tests/automatic/*.test.{ts,tsx}'] },
            },
        ],
    },
})
