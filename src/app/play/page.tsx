"use client";

import Link from "next/link";
import { MobileCard } from "@/components/mobile/MobileCard";
import { SectionHeader } from "@/components/mobile/SectionHeader";
import { useUser } from "@/lib/userContext";
import { useLang } from "@/lib/languageContext";

const playItems = [
  { href: "/quiz", titleKey: "quiz", descEn: "Monument MCQs with instant XP", descHi: "स्मारक क्विज़ और तुरंत XP" },
  { href: "/hunt", titleKey: "treasureHunt", descEn: "Riddles + GPS verification", descHi: "पहेलियां + GPS सत्यापन" },
  { href: "/leaderboard", titleKey: "leaderboard", descEn: "Track your rank and top explorers", descHi: "अपनी रैंक और टॉप एक्सप्लोरर देखें" },
];

export default function PlayHubPage() {
  const { profile, level } = useUser();
  const { t, lang } = useLang();

  return (
    <section className="space-y-4">
      <SectionHeader
        title={t("play")}
        subtitle={lang === "hi" ? "गेमिफाइड हेरिटेज चुनौतियां" : "Gamified heritage challenges"}
      />

      <MobileCard>
        <p className="text-xs text-cream/70">{t("currentLevel")}</p>
        <p className="font-serif text-2xl text-gold">{level}</p>
        <p className="mt-1 text-sm text-teal">{profile?.total_xp ?? 0} XP</p>
      </MobileCard>

      <div className="grid grid-cols-1 gap-3">
        {playItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <MobileCard className="transition hover:border-gold/60">
              <h3 className="font-semibold text-gold">{t(item.titleKey)}</h3>
              <p className="mt-1 text-sm text-cream/75">{lang === "hi" ? item.descHi : item.descEn}</p>
            </MobileCard>
          </Link>
        ))}
      </div>
    </section>
  );
}
