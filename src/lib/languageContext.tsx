"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Lang } from "@/types";

type Dictionary = Record<string, { en: string; hi: string }>;

const dictionary: Dictionary = {
  welcome: { en: "Welcome to Sanskriti AI", hi: "संस्कृति एआई में आपका स्वागत है" },
  home: { en: "Home", hi: "होम" },
  play: { en: "Play", hi: "खेलें" },
  ai: { en: "AI", hi: "एआई" },
  profile: { en: "Profile", hi: "प्रोफाइल" },
  progress: { en: "Progress", hi: "प्रगति" },
  auth: { en: "Auth", hi: "ऑथ" },
  signOut: { en: "Sign out", hi: "साइन आउट" },
  viewAll: { en: "View all", hi: "सभी देखें" },
  guest: { en: "Guest", hi: "अतिथि" },
  currentLevel: { en: "Current Level", hi: "वर्तमान स्तर" },
  topExplorers: { en: "Top Explorers", hi: "शीर्ष एक्सप्लोरर" },
  quickActions: { en: "Quick Actions", hi: "त्वरित कार्य" },
  open: { en: "Open", hi: "खोलें" },
  signedInAs: { en: "Signed in as", hi: "लॉगिन यूज़र" },
  heritageDashboard: { en: "Heritage Dashboard", hi: "हेरिटेज डैशबोर्ड" },
  visited: { en: "Visited", hi: "देखे गए" },
  badges: { en: "Badges", hi: "बैज" },
  festivals: { en: "Festivals", hi: "त्योहार" },
  itinerary: { en: "Trip Planner", hi: "यात्रा योजना" },
  treasureHunt: { en: "Treasure Hunt", hi: "ट्रेजर हंट" },
  recognition: { en: "Recognition", hi: "पहचान" },
  authentication: { en: "Authentication", hi: "प्रमाणीकरण" },
  signIn: { en: "Sign In", hi: "साइन इन" },
  signUp: { en: "Sign Up", hi: "साइन अप" },
  continue: { en: "Continue", hi: "जारी रखें" },
  createAccount: { en: "Create Account", hi: "अकाउंट बनाएं" },
  fullName: { en: "Full name", hi: "पूरा नाम" },
  phone: { en: "Phone", hi: "फोन" },
  email: { en: "Email", hi: "ईमेल" },
  password: { en: "Password", hi: "पासवर्ड" },
  askPlaceholder: { en: "Ask about history, architecture, timings...", hi: "इतिहास, वास्तुकला, समय आदि पूछें..." },
  send: { en: "Send", hi: "भेजें" },
  asking: { en: "Asking...", hi: "पूछ रहे हैं..." },
  voice: { en: "Voice", hi: "आवाज" },
  call: { en: "Call", hi: "कॉल" },
  end: { en: "End", hi: "समाप्त" },
  stop: { en: "Stop", hi: "रोकें" },
  useGps: { en: "Use My GPS", hi: "मेरा जीपीएस उपयोग करें" },
  details: { en: "Details", hi: "विवरण" },
  hide: { en: "Hide", hi: "छुपाएं" },
  hint: { en: "Hint", hi: "संकेत" },
  bearing: { en: "Bearing", hi: "दिशा कोण" },
  checkIn: { en: "Check-in", hi: "चेक-इन" },
  score: { en: "Score", hi: "स्कोर" },
  submit: { en: "Submit", hi: "सबमिट" },
  verifyHunt: { en: "Verify Hunt", hi: "हंट सत्यापित करें" },
  syntheticOn: { en: "Synthetic: ON", hi: "सिंथेटिक: चालू" },
  syntheticOff: { en: "Synthetic: OFF", hi: "सिंथेटिक: बंद" },
  refresh: { en: "Refresh", hi: "रीफ्रेश" },
  top50Explorers: { en: "Top 50 explorers", hi: "शीर्ष 50 एक्सप्लोरर" },
  showingSynthetic: {
    en: "Showing synthetic leaderboard data while backend rankings are unavailable.",
    hi: "जब तक बैकएंड रैंकिंग उपलब्ध नहीं है, सिंथेटिक लीडरबोर्ड दिखाया जा रहा है।",
  },
  upload: { en: "Upload", hi: "अपलोड" },
  camera: { en: "Camera", hi: "कैमरा" },
  processingImage: { en: "Processing image...", hi: "छवि प्रोसेस हो रही है..." },
  tapToUpload: { en: "Tap to upload monument image", hi: "स्मारक की छवि अपलोड करने के लिए टैप करें" },
  startCamera: { en: "Start Camera", hi: "कैमरा शुरू करें" },
  stopCamera: { en: "Stop Camera", hi: "कैमरा बंद करें" },
  capture: { en: "Capture", hi: "कैप्चर" },
  analyzing: { en: "Analyzing...", hi: "विश्लेषण हो रहा है..." },
  confidence: { en: "Confidence", hi: "विश्वसनीयता" },
  generateItinerary: { en: "Generate Itinerary", hi: "यात्रा योजना बनाएं" },
  hotelSuggestions: { en: "Hotel Suggestions", hi: "होटल सुझाव" },
  all: { en: "All", hi: "सभी" },
  national: { en: "National", hi: "राष्ट्रीय" },
  religious: { en: "Religious", hi: "धार्मिक" },
  cultural: { en: "Cultural", hi: "सांस्कृतिक" },
  days: { en: "days", hi: "दिन" },
  type: { en: "Type", hi: "प्रकार" },
  monument: { en: "Monument", hi: "स्मारक" },
  sustainability: { en: "Sustainable Tourism", hi: "सतत पर्यटन" },
  explore: { en: "Explore Zones", hi: "ज़ोन खोजें" },
  chat: { en: "AI Chat", hi: "एआई चैट" },
  quiz: { en: "Quiz", hi: "क्विज़" },
  leaderboard: { en: "Leaderboard", hi: "लीडरबोर्ड" },
};

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("sanskriti-lang") : null;
    if (saved === "en" || saved === "hi") {
      setLang(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sanskriti-lang", lang);
    }
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang: () => setLang((prev) => (prev === "en" ? "hi" : "en")),
      t: (key: string) => dictionary[key]?.[lang] ?? key,
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
