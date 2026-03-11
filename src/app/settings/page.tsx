"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    morningBriefEnabled: true,
    morningBriefTime: "08:00",
    timezone: "UTC",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setForm({
            morningBriefEnabled: json.data.morning_brief_enabled,
            morningBriefTime: json.data.morning_brief_time,
            timezone: json.data.timezone,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-zinc-600">Loading settings...</p>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Settings</h1>
      <form
        className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          setStatus("");
          const response = await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
          setSaving(false);
          setStatus(response.ok ? "Saved" : "Could not save");
        }}
      >
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={form.morningBriefEnabled}
            onChange={(e) => setForm((p) => ({ ...p, morningBriefEnabled: e.target.checked }))}
          />
          Enable morning brief
        </label>
        <input
          type="time"
          value={form.morningBriefTime}
          onChange={(e) => setForm((p) => ({ ...p, morningBriefTime: e.target.value }))}
          className="rounded border border-zinc-300 px-3 py-2"
        />
        <input
          value={form.timezone}
          onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
          className="rounded border border-zinc-300 px-3 py-2"
          placeholder="Timezone"
        />
        <button disabled={saving} className="rounded bg-zinc-900 px-3 py-2 text-white">
          {saving ? "Saving..." : "Save settings"}
        </button>
        {status && <p className="text-sm text-zinc-600">{status}</p>}
      </form>

      <button
        onClick={async () => {
          const response = await fetch("/api/dev/send-morning-brief", { method: "POST" });
          setStatus(response.ok ? "Morning brief triggered." : "Could not send brief.");
        }}
        className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm"
      >
        Send test morning brief now
      </button>
    </section>
  );
}
