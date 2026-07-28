import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        files: ["**/*.ts", "**/*.tsx"], // Apply to all TypeScript files
        rules: {
            "@typescript-eslint/no-unused-vars": "off", // Disable the rule
        },
    }
)