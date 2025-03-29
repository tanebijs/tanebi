import { defineConfig } from 'drizzle-kit';
export default defineConfig({
    schema: './src/storage/database/schema.ts',
    dialect: 'sqlite',
});
