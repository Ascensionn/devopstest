import { Client } from "pg";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("supabase.co") ? { rejectUnauthorized: false } : false,
});

await client.connect();

await client.query(`
create extension if not exists pgcrypto;
create type if not exists item_type as enum ('important_date', 'follow_up');
create type if not exists item_status as enum ('active', 'done');
create type if not exists draft_tone as enum ('warm', 'casual', 'formal');

create table if not exists users (
  id text primary key default ('usr_' || replace(gen_random_uuid()::text, '-', '')),
  email text not null unique,
  name text,
  timezone text not null default 'UTC',
  morning_brief_enabled boolean not null default true,
  morning_brief_time text not null default '08:00',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists people (
  id text primary key default ('per_' || replace(gen_random_uuid()::text, '-', '')),
  user_id text not null references users(id) on delete cascade,
  name text not null,
  relationship_label text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists items (
  id text primary key default ('itm_' || replace(gen_random_uuid()::text, '-', '')),
  user_id text not null references users(id) on delete cascade,
  person_id text references people(id) on delete set null,
  type item_type not null,
  title text not null,
  description text,
  due_at timestamptz not null,
  recurring_yearly boolean not null default false,
  status item_status not null default 'active',
  snoozed_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists drafts (
  id text primary key default ('drf_' || replace(gen_random_uuid()::text, '-', '')),
  user_id text not null references users(id) on delete cascade,
  item_id text not null references items(id) on delete cascade,
  tone draft_tone not null,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_people_user_id on people(user_id);
create index if not exists idx_items_user_due on items(user_id, due_at);
create index if not exists idx_items_status on items(status);
create index if not exists idx_drafts_user_item on drafts(user_id, item_id);
`);

await client.end();
console.log("Database initialized");
