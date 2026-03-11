import { Pool } from "pg";

const globalForDb = globalThis as unknown as { pool?: Pool };

export const db =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("supabase.co") ? { rejectUnauthorized: false } : false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = db;
}

export type AppUser = {
  id: string;
  email: string;
  name: string | null;
  timezone: string;
  morning_brief_enabled: boolean;
  morning_brief_time: string;
};

export async function ensureUser(email: string, name?: string | null) {
  const existing = await db.query<AppUser>("select * from users where email = $1 limit 1", [email]);
  if (existing.rows[0]) return existing.rows[0];

  const created = await db.query<AppUser>(
    `insert into users (email, name) values ($1, $2)
     returning *`,
    [email, name ?? null],
  );

  return created.rows[0];
}
