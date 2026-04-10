import {
  getBadgeSetFromProfile,
  getLocalProfile,
  getLocalUser,
  LocalProfile,
  updateLocalProfile,
} from './localProfile'

export async function signUp(email: string, _password: string, fullName: string, _phone: string) {
  const user = getLocalUser()
  updateLocalProfile((prev) => ({
    ...prev,
    email: email || prev.email,
    full_name: fullName || prev.full_name,
  }))
  return { user }
}

export async function signIn(email: string, _password: string) {
  const user = getLocalUser()
  updateLocalProfile((prev) => ({
    ...prev,
    email: email || prev.email,
  }))
  return { user }
}

export async function signOut() {
  return
}

export async function getCurrentUser() {
  return getLocalUser()
}

export async function getUserProfile() {
  return getLocalProfile()
}

export async function updateUserProfile(_userId: string, updates: Partial<LocalProfile>) {
  updateLocalProfile((prev) => ({ ...prev, ...updates }))
}

export async function addXP(_userId: string, xpDelta: number, _eventType: string): Promise<number> {
  const updated = updateLocalProfile((prev) => ({
    ...prev,
    total_xp: Math.max(0, (prev.total_xp ?? 0) + xpDelta),
  }))
  const badges = getBadgeSetFromProfile(updated)
  updateLocalProfile((prev) => ({ ...prev, badges }))
  window.dispatchEvent(new Event('xp-updated'))
  return updated.total_xp
}

export async function addMonumentVisited(_userId: string, monumentName: string): Promise<string[]> {
  const updated = updateLocalProfile((prev) => ({
    ...prev,
    monuments_visited: prev.monuments_visited.includes(monumentName)
      ? prev.monuments_visited
      : [...prev.monuments_visited, monumentName],
  }))
  const badges = getBadgeSetFromProfile(updated)
  updateLocalProfile((prev) => ({ ...prev, badges }))
  return updated.monuments_visited
}

export async function addQuizScore(_userId: string, score: number): Promise<number[]> {
  const updated = updateLocalProfile((prev) => ({
    ...prev,
    quiz_scores: [...prev.quiz_scores, score],
  }))
  const badges = getBadgeSetFromProfile(updated)
  updateLocalProfile((prev) => ({ ...prev, badges }))
  return updated.quiz_scores
}

export async function computeAndSaveBadges(_userId: string, updatedState?: { total_xp?: number; monuments_visited?: string[]; quiz_scores?: number[] }): Promise<string[]> {
  const draft = updateLocalProfile((prev) => ({
    ...prev,
    ...(updatedState || {}),
  }))
  const badges = getBadgeSetFromProfile(draft)
  updateLocalProfile((prev) => ({ ...prev, badges }))
  return badges
}

export async function saveChatMessage(_userId: string, role: string, content: string, monument: string) {
  updateLocalProfile((prev) => ({
    ...prev,
    chat_history: [
      ...prev.chat_history,
      { role, content, monument, timestamp: new Date().toISOString() },
    ].slice(-100),
  }))
}

export const authClient = {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  addXP,
  addMonumentVisited,
  addQuizScore,
  computeAndSaveBadges,
  saveChatMessage,
}
