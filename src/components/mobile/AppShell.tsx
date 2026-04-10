"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/mobile/BottomNav";
import { useAuth } from "@/lib/authContext";
import { useDemoMode } from "@/lib/demoModeContext";
import { useLang } from "@/lib/languageContext";

const titleMap: Record<string, string> = {
  "/": "home",
  "/explore": "explore",
  "/play": "play",
  "/ai": "ai",
  "/profile": "profile",
  "/chat": "chat",
  "/recognition": "recognition",
  "/recognize": "recognition",
  "/quiz": "quiz",
  "/hunt": "treasureHunt",
  "/itinerary": "itinerary",
  "/festivals": "festivals",
  "/auth": "auth",
  "/leaderboard": "leaderboard",
  "/achievements": "progress",
  "/badges": "progress",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const pageTitle = t(titleMap[pathname] ?? "home");

  return (
    <div className={`min-h-screen bg-gradient-to-b from-[var(--bg-dark)] via-[#120d27] to-[#0b0718] text-cream ${lang === "hi" ? "lang-hi" : ""}`}>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#120d27]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-xl items-center justify-between px-4">
          <div>
            <p className="font-serif text-lg text-gold">Sanskriti AI</p>
            <p className="text-xs text-cream/65">{pageTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleDemoMode}
              className={`min-h-[36px] rounded-full border px-3 text-xs transition-all duration-300 ease-out active:scale-95 ${
                isDemoMode ? "border-[#C9A84C]/40 bg-[#C9A84C]/15 text-[#C9A84C]" : "border-white/20 text-cream/70"
              }`}
            >
              {isDemoMode ? (lang === "hi" ? "डेमो ऑन" : "DEMO ON") : (lang === "hi" ? "डेमो ऑफ" : "DEMO OFF")}
            </button>
            <button
              type="button"
              onClick={toggleLang}
              className="min-h-[36px] rounded-full border border-white/20 px-3 text-xs"
            >
              {lang.toUpperCase()}
            </button>
            {user ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="min-h-[36px] rounded-full bg-rust px-3 text-xs text-black"
              >
                {t("signOut")}
              </button>
            ) : (
              <Link href="/auth" className="min-h-[36px] rounded-full bg-teal px-3 py-2 text-xs text-black">
                {t("auth")}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
