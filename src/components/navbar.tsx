import Link from "next/link";
import { SignOutButton } from "@/components/auth-controls";
import { getSession } from "@/lib/session";

const protectedLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/people", label: "People" },
  { href: "/settings", label: "Settings" },
];

export async function Navbar() {
  const session = await getSession();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-900">
          LoopReminder
        </Link>

        {session?.user?.email ? (
          <div className="flex items-center gap-3 text-sm">
            {protectedLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-zinc-600 hover:text-zinc-900">
                {link.label}
              </Link>
            ))}
            <span className="hidden text-zinc-500 md:inline">{session.user.email}</span>
            <SignOutButton />
          </div>
        ) : (
          <span className="text-sm text-zinc-500">Sign in to continue</span>
        )}
      </nav>
    </header>
  );
}
