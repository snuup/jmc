import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

const src = (file: string) => fileURLToPath(new URL(`../src/${file}`, import.meta.url))

// the demo uses jmc like an app does, with the automatic JSX runtime. the imports resolve to the sources
export default defineConfig({
    oxc: { jsx: { runtime: 'automatic', importSource: '@snupo/jmc' } },
    resolve: {
        alias: [
            { find: /^@snupo\/jmc$/, replacement: src('index.ts') },
            { find: /^@snupo\/jmc\/comps$/, replacement: src('comps/index.ts') },
            { find: /^@snupo\/jmc\/jsx-runtime$/, replacement: src('jsx-runtime.ts') },
            { find: /^@snupo\/jmc\/jsx-dev-runtime$/, replacement: src('jsx-dev-runtime.ts') },
        ],
    },
})
