import { defineConfig } from 'vitest/config'

export default defineConfig({
    oxc: {
        jsx: {
            development: false,
            runtime: "classic",
            pragma: "jsx",
            pragmaFrag: "jsxf",
        }
    },
    test: {
        include: ['./tests/*.test.{js,ts,tsx}'],
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
    }
})