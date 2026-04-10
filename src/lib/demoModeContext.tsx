"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type DemoLocation = {
  lat: number;
  lng: number;
};

export const DEMO_LOCATIONS = {
  taj_mahal: { lat: 27.1751, lng: 78.0421 },
  red_fort: { lat: 28.6562, lng: 77.241 },
  qutub_minar: { lat: 28.5244, lng: 77.1855 },
} satisfies Record<string, DemoLocation>;

type DemoModeContextValue = {
  isDemoMode: boolean;
  setIsDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
  getDemoLocation: (monumentId: string) => DemoLocation | null;
};

const STORAGE_KEY = "sanskriti-demo-mode";

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

const monumentToDemoKey: Record<string, keyof typeof DEMO_LOCATIONS> = {
  "taj-mahal": "taj_mahal",
  "red-fort": "red_fort",
  "qutub-minar": "qutub_minar",
};

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const queryValue = new URLSearchParams(window.location.search).get("demo");
    if (queryValue === "true") {
      setIsDemoMode(true);
      return;
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);
    setIsDemoMode(saved === "true");
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(isDemoMode));
    }
  }, [isDemoMode]);

  const value = useMemo(
    () => ({
      isDemoMode,
      setIsDemoMode,
      toggleDemoMode: () => setIsDemoMode((current) => !current),
      getDemoLocation: (monumentId: string) => {
        const key = monumentToDemoKey[monumentId];
        return key ? DEMO_LOCATIONS[key] : null;
      },
    }),
    [isDemoMode],
  );

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error("useDemoMode must be used within DemoModeProvider");
  return ctx;
}