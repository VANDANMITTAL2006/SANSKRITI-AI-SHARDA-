"use client";

import { monuments } from "@/lib/monumentStore";
import { haversineMeters } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDemoMode } from "@/lib/demoModeContext";
import { useUser } from "../../lib/userContext";
import { useAudioGuide } from "@/hooks/useAudioGuide";
import { useVapi } from "@/hooks/useVapi";
import { nextTourPosition, playTourCue, waitMs } from "@/lib/tourEngine";
import { SectionHeader } from "@/components/mobile/SectionHeader";
import { useLang } from "@/lib/languageContext";

export default function HuntPage() {
  const [monumentId, setMonumentId] = useState("taj-mahal");
  const [huntIndex, setHuntIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(0);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [demoArrived, setDemoArrived] = useState(false);
  const [demoSolved, setDemoSolved] = useState(false);
  const [tourStage, setTourStage] = useState<"intro" | "walking" | "arrived" | "complete">("intro");
  const { addXpLocal } = useUser();
  const toast = useToast();
  const { stop: stopSpeech } = useAudioGuide();
  const { startCall, stopCall } = useVapi();
  const { isDemoMode, getDemoLocation } = useDemoMode();
  const { t, lang } = useLang();
  const walkTickRef = useRef(0);
  const autoSolveLockRef = useRef(false);
  const startedNarrationRef = useRef(false);
  const solvedHuntsRef = useRef<string[]>([]);

  const monument = monuments.find((m) => m.id === monumentId) ?? monuments[0];
  const hunt = monument.hunts[huntIndex] ?? monument.hunts[0];

  const buildDemoStart = () => {
    const seed = getDemoLocation(monumentId) ?? monument.coordinates;
    return {
      lat: seed.lat - 0.0012,
      lng: seed.lng + 0.001,
    };
  };

  const speakTour = useCallback(
    (text: string) =>
      new Promise<void>((resolve) => {
        if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
        utterance.rate = 0.92;
        utterance.pitch = 1;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      }),
    [lang],
  );

  const findMe = () => {
    if (isDemoMode) {
      setLocation(getDemoLocation(monumentId));
      toast.success(lang === "hi" ? "डेमो स्थान सक्रिय किया गया" : "Demo location activated");
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  };

  const verify = async () => {
    if (!location) {
      return toast.info(
        isDemoMode
          ? lang === "hi"
            ? "डेमो मोड में पहले स्थान सक्रिय करें"
            : "Activate the demo location first"
          : lang === "hi"
            ? "पहले जीपीएस सक्षम करें"
            : "Enable GPS first",
      );
    }

    const distance = haversineMeters(
      location.lat,
      location.lng,
      hunt.coordinates.lat,
      hunt.coordinates.lng,
    );

    if (distance <= hunt.radius && selectedAnswer === hunt.answerIndex) {
      await addXpLocal(hunt.xp, monument.id);
      toast.success(lang === "hi" ? `पहेली हल हुई +${hunt.xp} XP` : `Riddle solved +${hunt.xp} XP`);
    } else {
      toast.error(
        lang === "hi" ? "गलत उत्तर या आप सुराग स्थान पर नहीं हैं" : "Incorrect answer or not at the clue location",
      );
    }
  };

  useEffect(() => {
    if (!isDemoMode) return;

    setLocation(buildDemoStart());
    setDemoArrived(false);
    setDemoSolved(false);
    setTourStage("intro");
    setSelectedAnswer(0);
    setHuntIndex(0);
    walkTickRef.current = 0;
    autoSolveLockRef.current = false;
    startedNarrationRef.current = false;
    solvedHuntsRef.current = [];
  }, [isDemoMode, monumentId]);

  useEffect(() => {
    if (!isDemoMode) {
      stopSpeech();
      void stopCall();
      return;
    }

    void startCall();

    return () => {
      stopSpeech();
      void stopCall();
    };
  }, [isDemoMode, startCall, stopCall, stopSpeech]);

  useEffect(() => {
    if (!isDemoMode || startedNarrationRef.current) return;

    startedNarrationRef.current = true;

    void (async () => {
      await playTourCue();
      await speakTour(`Let's begin our journey at ${hunt.location}.`);
      await waitMs(320);
      await speakTour(`Follow this direction: ${hunt.riddle}`);
      setTourStage("walking");
    })();
  }, [hunt.location, hunt.riddle, isDemoMode, speakTour]);

  useEffect(() => {
    if (!isDemoMode || demoSolved) return;

    const timer = window.setInterval(() => {
      walkTickRef.current += 1;

      setLocation((prev) => {
        const start = prev ?? buildDemoStart();

        return nextTourPosition(start, hunt.coordinates, walkTickRef.current, {
          easing: 0.09,
          curveScale: 0.00001,
          jitterScale: 0.000005,
          curveFrequency: 9,
        });
      });
    }, 140);

    return () => window.clearInterval(timer);
  }, [demoSolved, hunt.coordinates, isDemoMode, monumentId]);

  useEffect(() => {
    if (!isDemoMode || !location || demoSolved) return;

    const distance = haversineMeters(
      location.lat,
      location.lng,
      hunt.coordinates.lat,
      hunt.coordinates.lng,
    );

    if (distance > hunt.radius || autoSolveLockRef.current) return;

    autoSolveLockRef.current = true;
    setDemoArrived(true);
    setTourStage("arrived");
    setSelectedAnswer(hunt.answerIndex);

    window.setTimeout(async () => {
      await addXpLocal(hunt.xp, monument.id);
      setDemoSolved(true);
      setTourStage("complete");
      solvedHuntsRef.current = [...new Set([...solvedHuntsRef.current, hunt.id])];
      toast.success(lang === "hi" ? `हंट पूरा +${hunt.xp} XP` : `Hunt auto-completed +${hunt.xp} XP`);
      await waitMs(500);
      await playTourCue();
      await speakTour(
        lang === "hi"
          ? `${monument.name} के लिए गाइडेड हंट पूरा हुआ। अगले अनुभव की ओर बढ़ते हैं।`
          : `Guided hunt complete for ${monument.name}. Transitioning to the next experience.`,
      );

      if (huntIndex < monument.hunts.length - 1) {
        await waitMs(700);
        setHuntIndex((i) => i + 1);
        setDemoArrived(false);
        setDemoSolved(false);
        setSelectedAnswer(0);
        setTourStage("intro");
        autoSolveLockRef.current = false;
        startedNarrationRef.current = false;
      }
    }, 650);
  }, [addXpLocal, demoSolved, hunt.answerIndex, hunt.coordinates.lat, hunt.coordinates.lng, hunt.id, hunt.radius, hunt.xp, huntIndex, isDemoMode, lang, location, monument.hunts.length, monument.id, monument.name, speakTour, toast]);

  return (
    <section className={`space-y-4 rounded-2xl border border-white/10 bg-[var(--bg-card)]/70 p-5 ${lang === "hi" ? "lang-hi" : ""}`}>
      <SectionHeader
        title={t("hunt")}
        subtitle={lang === "hi" ? "वास्तविक स्थानों पर पहेलियाँ हल करें" : "Solve riddles at real locations"}
      />
      <select
        value={monumentId}
        onChange={(e) => {
          setMonumentId(e.target.value);
          setHuntIndex(0);
          setSelectedAnswer(0);
          setDemoArrived(false);
          setDemoSolved(false);
          setTourStage("intro");
          autoSolveLockRef.current = false;
          startedNarrationRef.current = false;
        }}
        className="min-h-[44px] rounded-xl bg-black/20 px-3"
      >
        {monuments.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      {isDemoMode ? (
        <div className="rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-3 py-2 text-xs text-[#C9A84C]">
          <p>
            {lang === "hi"
              ? "डेमो मोड चालू है: ऑटो-वॉक सुराग तक लेकर जाएगा।"
              : "Demo mode is on: auto-walk is guiding to the clue location."}
          </p>
          <p className="mt-1 text-[11px] text-[#E2C87D]">
            {lang === "hi"
              ? demoSolved
                ? "स्थिति: हंट पूरा"
                : demoArrived
                  ? "स्थिति: जवाब सबमिट हो रहा है"
                  : "स्थिति: लक्ष्य की ओर चल रहे हैं"
              : demoSolved
                ? "Status: Hunt completed"
                : demoArrived
                  ? "Status: Submitting answer"
                  : "Status: Walking toward target"}
          </p>
          <p className="mt-1 text-[11px] text-[#F5DFA3]">
            {lang === "hi"
              ? tourStage === "intro"
                ? "स्टेज: टूर परिचय"
                : tourStage === "walking"
                  ? "स्टेज: मार्गदर्शित वॉक"
                  : tourStage === "arrived"
                    ? "स्टेज: आगमन और सत्यापन"
                    : "स्टेज: टूर पूर्ण"
              : tourStage === "intro"
                ? "Stage: Tour intro"
                : tourStage === "walking"
                  ? "Stage: Guided walk"
                  : tourStage === "arrived"
                    ? "Stage: Arrival and verification"
                    : "Stage: Tour complete"}
          </p>
          <p className="mt-1 text-[11px] text-[#D8BE74]">
            {lang === "hi"
              ? `हंट प्रगति: ${Math.min(huntIndex + (demoSolved ? 1 : 0), monument.hunts.length)}/${monument.hunts.length}`
              : `Hunt progress: ${Math.min(huntIndex + (demoSolved ? 1 : 0), monument.hunts.length)}/${monument.hunts.length}`}
          </p>
        </div>
      ) : null}

      <p className="text-xs text-cream/60">
        {lang === "hi"
          ? `प्रश्न ${huntIndex + 1}/${monument.hunts.length}`
          : `Question ${huntIndex + 1}/${monument.hunts.length}`}
      </p>

      <p className="text-lg">{hunt.riddle}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {hunt.options.map((option, i) => (
          <button
            key={option}
            onClick={() => setSelectedAnswer(i)}
            className={`min-h-[44px] rounded-xl border px-3 text-left ${
              selectedAnswer === i ? "border-gold bg-gold/20" : "border-white/20"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="sticky bottom-[88px] flex gap-2 rounded-2xl border border-white/10 bg-[#120d27]/90 p-2">
        <button className="min-h-[46px] flex-1 rounded-xl bg-teal px-4 text-black" onClick={findMe}>
          {t("useGps")}
        </button>
        <button className="glow min-h-[46px] flex-1 rounded-xl bg-gold px-4 text-black" onClick={verify}>
          {lang === "hi" ? "हंट सत्यापित करें" : "Verify Hunt"}
        </button>
        {!isDemoMode && monument.hunts.length > 1 ? (
          <button
            className="min-h-[46px] rounded-xl border border-white/25 px-3 text-cream"
            onClick={() => {
              setHuntIndex((i) => (i + 1) % monument.hunts.length);
              setSelectedAnswer(0);
              setLocation(null);
              setDemoArrived(false);
              setDemoSolved(false);
              setTourStage("intro");
            }}
          >
            {lang === "hi" ? "अगला" : "Next"}
          </button>
        ) : null}
      </div>
    </section>
  );
}
