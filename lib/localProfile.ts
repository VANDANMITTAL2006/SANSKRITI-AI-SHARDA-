export interface LocalUser {
  id: string
  email: string
}

export interface LocalProfile {
  full_name: string
  email: string
  phone?: string
  total_xp: number
  monuments_visited: string[]
  quiz_scores: number[]
  badges: string[]
  chat_history: Array<Record<string, unknown>>
  user_type: 'student' | 'tourist'
  language: 'en' | 'hi'
  admin_mode: boolean
}

const PROFILE_KEY = 'sanskriti_profile_v2'
const USER_KEY = 'sanskriti_user_v2'
export const LOCAL_USER_ID = 'local-explorer'

const DEFAULT_USER: LocalUser = {
  id: LOCAL_USER_ID,
  email: 'local@sanskriti.ai',
}

const DEFAULT_PROFILE: LocalProfile = {
  full_name: 'Explorer',
  email: DEFAULT_USER.email,
  phone: '',
  total_xp: 120,
  monuments_visited: [],
  quiz_scores: [],
  badges: [],
  chat_history: [],
  user_type: 'tourist',
  language: 'en',
  admin_mode: false,
}

function safeParse<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function normalizeProfile(raw: Partial<LocalProfile> | null): LocalProfile {
  return {
    ...DEFAULT_PROFILE,
    ...raw,
    monuments_visited: Array.isArray(raw?.monuments_visited) ? raw!.monuments_visited : [],
    quiz_scores: Array.isArray(raw?.quiz_scores) ? raw!.quiz_scores : [],
    badges: Array.isArray(raw?.badges) ? raw!.badges : [],
    chat_history: Array.isArray(raw?.chat_history) ? raw!.chat_history : [],
  }
}

export function getLocalUser(): LocalUser {
  if (typeof window === 'undefined') return DEFAULT_USER
  const stored = safeParse<LocalUser>(window.localStorage.getItem(USER_KEY))
  if (stored?.id && stored.email) return stored
  window.localStorage.setItem(USER_KEY, JSON.stringify(DEFAULT_USER))
  return DEFAULT_USER
}

export function setLocalUser(user: LocalUser): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getLocalProfile(): LocalProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE
  const stored = safeParse<Partial<LocalProfile>>(window.localStorage.getItem(PROFILE_KEY))
  const profile = normalizeProfile(stored)
  if (!stored) window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  return profile
}

export function setLocalProfile(profile: LocalProfile): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function updateLocalProfile(updater: (current: LocalProfile) => LocalProfile): LocalProfile {
  const next = updater(getLocalProfile())
  setLocalProfile(next)
  window.dispatchEvent(new Event('profile-updated'))
  return next
}

export function resetLocalProfile(): LocalProfile {
  setLocalUser(DEFAULT_USER)
  setLocalProfile(DEFAULT_PROFILE)
  window.dispatchEvent(new Event('profile-updated'))
  return DEFAULT_PROFILE
}

export function getBadgeSetFromProfile(profile: LocalProfile): string[] {
  const badges: string[] = []
  if (profile.monuments_visited.length >= 1) badges.push('first_scan')
  if (profile.quiz_scores.reduce((sum, score) => sum + score, 0) >= 100) badges.push('quiz_master')
  if (profile.monuments_visited.length >= 3) badges.push('explorer')
  if (profile.total_xp >= 500) badges.push('hunter')
  if (profile.total_xp >= 2000) badges.push('legend')
  return badges
}
