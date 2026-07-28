import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['*test.{js,ts,tsx}'], // Include tests in all packages
        //exclude: ['node_modules', '**/cases.d.ts'], // Exclude node_modules
        // browser: {
        //     provider: 'preview', // or 'webdriverio'
        //     enabled: true,
        //     // at least one instance is required
        //     instances: [
        //         { browser: 'chrome' },
        //     ],
        // },
        coverage: {
            provider: 'v8', // or 'istanbul'
            reporter: ['text', 'json', 'html'],
        },
        environment: 'happy-dom'
    },
    resolve: {
        alias: {
            // Add aliases for each package (optional but recommended)
            // '@': path.resolve(__dirname, './src'),  // Matches `@/*` in tsconfig.json
        },
    },
})