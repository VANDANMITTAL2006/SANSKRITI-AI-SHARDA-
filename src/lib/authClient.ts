import { supabase } from "@/lib/supabase";

export const authClient = {
  signUp: async (email: string, password: string, full_name: string, phone: string) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, phone },
      },
    });
  },
  signIn: async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  },
  signOut: async () => {
    return supabase.auth.signOut();
  },
  session: async () => {
    return supabase.auth.getSession();
  },
};

export const signUp = async (
  email: string,
  password: string,
  full_name: string,
  phone: string,
) => {
  const { error } = await authClient.signUp(email, password, full_name, phone);
  if (error) throw error;
};

export const signIn = async (email: string, password: string) => {
  const { error } = await authClient.signIn(email, password);
  if (error) throw error;
};

export const signOut = async () => {
  const { error } = await authClient.signOut();
  if (error) throw error;
};

export const saveChatMessage = async (
  _userId: string,
  _role: string,
  _content: string,
  _monument: string,
) => {
  return;
};

export const addXP = async (_userId: string, xpDelta: number, _eventType: string) => {
  return Math.max(0, xpDelta);
};

export const addMonumentVisited = async (_userId: string, monumentName: string) => {
  return [monumentName];
};

export const addQuizScore = async (_userId: string, score: number) => {
  return [score];
};

export const computeAndSaveBadges = async (
  _userId: string,
  _updatedState?: { total_xp?: number; monuments_visited?: string[]; quiz_scores?: number[] },
) => {
  return [] as string[];
};
