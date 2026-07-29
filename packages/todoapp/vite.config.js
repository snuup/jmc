import { defineConfig } from 'vite';
export default defineConfig({
    oxc: {
        jsx: {
            development: false,
        }
    },
    plugins: [
        {
            name: "strip-pure",
            renderChunk: (code) => code.replace(/\/\*\s*@__PURE__\s*\*\/\s*/g, "")
        }
    ],
    build: {
        minify: 'oxc',
        rolldownOptions: {
            output: {
                minify: false,
                entryFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            }
        },
        modulePreload: {
            polyfill: false
        },
    }
});
//# sourceMappingURL=vite.config.js.map