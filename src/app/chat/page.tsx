"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import { useAudioGuide } from "@/hooks/useAudioGuide";
import { useVapi } from "@/hooks/useVapi";
import { toast } from "sonner";
import { SectionHeader } from "@/components/mobile/SectionHeader";
import { useLang } from "@/lib/languageContext";

type Msg = { role: "user" | "assistant"; text: string };
const CACHE_MS = 5 * 60 * 1000;
const cache = new Map<string, { ts: number; answer: string }>();

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [monumentId, setMonumentId] = useState("taj-mahal");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const { speak, stopSpeaking } = useAudioGuide();
  const { startCall, endCall } = useVapi();
  const { t, lang } = useLang();

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setMessages((m) => [...m, { role: "user", text: question }]);

    const key = `${monumentId}:${question.trim().toLowerCase()}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.ts < CACHE_MS) {
      setMessages((m) => [...m, { role: "assistant", text: hit.answer }]);
      setLoading(false);
      return;
    }

    try {
      const res = await api.askChat(question, monumentId);
      const answer = res.data?.answer ?? res.data?.text ?? "No response available.";
      cache.set(key, { ts: Date.now(), answer });
      setMessages((m) => [...m, { role: "assistant", text: answer }]);
      speak(answer);
    } catch {
      toast.error("Chat service unavailable right now.");
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  const startVoiceInput = () => {
    type RecognitionLike = {
      lang: string;
      onresult: ((event: Event) => void) | null;
      start: () => void;
    };

    type RecognitionCtor = new () => RecognitionLike;

    const Api =
      typeof window !== "undefined"
        ? ((window as Window & {
            webkitSpeechRecognition?: RecognitionCtor;
            SpeechRecognition?: RecognitionCtor;
          }).webkitSpeechRecognition ??
            (window as Window & { SpeechRecognition?: RecognitionCtor }).SpeechRecognition)
        : undefined;

    if (!Api) {
      toast.info("Voice input works in Chrome/Edge over HTTPS.");
      return;
    }

    const recognition = new Api();
    recognition.lang = "en-IN";
    recognition.onresult = (event: Event) => {
      const results = (event as Event & { results?: ArrayLike<ArrayLike<{ transcript: string }>> })
        .results;
      const transcript = results?.[0]?.[0]?.transcript ?? "";
      setQuestion(transcript);
    };
    recognition.start();
  };

  return (
    <section className={`flex min-h-[calc(100vh-8.5rem)] flex-col ${lang === "hi" ? "lang-hi" : ""}`}>
      <SectionHeader
        title={t("chat")}
        subtitle={lang === "hi" ? "वॉइस-फर्स्ट स्मारक वार्तालाप" : "Voice-first monument conversations"}
      />

      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[var(--bg-card)]/70 p-3">
        <select
          value={monumentId}
          onChange={(e) => setMonumentId(e.target.value)}
          className="min-h-[44px] rounded-xl bg-black/25 px-3"
        >
          <option value="taj-mahal">Taj Mahal</option>
          <option value="red-fort">Red Fort</option>
          <option value="qutub-minar">Qutub Minar</option>
        </select>
        <button className="min-h-[44px] rounded-xl bg-teal px-3 text-black" onClick={startVoiceInput}>
          {t("voice")}
        </button>
        <button className="min-h-[44px] rounded-xl bg-gold px-3 text-black" onClick={() => startCall()}>
          {t("call")}
        </button>
        <button className="min-h-[44px] rounded-xl bg-rust px-3 text-black" onClick={() => endCall()}>
          {t("end")}
        </button>
        <button className="min-h-[44px] rounded-xl bg-white/10 px-3" onClick={stopSpeaking}>
          {t("stop")}
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4">
        {messages.length === 0 && (
          <p className="text-sm text-cream/70">
            {lang === "hi" ? "उदाहरण: \"ताज महल किसने बनवाया?\"" : 'Try: "Who built the Taj Mahal?"'}
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            className={`max-w-[85%] rounded-xl p-3 text-sm ${
              m.role === "user" ? "ml-auto bg-teal/30" : "bg-[var(--bg-card)]"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="sticky bottom-[84px] mt-3 flex gap-2 rounded-2xl border border-white/10 bg-[#120d27]/90 p-2 backdrop-blur">
        <input
          className="min-h-[48px] flex-1 rounded-xl bg-[var(--bg-card)] px-3"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t("askPlaceholder")}
        />
        <button
          className="glow min-h-[48px] min-w-[110px] rounded-xl bg-gold font-semibold text-black"
          disabled={loading}
          onClick={ask}
        >
          {loading ? t("asking") : t("send")}
        </button>
      </div>
    </section>
  );
}
