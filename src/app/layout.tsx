import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { AppSessionProvider } from "@/components/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoopReminder",
  description: "A private relationship and follow-up assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 antialiased">
        <AppSessionProvider>
          <Navbar />
          <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        </AppSessionProvider>
      </body>
    </html>
  );
}
