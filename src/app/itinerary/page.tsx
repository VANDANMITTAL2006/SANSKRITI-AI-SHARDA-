"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import { monuments } from "@/lib/monumentStore";
import { useToast } from "@/hooks/use-toast";
import { SectionHeader } from "@/components/mobile/SectionHeader";
import { useLang } from "@/lib/languageContext";

const cities = [
  "Delhi",
  "Agra",
  "Jaipur",
  "Varanasi",
  "Udaipur",
  "Lucknow",
  "Mumbai",
  "Kolkata",
  "Chennai",
  "Bengaluru",
  "Hyderabad",
  "Amritsar",
  "Mysuru",
  "Kochi",
  "Pune",
  "Ahmedabad",
  "Bhopal",
  "Guwahati",
];

const hotels: Record<string, string[]> = Object.fromEntries(cities.map((c) => [c, [`${c} Residency`, `${c} Palace`, `${c} Inn`]]));

export default function ItineraryPage() {
  const [city, setCity] = useState("Delhi");
  const [days, setDays] = useState(3);
  const [result, setResult] = useState<string[]>([]);
  const toast = useToast();
  const { t, lang } = useLang();

  const build = async () => {
    try {
      const res = await api.itinerary(monuments[0].id, days);
      const plan = res.data?.days as string[] | undefined;
      setResult(plan ?? Array.from({ length: days }).map((_, i) => `${t("day")} ${i + 1}: ${city}`));
    } catch {
      setResult(Array.from({ length: days }).map((_, i) => `${t("day")} ${i + 1}: ${city}`));
    }

    try {
      await api.leadCapture({
        user_name: "Anonymous",
        user_email: "",
        user_phone: "",
        hotel_name: hotels[city][0],
        hotel_phone: "",
        city,
        monument: monuments[0].name,
        days,
      });
    } catch {
      toast.info(
        lang === "hi"
          ? "लीड API उपलब्ध नहीं है; स्थानीय यात्रा योजना फिर भी बनाई गई।"
          : "Lead API not reachable; local itinerary still generated.",
      );
    }
  };

  return (
    <section className={`space-y-4 ${lang === "hi" ? "lang-hi" : ""}`}>
      <SectionHeader
        title={lang === "hi" ? "यात्रा योजनाकार" : "Trip Planner"}
        subtitle={lang === "hi" ? "1-7 दिन की शहर यात्रा योजना बनाएं" : "Build 1-7 day city itineraries"}
      />
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-[var(--bg-card)]/70 p-4">
        <select value={city} onChange={(e) => setCity(e.target.value)} className="min-h-[44px] rounded-xl bg-black/20 px-3">
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          max={7}
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="min-h-[44px] rounded-xl bg-black/20 px-3"
        />
        <button className="glow min-h-[46px] rounded-xl bg-gold text-black" onClick={build}>
          {t("generateItinerary")}
        </button>
      </div>

      <div className="grid gap-2">
        {result.map((line) => (
          <div key={line} className="rounded-lg bg-black/20 p-3 text-sm">
            {line}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-[var(--bg-card)]/70 p-4">
        <h2 className="font-semibold text-teal">{t("hotelSuggestions")}</h2>
        <ul className="mt-2 space-y-1 text-sm text-cream/80">
          {hotels[city].map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
