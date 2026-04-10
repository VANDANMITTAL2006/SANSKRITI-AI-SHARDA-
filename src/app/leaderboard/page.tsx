"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/apiClient";
import { useUser } from "../lib/userContext";
import { SectionHeader } from "@/components/mobile/SectionHeader";
import { useLang } from "@/lib/languageContext";

type Entry = { id: string; full_name: string; total_xp: number };

const syntheticRows: Entry[] = [
  { id: "syn-1", full_name: "Aarav Explorer", total_xp: 3820 },
  { id: "syn-2", full_name: "Meera Heritage", total_xp: 3410 },
  { id: "syn-3", full_name: "Kabir Nomad", total_xp: 2985 },
  { id: "syn-4", full_name: "Isha Trails", total_xp: 2510 },
  { id: "syn-5", full_name: "Rohan Vista", total_xp: 2290 },
  { id: "syn-6", full_name: "Anaya Culture", total_xp: 2015 },
  { id: "syn-7", full_name: "Dev Landmark", total_xp: 1880 },
  { id: "syn-8", full_name: "Naina Routes", total_xp: 1660 },
  { id: "syn-9", full_name: "Vihaan Quest", total_xp: 1490 },
  { id: "syn-10", full_name: "Zoya Heritage", total_xp: 1325 },
];

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Entry[]>([]);
  const [isSynthetic, setIsSynthetic] = useState(false);
  const [forceSynthetic, setForceSynthetic] = useState(false);
  const { profile } = useUser();
  const { t, lang } = useLang();

  const fetchRows = async () => {
    if (forceSynthetic) {
      setRows(syntheticRows);
      setIsSynthetic(true);
      return;
    }

    try {
      const res = await api.leaderboard();
      const apiRows = (res.data ?? []).slice(0, 50) as Entry[];
      if (apiRows.length > 0) {
        setRows(apiRows);
        setIsSynthetic(false);
      } else {
        setRows(syntheticRows);
        setIsSynthetic(true);
      }
    } catch {
      setRows(syntheticRows);
      setIsSynthetic(true);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceSynthetic]);

  const podium = useMemo(() => rows.slice(0, 3), [rows]);

  return (
    <section className={`space-y-5 ${lang === "hi" ? "lang-hi" : ""}`}>
      <div className="flex items-center justify-between">
        <SectionHeader title={t("leaderboard")} subtitle={t("top50Explorers")} />
        <div className="flex items-center gap-2">
          <button
            className={`min-h-[36px] rounded-xl px-3 py-2 text-xs ${
              forceSynthetic ? "bg-amber-500/20 text-amber-200" : "bg-white/10"
            }`}
            onClick={() => setForceSynthetic((v) => !v)}
          >
            {forceSynthetic ? t("syntheticOn") : t("syntheticOff")}
          </button>
          <button className="min-h-[44px] rounded-xl bg-white/10 px-3 py-2 text-sm" onClick={fetchRows}>
            {t("refresh")}
          </button>
        </div>
      </div>

      {isSynthetic ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          {lang === "hi"
            ? "बैकएंड रैंकिंग उपलब्ध न होने पर सिंथेटिक लीडरबोर्ड डेटा दिखाया जा रहा है।"
            : "Showing synthetic leaderboard data while backend rankings are unavailable."}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-3">
        {podium.map((p, i) => (
          <div key={p.id} className="rounded-2xl border border-white/10 bg-[var(--bg-card)]/70 p-4">
            <p className="text-xs text-cream/70">#{i + 1}</p>
            <p className="font-semibold">{p.full_name}</p>
            <p className="text-gold">{p.total_xp} XP</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {rows.map((r, idx) => {
          const mine = profile?.id === r.id;
          return (
            <div
              key={r.id}
              className={`rounded-lg border px-3 py-2 ${mine ? "border-gold bg-gold/10" : "border-white/10 bg-black/20"}`}
            >
              <div className="flex items-center justify-between text-sm">
                <span>
                  #{idx + 1} {r.full_name} {mine ? (lang === "hi" ? "(आप)" : "(YOU)") : ""}
                </span>
                <span>{r.total_xp} XP</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
