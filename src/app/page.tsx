import Link from "next/link";
import { LoginForm } from "@/components/auth-controls";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();

  return (
    <section className="grid gap-8 md:grid-cols-2 md:items-start">
      <div className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Private MVP</p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900">
          Relationship reminders that keep your core loop simple.
        </h1>
        <p className="max-w-2xl text-base text-zinc-600">
          Add people, track important dates and follow-ups, get your morning brief, and take action in
          one dashboard.
        </p>
        {session?.user?.email && (
          <Link
            href="/dashboard"
            className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Go to dashboard
          </Link>
        )}
      </div>

      {!session?.user?.email ? (
        <LoginForm />
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
          You are signed in as {session.user.email}.
        </div>
      )}
    </section>
  );
}
