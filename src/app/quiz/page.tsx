"use client";

import { useEffect, useMemo, useState } from "react";
import { monuments } from "@/lib/monumentStore";
import { useUser } from "../../lib/userContext";
import { useToast } from "@/hooks/use-toast";
import { SectionHeader } from "@/components/mobile/SectionHeader";
import { useLang } from "@/lib/languageContext";

type Question = {
  monumentId: string;
  q: string;
  options: string[];
  answer: number;
  xp: number;
};

const bank: Record<string, Question[]> = {
  "taj-mahal": [
    { monumentId: "taj-mahal", q: "Who commissioned the Taj Mahal?", options: ["Akbar", "Shah Jahan", "Humayun", "Babur"], answer: 1, xp: 50 },
    { monumentId: "taj-mahal", q: "Which stone dominates its facade?", options: ["Granite", "Sandstone", "Marble", "Basalt"], answer: 2, xp: 50 },
    { monumentId: "taj-mahal", q: "The Taj Mahal sits near which river?", options: ["Ganga", "Yamuna", "Narmada", "Godavari"], answer: 1, xp: 45 },
  ],
  "red-fort": [
    { monumentId: "red-fort", q: "Red Fort is in which city?", options: ["Agra", "Jaipur", "Delhi", "Lucknow"], answer: 2, xp: 40 },
    { monumentId: "red-fort", q: "Who commissioned the Red Fort?", options: ["Aurangzeb", "Akbar", "Shah Jahan", "Jahangir"], answer: 2, xp: 45 },
    { monumentId: "red-fort", q: "What is the main ceremonial entrance called?", options: ["Ajmeri Gate", "Lahori Gate", "Kashmiri Gate", "Delhi Gate"], answer: 1, xp: 45 },
  ],
  "qutub-minar": [
    { monumentId: "qutub-minar", q: "Qutub Minar is primarily a?", options: ["Minaret", "Temple", "Palace", "Gate"], answer: 0, xp: 40 },
    { monumentId: "qutub-minar", q: "Qutub Minar complex is in which city?", options: ["Kolkata", "Delhi", "Agra", "Hyderabad"], answer: 1, xp: 40 },
    { monumentId: "qutub-minar", q: "Which famous pillar is in the Qutub complex?", options: ["Ashoka Pillar", "Iron Pillar", "Victory Pillar", "Lotus Pillar"], answer: 1, xp: 50 },
  ],
};

const allQuestions: Question[] = [
  ...bank["taj-mahal"],
  ...bank["red-fort"],
  ...bank["qutub-minar"],
];

const shuffledIndices = (length: number) => {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const sequentialIndices = (length: number) => Array.from({ length }, (_, i) => i);

export default function QuizPage() {
  const [monumentId, setMonumentId] = useState("all");
  const [index, setIndex] = useState(0);
  const [order, setOrder] = useState<number[]>(sequentialIndices(allQuestions.length));
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const { addXpLocal } = useUser();
  const toast = useToast();
  const { t, lang } = useLang();

  const questions = useMemo(() => {
    if (monumentId === "all") return allQuestions;
    return bank[monumentId] ?? bank["taj-mahal"];
  }, [monumentId]);

  useEffect(() => {
    setOrder(shuffledIndices(questions.length));
    setIndex(0);
    setSelected(null);
  }, [questions]);

  const current = questions[order[index] ?? 0];
  const currentMonumentName = monuments.find((m) => m.id === current.monumentId)?.name ?? "Monument";

  const next = async () => {
    if (selected === null) return;
    if (selected === current.answer) {
      const nextScore = score + 1;
      setScore(nextScore);
      await addXpLocal(current.xp, current.monumentId);
      toast.success(`Correct! +${current.xp} XP`);
    } else {
      toast.error("Incorrect answer");
    }
    setSelected(null);

    if (index >= questions.length - 1) {
      setIndex(0);
      setOrder(shuffledIndices(questions.length));
      toast.info(lang === "hi" ? "नया क्विज़ राउंड शुरू" : "New quiz round started");
      return;
    }

    setIndex((i) => i + 1);
  };

  return (
    <section className={`space-y-4 rounded-2xl border border-white/10 bg-[var(--bg-card)]/70 p-5 ${lang === "hi" ? "lang-hi" : ""}`}>
      <SectionHeader
        title={t("quiz")}
        subtitle={lang === "hi" ? "उत्तर दें, XP कमाएं और लेवल बढ़ाएं" : "Answer, earn XP, and level up"}
      />
      <select
        value={monumentId}
        onChange={(e) => {
          const nextMonumentId = e.target.value;
          const nextQuestions = nextMonumentId === "all" ? allQuestions : bank[nextMonumentId] ?? bank["taj-mahal"];

          setMonumentId(nextMonumentId);
          setOrder(shuffledIndices(nextQuestions.length));
          setIndex(0);
          setSelected(null);
          setScore(0);
        }}
        className="min-h-[44px] rounded-xl bg-black/20 px-3"
      >
        <option value="all">All Monuments</option>
        {monuments.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <p className="text-sm text-cream/70">{t("score")}: {score}</p>
      <p className="text-xs text-teal">{currentMonumentName}</p>
      <h2 className="text-lg">{current.q}</h2>
      <div className="grid gap-2">
        {current.options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => setSelected(i)}
            className={`min-h-[44px] rounded-xl border px-3 text-left ${
              selected === i ? "border-gold bg-gold/20" : "border-white/20"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <button className="glow min-h-[46px] rounded-xl bg-gold px-4 text-black" onClick={next}>
        {t("submit")}
      </button>
    </section>
  );
}
