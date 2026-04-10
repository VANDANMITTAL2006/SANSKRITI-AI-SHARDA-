"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { monuments } from "@/lib/monumentStore";
import { bearingDegrees, haversineMeters } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useDemoMode } from "@/lib/demoModeContext";
import { useUser } from "../../lib/userContext";
import { useAudioGuide } from "@/hooks/useAudioGuide";
import { useVapi } from "@/hooks/useVapi";
import { nextTourPosition, playTourCue, waitMs } from "@/lib/tourEngine";
import { SectionHeader } from "@/components/mobile/SectionHeader";
import { FloatingCTA } from "@/components/mobile/FloatingCTA";
import { useLang } from "@/lib/languageContext";

const MapComponent = dynamic(() => import("@/components/LeafletZonesMap"), { ssr: false });

export default function ExplorePage() {
  const [monumentId, setMonumentId] = useState("taj-mahal");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [demoZoneIndex, setDemoZoneIndex] = useState(0);
  const [demoCleared, setDemoCleared] = useState<string[]>([]);
  const [tourStage, setTourStage] = useState<"intro" | "walking" | "arrived" | "transition" | "complete">("intro");
  const toast = useToast();
  const { addXpLocal } = useUser();
  const { stop: stopSpeech } = useAudioGuide();
  const { startCall, stopCall } = useVapi();
  const { isDemoMode, getDemoLocation } = useDemoMode();
  const { t, lang } = useLang();
  const walkTickRef = useRef(0);
  const isAutoCheckingInRef = useRef(false);
  const narratedZoneRef = useRef<string | null>(null);
  const narrationBusyRef = useRef(false);

  const monument = useMemo(
    () => monuments.find((m) => m.id === monumentId) ?? monuments[0],
    [monumentId],
  );

  const currentDemoZone = monument.zones[demoZoneIndex] ?? null;

  const buildDemoStart = () => {
    const seed = getDemoLocation(monumentId) ?? monument.coordinates;
    return {
      lat: seed.lat - 0.0014,
      lng: seed.lng - 0.0011,
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

  const locate = () => {
    if (isDemoMode) {
      setLocation(getDemoLocation(monumentId));
      toast.success(lang === "hi" ? "डेमो स्थान सक्रिय किया गया" : "Demo location activated");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => toast.error("Unable to read GPS location"),
      { enableHighAccuracy: true },
    );
  };

  const claim = async (zoneId: string) => {
    if (!location) {
      toast.info(isDemoMode ? (lang === "hi" ? "डेमो मोड में लोकेशन सेट करें" : "Activate the demo location first") : (lang === "hi" ? "पहले लोकेशन सक्षम करें" : "Enable location first"));
      return;
    }
    const zone = monument.zones.find((z) => z.id === zoneId);
    if (!zone) return;

    const distance = haversineMeters(
      location.lat,
      location.lng,
      zone.coordinates.lat,
      zone.coordinates.lng,
    );
    if (distance <= zone.radius) {
      await addXpLocal(zone.xp, monument.id);
      toast.success(`Zone cleared +${zone.xp} XP`);
    } else {
      toast.error(`You are ${Math.round(distance)}m away from ${zone.name}`);
    }
  };

  useEffect(() => {
    if (!isDemoMode) return;

    setDemoZoneIndex(0);
    setDemoCleared([]);
    setExpanded(null);
    setLocation(buildDemoStart());
    setTourStage("intro");
    walkTickRef.current = 0;
    isAutoCheckingInRef.current = false;
    narratedZoneRef.current = null;
    narrationBusyRef.current = false;
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
    if (!isDemoMode || !currentDemoZone || demoCleared.includes(currentDemoZone.id)) return;
    if (narratedZoneRef.current === currentDemoZone.id || narrationBusyRef.current) return;

    narratedZoneRef.current = currentDemoZone.id;
    narrationBusyRef.current = true;
    setTourStage("intro");

    void (async () => {
      await playTourCue();
      await speakTour(`Let's begin our journey at ${currentDemoZone.name}.`);
      await waitMs(300);
      await speakTour(currentDemoZone.directionHint);
      setTourStage("walking");
      narrationBusyRef.current = false;
    })();
  }, [currentDemoZone, demoCleared, isDemoMode, speakTour]);

  useEffect(() => {
    if (!isDemoMode || !currentDemoZone) return;

    const timer = window.setInterval(() => {
      walkTickRef.current += 1;

      setLocation((prev) => {
        const start = prev ?? buildDemoStart();

        return nextTourPosition(start, currentDemoZone.coordinates, walkTickRef.current, {
          easing: 0.08,
          curveScale: 0.000012,
          jitterScale: 0.000006,
          curveFrequency: 10,
        });
      });
    }, 150);

    return () => window.clearInterval(timer);
  }, [isDemoMode, currentDemoZone, monumentId]);

  useEffect(() => {
    if (!isDemoMode || !location || !currentDemoZone) return;

    const dist = haversineMeters(
      location.lat,
      location.lng,
      currentDemoZone.coordinates.lat,
      currentDemoZone.coordinates.lng,
    );

    if (dist > currentDemoZone.radius || isAutoCheckingInRef.current) return;

    isAutoCheckingInRef.current = true;

    (async () => {
      setTourStage("arrived");
      await addXpLocal(currentDemoZone.xp, monument.id);
      setExpanded(currentDemoZone.id);
      setDemoCleared((prev) => (prev.includes(currentDemoZone.id) ? prev : [...prev, currentDemoZone.id]));

      toast.success(
        lang === "hi"
          ? `${currentDemoZone.name} क्लियर +${currentDemoZone.xp} XP`
          : `${currentDemoZone.name} cleared +${currentDemoZone.xp} XP`,
      );

      await speakTour(currentDemoZone.arrivalFact);
      await waitMs(700);

      const isLast = demoZoneIndex >= monument.zones.length - 1;
      if (isLast) {
        toast.success(lang === "hi" ? "पूरा वॉकथ्रू पूरा हुआ" : "Full walkthrough completed");
        setTourStage("complete");
        await playTourCue();
        await speakTour(
          lang === "hi"
            ? "हमारी ऑटो गाइडेड टूर यात्रा पूरी हुई।"
            : "Our automated guided tour is now complete.",
        );
      } else {
        setTourStage("transition");
        const nextZone = monument.zones[demoZoneIndex + 1];
        if (nextZone) {
          await speakTour(
            lang === "hi"
              ? `अब हम अगले ज़ोन ${nextZone.name} की ओर बढ़ते हैं।`
              : `Great. Now transitioning to ${nextZone.name}.`,
          );
        }

        await waitMs(900);
        setDemoZoneIndex((idx) => idx + 1);
        isAutoCheckingInRef.current = false;
      }
    })();
  }, [addXpLocal, currentDemoZone, demoZoneIndex, isDemoMode, lang, location, monument.id, monument.zones, monument.zones.length, speakTour, toast]);

  return (
    <section className={`space-y-4 ${lang === "hi" ? "lang-hi" : ""}`}>
      <SectionHeader
        title={t("explore")}
        subtitle={lang === "hi" ? "मैप ज़ोन, दिशा और ऑन-साइट चेक-इन" : "Map zones, bearings, and on-site check-ins"}
      />

      <div className="flex flex-wrap gap-2">
        <select
          value={monumentId}
          onChange={(e) => setMonumentId(e.target.value)}
          className="min-h-[44px] flex-1 rounded-xl bg-[var(--bg-card)] px-3"
        >
          {monuments.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {isDemoMode ? (
        <div className="rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-3 py-2 text-xs text-[#C9A84C]">
          <p>
            {lang === "hi"
              ? "डेमो मोड चालू है: ऑटो-वॉक सभी ज़ोन तक खुद चलेगा।"
              : "Demo mode is on: auto-walk is guiding through all zones."}
          </p>
          <p className="mt-1 text-[11px] text-[#E2C87D]">
            {lang === "hi"
              ? `प्रगति: ${Math.min(demoCleared.length + 1, monument.zones.length)}/${monument.zones.length} • लक्ष्य: ${currentDemoZone?.name ?? "पूरा"}`
              : `Progress: ${Math.min(demoCleared.length + 1, monument.zones.length)}/${monument.zones.length} • Target: ${currentDemoZone?.name ?? "Completed"}`}
          </p>
          <p className="mt-1 text-[11px] text-[#F5DFA3]">
            {lang === "hi"
              ? tourStage === "intro"
                ? "स्टेज: टूर परिचय"
                : tourStage === "walking"
                  ? "स्टेज: मार्गदर्शित वॉक"
                  : tourStage === "arrived"
                    ? "स्टेज: आगमन विवरण"
                    : tourStage === "transition"
                      ? "स्टेज: अगले ज़ोन की ओर ट्रांजिशन"
                      : "स्टेज: टूर पूर्ण"
              : tourStage === "intro"
                ? "Stage: Tour intro"
                : tourStage === "walking"
                  ? "Stage: Guided walk"
                  : tourStage === "arrived"
                    ? "Stage: Arrival story"
                    : tourStage === "transition"
                      ? "Stage: Zone transition"
                      : "Stage: Tour complete"}
          </p>
        </div>
      ) : null}

      <div className="relative">
        <MapComponent center={monument.coordinates} zones={monument.zones} />
      </div>

      <div className="space-y-3">
        {monument.zones.map((zone) => {
          const bearing = location
            ? Math.round(
                bearingDegrees(location.lat, location.lng, zone.coordinates.lat, zone.coordinates.lng),
              )
            : null;

          const isOpen = expanded === zone.id;

          return (
            <div key={zone.id} className="rounded-2xl border border-white/10 bg-[var(--bg-card)]/70 p-4">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : zone.id)}
                className="flex w-full items-center justify-between text-left"
              >
                <h3 className="font-semibold text-gold">{zone.name}</h3>
                <span className="text-xs text-teal">{isOpen ? t("hide") : t("details")}</span>
              </button>

              {isOpen ? (
                <div className="fade-in mt-3">
                  <p className="text-sm text-cream/80">{zone.arrivalFact}</p>
                  <p className="mt-1 text-xs text-cream/70">{t("hint")}: {zone.directionHint}</p>
                  <p className="mt-1 text-xs text-teal">{t("bearing")}: {bearing ?? "--"} deg</p>
                  <button
                    className="mt-3 min-h-[44px] rounded-xl bg-gold px-3 text-black"
                    onClick={() => claim(zone.id)}
                  >
                    {t("checkIn")} (+{zone.xp} XP)
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <FloatingCTA label={t("useGps")} onClick={locate} />
    </section>
  );
}
