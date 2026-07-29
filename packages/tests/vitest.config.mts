import { defineConfig } from 'vitest/config'

export default defineConfig({
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