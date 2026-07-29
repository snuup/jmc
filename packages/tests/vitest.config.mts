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
        environment: 'happy-dom',
        snapshotFormat: {
            printBasicPrototype: false, // Prevents printing "Object" / "Array" headers
            escapeString: false,
        },
        diff: {
            printBasicPrototype: false, // Disables "Object" and "Array" type headers in diffs
        },
    }
})