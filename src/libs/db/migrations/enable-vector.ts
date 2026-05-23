import { db } from "../index";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("Enabling pgvector, unaccent, and pg_trgm extensions...");
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS unaccent;`);
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION f_unaccent(text)
      RETURNS text AS
      $func$
      SELECT public.unaccent('public.unaccent', $1)
      $func$ LANGUAGE sql IMMUTABLE;
    `);
    console.log("Extensions and functions enabled successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error enabling pgvector:", error);
    process.exit(1);
  }
}

main();
