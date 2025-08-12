import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Use raw SQL with IF NOT EXISTS to avoid transaction issues
  await sql`
    ALTER TABLE workspaces 
    ADD COLUMN IF NOT EXISTS default_landing_page VARCHAR
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('workspaces')
    .dropColumn('default_landing_page')
    .execute();
}
