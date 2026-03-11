import { Client } from "pg";

if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to clear data in production");
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("supabase.co") ? { rejectUnauthorized: false } : false,
});
await client.connect();

const email = process.env.DEMO_USER_EMAIL || "demo@example.com";
await client.query("delete from users where email = $1", [email]);

await client.end();
console.log('Seed data cleared');
