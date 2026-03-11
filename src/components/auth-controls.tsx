"use client";

import { FormEvent, useState } from "react";
import { signIn, signOut } from "next-auth/react";

export function LoginForm() {
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    const result = await signIn("credentials", {
      redirect: false,
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
      callbackUrl: "/dashboard",
    });

    if (result?.error) {
      setError("Invalid credentials");
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
      <h2 className="text-lg font-semibold">Sign in</h2>
      <p className="text-sm text-zinc-600">Use demo credentials from `.env`.</p>
      <input name="name" placeholder="Name" className="w-full rounded border border-zinc-300 px-3 py-2" />
      <input name="email" type="email" placeholder="Email" required className="w-full rounded border border-zinc-300 px-3 py-2" />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        className="w-full rounded border border-zinc-300 px-3 py-2"
      />
      {error && <p className="text-xs text-rose-700">{error}</p>}
      <button className="w-full rounded bg-zinc-900 px-3 py-2 text-white">Sign in</button>
    </form>
  );
}

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded border border-zinc-300 px-2 py-1 text-zinc-700 hover:bg-zinc-100"
    >
      Sign out
    </button>
  );
}
