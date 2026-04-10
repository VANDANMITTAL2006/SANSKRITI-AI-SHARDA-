"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileCard } from "@/components/mobile/MobileCard";
import { SectionHeader } from "@/components/mobile/SectionHeader";
import { useAuth } from "@/lib/authContext";
import { useUser } from "@/lib/userContext";
import { api } from "@/lib/apiClient";
import { useLang } from "@/lib/languageContext";

type Row = { id: string; full_name: string; total_xp: number };

export default function ProfileHubPage() {
  const { user } = useAuth();
  const { profile, level } = useUser();
  const { t, lang } = useLang();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    api.leaderboard().then((res) => setRows((res.data ?? []).slice(0, 5))).catch(() => setRows([]));
  }, []);

  return (
    <section className="space-y-4">
      <SectionHeader
        title={t("profile")}
        subtitle={lang === "hi" ? "प्रगति, रैंकिंग और अकाउंट" : "Progress, rankings, and account"}
      />

      <MobileCard>
        <p className="text-xs text-cream/70">{t("signedInAs")}</p>
        <p className="text-sm">{user?.email ?? t("guest")}</p>
        <p className="mt-2 font-serif text-xl text-gold">{level}</p>
        <p className="text-teal">{profile?.total_xp ?? 0} XP</p>
      </MobileCard>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/achievements">
          <MobileCard className="h-full">
            <p className="font-semibold text-gold">{t("progress")}</p>
            <p className="mt-1 text-xs text-cream/70">
              {lang === "hi" ? "बैज + उपलब्धियां" : "Badges + achievements"}
            </p>
          </MobileCard>
        </Link>
        <Link href="/auth">
          <MobileCard className="h-full">
            <p className="font-semibold text-gold">{t("auth")}</p>
            <p className="mt-1 text-xs text-cream/70">
              {lang === "hi" ? "साइन इन/अप मैनेज करें" : "Manage sign in/up"}
            </p>
          </MobileCard>
        </Link>
      </div>

      <MobileCard>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-gold">{t("topExplorers")}</h3>
          <Link href="/leaderboard" className="text-xs text-teal">
            {t("viewAll")}
          </Link>
        </div>
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={row.id} className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2 text-sm">
              <span>
                #{index + 1} {row.full_name}
              </span>
              <span>{row.total_xp} XP</span>
            </div>
          ))}
        </div>
      </MobileCard>
    </section>
  );
}
