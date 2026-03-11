"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Person = {
  id: string;
  name: string;
  relationship_label: string;
  notes: string | null;
};

export function PeopleManager({ initialPeople }: { initialPeople: Person[] }) {
  const router = useRouter();
  const [people, setPeople] = useState(initialPeople);
  const [error, setError] = useState("");

  const save = async (form: FormData) => {
    setError("");
    const payload = {
      name: String(form.get("name") || ""),
      relationshipLabel: String(form.get("relationshipLabel") || ""),
      notes: String(form.get("notes") || "") || null,
    };
    if (!payload.name || !payload.relationshipLabel) {
      setError("Name and relationship label are required.");
      return;
    }

    const response = await fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setError("Could not create person.");
      return;
    }

    const json = await response.json();
    setPeople((prev) => [json.data, ...prev]);
    router.refresh();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this person?")) return;
    await fetch(`/api/people/${id}`, { method: "DELETE" });
    setPeople((prev) => prev.filter((person) => person.id !== id));
  };

  const edit = async (person: Person) => {
    const name = window.prompt("Name", person.name);
    if (!name) return;
    const relationshipLabel = window.prompt("Relationship label", person.relationship_label);
    if (!relationshipLabel) return;
    const notes = window.prompt("Notes", person.notes || "") || null;

    const response = await fetch(`/api/people/${person.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, relationshipLabel, notes }),
    });
    if (!response.ok) return;

    const json = await response.json();
    setPeople((prev) => prev.map((item) => (item.id === person.id ? json.data : item)));
  };

  return (
    <div className="space-y-4">
      <form
        className="space-y-2 rounded-lg border border-zinc-200 bg-white p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await save(new FormData(e.currentTarget));
          e.currentTarget.reset();
        }}
      >
        <h2 className="text-sm font-semibold">Add person</h2>
        <div className="grid gap-2 md:grid-cols-2">
          <input name="name" placeholder="Name" className="rounded border border-zinc-300 px-2 py-2" />
          <input
            name="relationshipLabel"
            placeholder="Relationship label"
            className="rounded border border-zinc-300 px-2 py-2"
          />
        </div>
        <textarea name="notes" placeholder="Notes (optional)" className="w-full rounded border border-zinc-300 px-2 py-2" />
        {error && <p className="text-xs text-rose-700">{error}</p>}
        <button className="rounded bg-zinc-900 px-3 py-2 text-sm text-white">Save person</button>
      </form>

      {people.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-500">
          No people yet. Add your first person to begin.
        </p>
      ) : (
        <ul className="space-y-2">
          {people.map((person) => (
            <li key={person.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3">
              <div>
                <Link href={`/people/${person.id}`} className="font-medium text-zinc-900 hover:underline">
                  {person.name}
                </Link>
                <p className="text-sm text-zinc-600">{person.relationship_label}</p>
              </div>
              <div className="flex gap-2 text-xs">
                <button onClick={() => edit(person)} className="rounded border px-2 py-1">
                  Edit
                </button>
                <button onClick={() => remove(person.id)} className="rounded border px-2 py-1">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
