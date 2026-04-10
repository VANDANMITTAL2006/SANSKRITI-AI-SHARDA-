"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/languageContext";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/authContext";

const links = [
  ["/", "Home"],
  ["/chat", "Chat"],
  ["/explore", "Explore"],
  ["/quiz", "Quiz"],
  ["/hunt", "Hunt"],
  ["/leaderboard", "Leaderboard"],
  ["/badges", "Badges"],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, setLang } = useLang();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-dark)] to-[#0a0815] text-cream">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="font-serif text-lg text-gold">
            Sanskriti AI
          </Link>
          <nav className="hidden gap-2 md:flex">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-full px-3 py-1 text-sm",
                  pathname === href ? "bg-gold text-black" : "text-cream/85 hover:bg-white/10",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="rounded-full border border-white/20 px-3 py-1 text-xs"
            >
              {lang.toUpperCase()}
            </button>
            {user ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-full bg-rust px-3 py-1 text-xs text-black"
              >
                Sign out
              </button>
            ) : (
              <Link href="/auth" className="rounded-full bg-teal px-3 py-1 text-xs text-black">
                Auth
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
