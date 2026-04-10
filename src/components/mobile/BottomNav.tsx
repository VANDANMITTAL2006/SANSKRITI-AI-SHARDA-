"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Compass, Gamepad2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/languageContext";

const tabs = [
  { href: "/", labelKey: "home", icon: House },
  { href: "/ai", labelKey: "ai", icon: Bot },
  { href: "/play", labelKey: "play", icon: Gamepad2 },
  { href: "/explore", labelKey: "explore", icon: Compass },
  { href: "/profile", labelKey: "profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();

  const grouped: Record<string, string[]> = {
    "/": ["/", "/festivals", "/itinerary", "/sustainability", "/monument"],
    "/explore": ["/explore"],
    "/play": ["/play", "/quiz", "/hunt"],
    "/ai": ["/ai", "/chat", "/recognition", "/recognize"],
    "/profile": ["/profile", "/auth", "/leaderboard", "/achievements", "/badges"],
  };

  const activeTab =
    tabs.find((tab) =>
      (grouped[tab.href] ?? [tab.href]).some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      ),
    ) ?? tabs[0];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#1C1638]/80 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const active = activeTab?.href === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex min-h-[54px] flex-col items-center justify-center rounded-xl text-[11px] transition-all duration-300 ease-out",
                active ? "bg-[#C9A84C]/12 text-[#C9A84C]" : "text-cream/70 hover:bg-white/5",
              )}
            >
              {active ? <span className="absolute top-1 h-1 w-6 rounded-full bg-[#C9A84C] shadow-[0_0_12px_rgba(201,168,76,0.9)]" /> : null}
              <Icon size={18} />
              <span className="mt-1">{t(tab.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
