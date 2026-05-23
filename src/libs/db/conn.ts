import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema';

export function conn(url: string) {
	const client = new Pool({ connectionString: url });
	return drizzle(client, { schema });
}
