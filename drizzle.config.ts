import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

export default defineConfig({
	schema: './src/libs/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: { url: DATABASE_URL },
	verbose: true,
	strict: true
});
