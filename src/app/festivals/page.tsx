"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/mobile/SectionHeader";
import { useLang } from "@/lib/languageContext";

type Festival = {
  id: string;
  name: string;
  type: "National" | "Religious" | "Cultural";
  month: number;
  day: number;
  monument: string;
  history: string;
  tips: string;
};

const festivals: Festival[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `f-${i + 1}`,
  name: ["Diwali", "Holi", "Eid", "Navratri", "Pongal", "Baisakhi"][i % 6] + ` ${i + 1}`,
  type: (["National", "Religious", "Cultural"] as const)[i % 3],
  month: ((i % 12) + 1),
  day: ((i % 27) + 1),
  monument: ["Taj Mahal", "Red Fort", "Qutub Minar"][i % 3],
  history: "A major Indian celebration with layered historical and regional narratives.",
  tips: "Arrive early, dress respectfully, and support local artisans.",
}));

export default function FestivalsPage() {
  const [filter, setFilter] = useState<"All" | Festival["type"]>("All");
  const { t, lang } = useLang();

  const list = useMemo(
    () => festivals.filter((f) => filter === "All" || f.type === filter),
    [filter],
  );

  const daysLeft = (month: number, day: number) => {
    const now = new Date();
    const next = new Date(now.getFullYear(), month - 1, day);
    if (next < now) next.setFullYear(next.getFullYear() + 1);
    return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <section className={`space-y-4 ${lang === "hi" ? "lang-hi" : ""}`}>
      <SectionHeader
        title={t("festivals")}
        subtitle={lang === "hi" ? "प्रकार के अनुसार फ़िल्टर करें और स्मारक-आधारित उत्सव देखें" : "Filter by type and discover monument-linked celebrations"}
      />
      <div className="flex flex-wrap gap-2">
        {["All", "National", "Religious", "Cultural"].map((x) => (
          <button
            key={x}
            className="min-h-[40px] rounded-full bg-white/10 px-4 py-2 text-sm"
            onClick={() => setFilter(x as "All" | Festival["type"])}
          >
            {x === "All"
              ? t("all")
              : x === "National"
                ? t("national")
                : x === "Religious"
                  ? t("religious")
                  : t("cultural")}
          </button>
        ))}
      </div>

      <Accordion.Root type="single" collapsible className="space-y-2">
        {list.map((f) => (
          <Accordion.Item
            key={f.id}
            value={f.id}
            className="rounded-xl border border-white/10 bg-[var(--bg-card)]/70"
          >
            <Accordion.Trigger className="flex w-full items-center justify-between px-4 py-3 text-left">
              <span>{f.name}</span>
              <span className="rounded-full bg-gold/20 px-2 py-1 text-xs text-gold">
                {daysLeft(f.month, f.day)} {t("days")}
              </span>
            </Accordion.Trigger>
            <Accordion.Content className="space-y-2 px-4 pb-4 text-sm text-cream/80">
              <p>
                <strong>{t("type")}:</strong> {f.type}
              </p>
              <p>
                <strong>{t("monument")}:</strong> {f.monument}
              </p>
              <p>{f.history}</p>
              <p>{f.tips}</p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}
