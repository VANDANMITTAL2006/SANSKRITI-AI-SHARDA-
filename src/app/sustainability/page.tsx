"use client";

import { SectionHeader } from "@/components/mobile/SectionHeader";
import { useLang } from "@/lib/languageContext";

const categories = {
  Environmental: [
    "Carry a refillable bottle",
    "Avoid single-use plastics",
    "Use shared mobility when possible",
    "Respect no-litter zones",
    "Choose local seasonal food",
  ],
  Cultural: [
    "Dress respectfully at sacred spaces",
    "Support local craft economies",
    "Ask before photographing people",
    "Learn key local greetings",
    "Read site history before visiting",
  ],
  Photography: [
    "Do not use flash in protected areas",
    "Stay behind safety barriers",
    "Avoid drone usage without permits",
    "Do not climb heritage structures",
    "Share context with your photos",
  ],
} as const;

const sanskritQuote = "वसुधैव कुटुम्बकम्";

export default function SustainabilityPage() {
  const { t, lang } = useLang();

  const label = (name: string) => {
    if (name === "Environmental") return lang === "hi" ? "पर्यावरण" : "Environmental";
    if (name === "Cultural") return lang === "hi" ? "सांस्कृतिक" : "Cultural";
    return lang === "hi" ? "फोटोग्राफी" : "Photography";
  };

  return (
    <section className={`space-y-5 ${lang === "hi" ? "lang-hi" : ""}`}>
      <SectionHeader
        title={t("sustainability")}
        subtitle={lang === "hi" ? "SDG 11 और SDG 17 के अनुरूप जिम्मेदार यात्रा" : "Responsible travel aligned with SDG 11 and SDG 17"}
      />
      <p className="rounded-xl border border-white/10 bg-[var(--bg-card)]/70 p-4 text-sm text-cream/90">
        {sanskritQuote} - {lang === "hi" ? "दुनिया एक परिवार है। SDG 11 और SDG 17 के अनुरूप।" : "The world is one family. Aligned with SDG 11 and SDG 17."}
      </p>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {Object.entries(categories).map(([name, tips]) => (
          <div key={name} className="rounded-xl border border-white/10 bg-[var(--bg-card)]/70 p-4">
            <h2 className="font-semibold text-teal">{label(name)}</h2>
            <ul className="mt-2 space-y-2 text-sm text-cream/85">
              {tips.map((tip) => (
                <li key={tip}>- {tip}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
