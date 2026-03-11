"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Person = { id: string; name: string };

export function ItemForm({ people, personId }: { people: Person[]; personId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <form
      className="space-y-2 rounded-lg border border-zinc-200 bg-white p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        const form = new FormData(e.currentTarget);
        const payload = {
          type: form.get("type"),
          title: form.get("title"),
          personId: form.get("personId") || null,
          dueAt: form.get("dueAt"),
          recurringYearly: form.get("recurringYearly") === "on",
          description: form.get("description") || null,
        };

        if (!payload.type || !payload.title || !payload.dueAt) {
          setError("Type, title, and due date are required.");
          return;
        }

        setLoading(true);
        const response = await fetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setLoading(false);
        if (!response.ok) {
          setError("Could not save item");
          return;
        }
        (e.target as HTMLFormElement).reset();
        router.refresh();
      }}
    >
      <h2 className="text-sm font-semibold">Quick add item</h2>
      <div className="grid gap-2 md:grid-cols-2">
        <select name="type" className="rounded border border-zinc-300 px-2 py-2" defaultValue="important_date">
          <option value="important_date">Important date</option>
          <option value="follow_up">Follow up</option>
        </select>
        <input name="title" placeholder="Title" className="rounded border border-zinc-300 px-2 py-2" required />
        <select name="personId" defaultValue={personId || ""} className="rounded border border-zinc-300 px-2 py-2">
          <option value="">No person</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
        <input name="dueAt" type="date" className="rounded border border-zinc-300 px-2 py-2" required />
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input name="recurringYearly" type="checkbox" /> Recurring yearly
      </label>
      <textarea name="description" placeholder="Description (optional)" className="w-full rounded border border-zinc-300 px-2 py-2" />
      {error && <p className="text-xs text-rose-700">{error}</p>}
      <button disabled={loading} className="rounded bg-zinc-900 px-3 py-2 text-sm text-white">
        {loading ? "Saving..." : "Add item"}
      </button>
    </form>
  );
}
