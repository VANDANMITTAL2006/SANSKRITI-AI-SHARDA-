"use client";

import Link from "next/link";
import { Brain, Calendar, Camera, Compass, Map, MessageCircle, Medal, Sparkles, Trophy, UserRound } from "lucide-react";
import { MobileCard } from "@/components/mobile/MobileCard";
import { SectionHeader } from "@/components/mobile/SectionHeader";
import { useLang } from "@/lib/languageContext";
import { useUser } from "@/lib/userContext";

const quickActions = [
  { labelKey: "chat", href: "/chat", subtitleKey: "open", icon: MessageCircle },
  { labelKey: "recognition", href: "/recognition", subtitleKey: "scanNow", icon: Camera },
  { labelKey: "quiz", href: "/quiz", subtitleKey: "start", icon: Brain },
  { labelKey: "treasureHunt", href: "/hunt", subtitleKey: "explore", icon: Map },
  { labelKey: "festivals", href: "/festivals", subtitleKey: "discover", icon: Calendar },
  { labelKey: "itinerary", href: "/itinerary", subtitleKey: "plan", icon: Compass },
] as const;

export default function HomePage() {
  const { t, lang } = useLang();
  const { profile, badges } = useUser();
  const unlocked = badges.filter((b) => b.unlocked).length;

  return (
    <section className={`relative mx-auto max-w-md space-y-6 px-4 py-6 ${lang === "hi" ? "lang-hi" : ""}`}>
      <div className="pointer-events-none absolute inset-x-4 top-2 -z-10 h-56 rounded-full bg-[#C9A84C]/10 blur-3xl" />

      <SectionHeader
        title={t("welcome")}
        subtitle={
          lang === "hi"
            ? "एआई आधारित सांस्कृतिक यात्राएं, वॉइस स्टोरीज़ और गेमिफाइड खोज"
            : "AI-powered cultural journeys, voice stories, and gamified monument discovery"
        }
      />

      <MobileCard className="slide-up border border-white/10 bg-white/5 shadow-lg shadow-[#C9A84C]/10 backdrop-blur-xl transition-all duration-300 ease-out active:scale-95">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-gray-400">{t("heritageDashboard")}</p>
            <p className="mt-1 font-serif text-lg tracking-wide text-cream">{lang === "hi" ? "आपका सफर" : "Your journey"}</p>
          </div>
          <div className="rounded-full border border-white/10 bg-[#C9A84C]/10 p-2 text-gold">
            <Sparkles size={18} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#1C1638]/70 p-4 text-center shadow-md transition-all duration-300 ease-out active:scale-95">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#C9A84C]/10 text-gold">
              <Trophy size={18} />
            </div>
            <p className="text-xs uppercase tracking-wider text-gray-400">XP</p>
            <p className="mt-1 text-lg font-bold text-gold">{profile?.total_xp ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#1C1638]/70 p-4 text-center shadow-md transition-all duration-300 ease-out active:scale-95">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#C9A84C]/10 text-teal">
              <UserRound size={18} />
            </div>
            <p className="text-xs uppercase tracking-wider text-gray-400">{t("visited")}</p>
            <p className="mt-1 text-lg font-bold text-teal">{profile?.monuments_visited?.length ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#1C1638]/70 p-4 text-center shadow-md transition-all duration-300 ease-out active:scale-95">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#C9A84C]/10 text-rust">
              <Medal size={18} />
            </div>
            <p className="text-xs uppercase tracking-wider text-gray-400">{t("badges")}</p>
            <p className="mt-1 text-lg font-bold text-rust">{unlocked}</p>
          </div>
        </div>
      </MobileCard>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-serif text-xl tracking-wide text-gold">{t("quickActions")}</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-white/15 via-[#C9A84C]/30 to-transparent" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map(({ labelKey, href, subtitleKey, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-[80px] flex-col justify-between rounded-2xl border border-white/10 bg-[#1C1638]/80 p-4 shadow-md shadow-black/20 transition-all duration-300 ease-out hover:scale-[1.02] hover:border-[#C9A84C]/40 hover:shadow-lg hover:shadow-[#C9A84C]/20 active:scale-95"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-lg bg-[#C9A84C]/10 p-2 text-gold transition-transform duration-300 group-hover:scale-105">
                  <Icon size={16} />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400">{t(subtitleKey)}</span>
              </div>
              <div>
                <p className="font-medium text-cream">{t(labelKey)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
