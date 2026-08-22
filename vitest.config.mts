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
    // plugins: [
    //     {
    //         name: "strip-pure",
    //         transform: (code: string) => code.replace(/\/\*\s*@__PURE__\s*\*\/\s*/g, "")
    //     }
    // ],
    test: {
        include: ['./tests/*.test.{js,ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            // include: ['**/*.{ts,tsx}']
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