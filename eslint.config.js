import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    { files: ['**/*.{js,mjs,cjs,ts}'], languageOptions: { globals: globals.node } },
    tseslint.configs.recommended,
]);
