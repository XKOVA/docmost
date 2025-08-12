import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  try {
    await db.schema
      .alterTable('workspaces')
      .addColumn('default_landing_page', 'varchar', (col) => col)
      .execute();
  } catch (error: any) {
    // Ignore error if column already exists (PostgreSQL error code 42701)
    if (error.code !== '42701') {
      throw error;
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('workspaces')
    .dropColumn('default_landing_page')
    .execute();
}
