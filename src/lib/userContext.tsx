"use client";

import { badgesFromXp, levelFromXp } from "@/lib/utils";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type UserContextValue = {
  profile: UserProfile | null;
  level: string;
  badges: ReturnType<typeof badgesFromXp>;
  refreshProfile: () => Promise<void>;
  addXpLocal: (xp: number, monumentId?: string) => Promise<void>;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setProfile({
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
        user_type: data.user_type,
        language: data.language,
        total_xp: data.total_xp ?? 0,
        monuments_visited: data.monuments_visited ?? [],
        quiz_scores: data.quiz_scores ?? {},
        chat_history: data.chat_history ?? [],
      });
    }
  };

  useEffect(() => {
    refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const addXpLocal = async (xp: number, monumentId?: string) => {
    if (!profile || !user) return;

    const next = {
      ...profile,
      total_xp: (profile.total_xp ?? 0) + xp,
      monuments_visited: monumentId
        ? Array.from(new Set([...(profile.monuments_visited ?? []), monumentId]))
        : profile.monuments_visited,
    };

    setProfile(next);

    await supabase
      .from("user_profiles")
      .update({
        total_xp: next.total_xp,
        monuments_visited: next.monuments_visited,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  };

  const value = useMemo<UserContextValue>(
    () => ({
      profile,
      level: levelFromXp(profile?.total_xp ?? 0),
      badges: badgesFromXp(profile?.total_xp ?? 0),
      refreshProfile,
      addXpLocal,
    }),
    [profile],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
