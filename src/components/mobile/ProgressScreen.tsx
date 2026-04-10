"use client";

import { useEffect, useState } from "react";
import { TabSwitcher } from "@/components/mobile/TabSwitcher";
import { SectionHeader } from "@/components/mobile/SectionHeader";
import { MobileCard } from "@/components/mobile/MobileCard";
import { api } from "@/lib/apiClient";
import { useUser } from "../../lib/userContext";

const tiers = [
  { name: "Heritage Explorer", min: 0, max: 499 },
  { name: "Monument Seeker", min: 500, max: 999 },
  { name: "Culture Guardian", min: 1000, max: 1999 },
  { name: "History Keeper", min: 2000, max: 3499 },
  { name: "Sanskriti Master", min: 3500, max: Infinity },
];

type Row = { id: string; full_name: string; total_xp: number };

export function ProgressScreen() {
  const { profile, level, badges } = useUser();
  const [tab, setTab] = useState("levels");
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    api
      .leaderboard()
      .then((res) => setRows((res.data ?? []).slice(0, 8)))
      .catch(() => setRows([]));
  }, []);

  return (
    <section className="space-y-4">
      <SectionHeader title="Progress" subtitle="Levels, badges, and rankings" />

      <MobileCard>
        <p className="text-sm text-cream/80">Current XP</p>
        <p className="text-3xl font-bold text-gold">{profile?.total_xp ?? 0}</p>
        <p className="text-teal">Level: {level}</p>
      </MobileCard>

      <TabSwitcher
        items={[
          { value: "levels", label: "Levels" },
          { value: "badges", label: "Badges" },
          { value: "rank", label: "Ranking" },
        ]}
        value={tab}
        onValueChange={setTab}
      />

      {tab === "levels" ? (
        <div className="space-y-2">
          {tiers.map((tier) => {
            const active = level === tier.name;
            return (
              <div
                key={tier.name}
                className={`rounded-xl border px-3 py-3 ${active ? "border-gold bg-gold/10" : "border-white/10 bg-black/20"}`}
              >
                {tier.name} ({tier.min}-{tier.max === Infinity ? "3500+" : tier.max} XP)
              </div>
            );
          })}
        </div>
      ) : null}

      {tab === "badges" ? (
        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge) => (
            <MobileCard key={badge.name} className={badge.unlocked ? "border-gold" : "opacity-85"}>
              <p className="text-2xl">{badge.icon}</p>
              <p className="mt-1 font-semibold">{badge.name}</p>
              <p className="text-xs text-cream/70">Unlock at {badge.threshold} XP</p>
            </MobileCard>
          ))}
        </div>
      ) : null}

      {tab === "rank" ? (
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={row.id} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
              <div className="flex items-center justify-between">
                <span>
                  #{i + 1} {row.full_name}
                </span>
                <span>{row.total_xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
