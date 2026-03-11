"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, formatDueLabel } from "@/lib/date";

type Item = {
  id: string;
  title: string;
  type: "important_date" | "follow_up";
  due_at: string;
  person_name?: string | null;
};

export function ItemCard({ item, overdue = false }: { item: Item; overdue?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const run = async (path: string, body?: Record<string, unknown>) => {
    setLoading(true);
    await fetch(path, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    setLoading(false);
    router.refresh();
  };

  const draft = async () => {
    const tone = window.prompt("Tone: warm, casual, or formal", "warm") || "warm";
    setLoading(true);
    const response = await fetch(`/api/items/${item.id}/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tone }),
    });
    const json = await response.json();
    setLoading(false);
    if (json?.data?.text) {
      window.prompt("Draft message", json.data.text);
    }
  };

  return (
    <article className={`rounded-lg border p-4 ${overdue ? "border-rose-300 bg-rose-50" : "border-zinc-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-zinc-900">{item.title}</h3>
          <p className="text-sm text-zinc-600">
            {item.person_name ? `${item.person_name} · ` : ""}
            {item.type.replace("_", " ")} · {formatDate(item.due_at)} ({formatDueLabel(item.due_at)})
          </p>
          {overdue && <p className="mt-1 text-xs font-semibold text-rose-700">Overdue</p>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <button onClick={() => run(`/api/items/${item.id}/done`)} disabled={loading} className="rounded border px-2 py-1">
          Mark done
        </button>
        <button
          onClick={() => run(`/api/items/${item.id}/snooze`, { option: "tomorrow" })}
          disabled={loading}
          className="rounded border px-2 py-1"
        >
          Snooze tomorrow
        </button>
        <button
          onClick={() => run(`/api/items/${item.id}/snooze`, { option: "next_week" })}
          disabled={loading}
          className="rounded border px-2 py-1"
        >
          Snooze next week
        </button>
        <button onClick={draft} disabled={loading} className="rounded border px-2 py-1">
          Draft message
        </button>
      </div>
    </article>
  );
}
