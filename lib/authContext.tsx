'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import {
  getLocalProfile,
  getLocalUser,
  LocalProfile,
  LocalUser,
  resetLocalProfile,
  setLocalProfile,
  setLocalUser,
} from './localProfile'

interface AuthContextType {
  user: LocalUser | null
  profile: LocalProfile | null
  loading: boolean
  setProfile: (updater: LocalProfile | ((prev: LocalProfile | null) => LocalProfile | null)) => void
  refreshProfile: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ user: LocalUser }>
  signOut: () => Promise<void>
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ user: LocalUser }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  setProfile: () => {},
  refreshProfile: async () => {},
  signIn: async () => ({ user: getLocalUser() }),
  signOut: async () => {},
  signUp: async () => ({ user: getLocalUser() }),
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [profile, setProfileState] = useState<LocalProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const syncFromStorage = useCallback(() => {
    const localUser = getLocalUser()
    const localProfile = getLocalProfile()
    setUser(localUser)
    setProfileState(localProfile)
  }, [])

  useEffect(() => {
    syncFromStorage()
    setLoading(false)

    const refresh = () => syncFromStorage()
    window.addEventListener('profile-updated', refresh)
    window.addEventListener('xp-updated', refresh)

    return () => {
      window.removeEventListener('profile-updated', refresh)
      window.removeEventListener('xp-updated', refresh)
    }
  }, [syncFromStorage])

  const setProfile = useCallback((updater: LocalProfile | ((prev: LocalProfile | null) => LocalProfile | null)) => {
    setProfileState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (next) {
        setLocalProfile(next)
        window.dispatchEvent(new Event('profile-updated'))
      }
      return next
    })
  }, [])

  const refreshProfile = useCallback(async () => {
    syncFromStorage()
  }, [syncFromStorage])

  const signIn = useCallback(async (email: string) => {
    const currentUser = getLocalUser()
    const nextUser: LocalUser = {
      ...currentUser,
      email: email || currentUser.email,
    }
    setLocalUser(nextUser)
    syncFromStorage()
    return { user: nextUser }
  }, [syncFromStorage])

  const signOut = useCallback(async () => {
    resetLocalProfile()
    syncFromStorage()
  }, [syncFromStorage])

  const signUp = useCallback(async (email: string, _password: string, fullName: string) => {
    const nextUser: LocalUser = {
      id: getLocalUser().id,
      email: email || 'local@sanskriti.ai',
    }
    const nextProfile: LocalProfile = {
      ...getLocalProfile(),
      full_name: fullName || 'Explorer',
      email: nextUser.email,
    }
    setLocalUser(nextUser)
    setLocalProfile(nextProfile)
    syncFromStorage()
    return { user: nextUser }
  }, [syncFromStorage])

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    setProfile,
    refreshProfile,
    signIn,
    signOut,
    signUp,
  }), [loading, profile, refreshProfile, setProfile, signIn, signOut, signUp, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
