"use client";

import Link from "next/link";
import { MobileCard } from "@/components/mobile/MobileCard";
import { SectionHeader } from "@/components/mobile/SectionHeader";
import { useLang } from "@/lib/languageContext";

export default function AIHubPage() {
  const { t, lang } = useLang();

  return (
    <section className="space-y-4">
      <SectionHeader
        title={t("ai")}
        subtitle={lang === "hi" ? "चैट, पहचान और वॉइस मार्गदर्शन" : "Chat, recognition, and voice guidance"}
      />

      <Link href="/chat">
        <MobileCard className="transition hover:border-teal">
          <h3 className="font-semibold text-gold">{t("chat")}</h3>
          <p className="mt-1 text-sm text-cream/75">
            {lang === "hi"
              ? "फुल-स्क्रीन चैट अनुभव में स्मारकों से जुड़े सवाल पूछें।"
              : "Ask monument questions in a full-screen chat experience."}
          </p>
        </MobileCard>
      </Link>

      <Link href="/recognition">
        <MobileCard className="transition hover:border-rust">
          <h3 className="font-semibold text-gold">{t("recognition")}</h3>
          <p className="mt-1 text-sm text-cream/75">
            {lang === "hi"
              ? "अपलोड और कैमरा टैब के साथ एकीकृत स्क्रीन।"
              : "Single merged screen with Upload and Camera tabs."}
          </p>
        </MobileCard>
      </Link>
    </section>
  );
}
