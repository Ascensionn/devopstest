import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("supabase.co") ? { rejectUnauthorized: false } : false,
});
await client.connect();

const email = process.env.DEMO_USER_EMAIL || "demo@example.com";
const userRes = await client.query(
  `insert into users(email, name)
   values ($1, 'Demo User')
   on conflict(email) do update set name = excluded.name
   returning id`,
  [email],
);
const userId = userRes.rows[0].id;

const p1 = await client.query(
  `insert into people (user_id, name, relationship_label, notes)
   values ($1, 'Ava', 'Partner', 'Loves handwritten notes') returning id`,
  [userId],
);
const p2 = await client.query(
  `insert into people (user_id, name, relationship_label, notes)
   values ($1, 'Noah', 'Brother', 'Check in about job search') returning id`,
  [userId],
);

await client.query(
  `insert into items (user_id, person_id, type, title, due_at, recurring_yearly, status)
   values
   ($1, $2, 'important_date', 'Ava birthday', now() + interval '3 days', true, 'active'),
   ($1, $3, 'follow_up', 'Check in with Noah', now() - interval '2 days', false, 'active'),
   ($1, null, 'follow_up', 'Call grandma', now() + interval '1 day', false, 'active')`,
  [userId, p1.rows[0].id, p2.rows[0].id],
);

await client.end();
console.log('Seed complete');
