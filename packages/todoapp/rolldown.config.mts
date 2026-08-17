// rolldown.config.js
import { defineConfig } from 'rolldown'
import { cssRolldown } from 'rolldown-plugin-css'

export default defineConfig({
    input: 'dist/todoapp/src/app.js',
    output: {
        dir: 'dist',
        format: 'esm',
    },
    plugins: [
    cssRolldown(),
  ],
})