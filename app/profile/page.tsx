"use client"

import { useMemo } from 'react'
import { AppShell } from '@/components/app-shell'
import { AppCard } from '@/components/mobile/app-card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/authContext'
import { useLang } from '@/lib/languageContext'
import { useUser } from '@/lib/userContext'
import { BadgeCheck, Globe, Flame, Trophy, MapPinned, ChevronRight } from 'lucide-react'

const LEVELS = [
  { min: 0, max: 499, title: 'Heritage Explorer', next: 500 },
  { min: 500, max: 999, title: 'Monument Seeker', next: 1000 },
  { min: 1000, max: 1999, title: 'Culture Guardian', next: 2000 },
  { min: 2000, max: 3499, title: 'History Keeper', next: 3500 },
  { min: 3500, max: 99999, title: 'Sanskriti Master', next: null },
]

const BADGES = [
  { id: 'first_scan', icon: '🏛️', title: 'First Glimpse', desc: 'Identify your first monument' },
  { id: 'quiz_master', icon: '🎓', title: 'Quiz Master', desc: 'Earn 100+ quiz points' },
  { id: 'explorer', icon: '🗺️', title: 'Explorer', desc: 'Visit 3 or more monuments' },
  { id: 'hunter', icon: '🏆', title: 'Treasure Hunter', desc: 'Reach 500+ XP' },
]

function getLevel(xp: number) {
  return LEVELS.find((level) => xp >= level.min && xp <= level.max) || LEVELS[0]
}

export default function ProfilePage() {
  const { profile } = useAuth()
  const { lang, toggleLang, t } = useLang()
  const { userType, setUserType, userConfig } = useUser()

  const safeProfile = profile || {
    full_name: 'Explorer',
    email: 'local@sanskriti.ai',
    total_xp: 0,
    monuments_visited: [],
    quiz_scores: [],
    badges: [],
    chat_history: [],
    user_type: 'tourist' as const,
    language: 'en' as const,
    admin_mode: false,
  }

  const level = getLevel(safeProfile.total_xp)
  const progress = level.next ? Math.min(100, Math.round(((safeProfile.total_xp - level.min) / (level.next - level.min)) * 100)) : 100
  const initials = useMemo(() => {
    const source = safeProfile.full_name || safeProfile.email || 'Explorer'
    return source.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  }, [safeProfile])

  return (
    <AppShell>
      <div className="space-y-4 px-4 pb-6">
        <AppCard className="p-0 overflow-hidden">
          <div className="bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.18),transparent_32%),linear-gradient(180deg,rgba(17,24,39,0.9),rgba(9,13,25,0.96))] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-[#C9A84C]/22 bg-black/25 text-lg font-semibold text-[#F7D88C]">{initials}</div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#8C7B63]">{t('profile_title')}</p>
                  <h1 className="mt-1 text-xl font-semibold text-[#F5E6D3]">{safeProfile.full_name || t('explorer')}</h1>
                  <p className="text-sm text-[#C4A882]">{userConfig?.subtitle || t('profile_subtitle')}</p>
                </div>
              </div>
              <span className="rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/12 px-3 py-1 text-xs font-semibold text-[#F7D88C]">⚡ {safeProfile.total_xp} XP</span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: t('visited_label'), value: safeProfile.monuments_visited.length, icon: MapPinned },
                { label: t('badges_label'), value: safeProfile.badges.length, icon: BadgeCheck },
                { label: t('rank_label'), value: '#24', icon: Trophy },
              ].map((item) => (
                <div key={item.label} className="rounded-[18px] border border-white/10 bg-white/5 p-3">
                  <item.icon className="h-4 w-4 text-[#F7D88C]" />
                  <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#8C7B63]">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold text-[#F5E6D3]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </AppCard>

        <AppCard>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#8C7B63]">{t('current_level')}</p>
              <h2 className="text-lg font-semibold text-[#F5E6D3]">{level.title}</h2>
            </div>
            <div className="rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/12 px-3 py-1 text-sm font-semibold text-[#F7D88C]">{progress}%</div>
          </div>
          <div className="h-2 rounded-full bg-white/8">
            <div className="h-full rounded-full bg-[linear-gradient(135deg,#C9A84C,#D4893F)]" style={{ width: `${progress}%` }} />
          </div>
        </AppCard>

        <section className="grid grid-cols-1 gap-2">
          <button type="button" className="app-card flex items-center justify-between rounded-[20px] px-4 py-3 text-left" onClick={toggleLang}>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-[#F7D88C]" />
              <div>
                <p className="text-sm font-semibold text-[#F5E6D3]">{t('language_label')}</p>
                <p className="text-xs text-[#C4A882]">{lang === 'en' ? 'English' : 'हिंदी'}</p>
              </div>
            </div>
          </button>
        </section>

        <AppCard>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#F5E6D3]">{t('mode_title')}</h2>
            <button onClick={() => setUserType(userType === 'student' ? 'tourist' : 'student')} className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#F7D88C]">
              {t('mode_switch')}
            </button>
          </div>
          <p className="text-sm text-[#C4A882]">{userConfig?.subtitle || t('mode_subtitle')}</p>
        </AppCard>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-[#F5E6D3]">{t('badges_label')}</h2>
          {BADGES.map((badge) => {
            const earned = safeProfile.badges.includes(badge.id)
            return (
              <div key={badge.id} className={`app-card flex items-center gap-3 rounded-[20px] p-4 ${earned ? 'border-[#C9A84C]/30 bg-[#C9A84C]/10' : ''}`}>
                <div className="text-2xl">{earned ? badge.icon : '🔒'}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#F5E6D3]">{badge.title}</p>
                  <p className="text-sm text-[#C4A882]">{badge.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#8C7B63]" />
              </div>
            )
          })}
        </section>

        <AppCard className="safe-bottom-space">
          <div className="flex items-center gap-3">
            <Flame className="h-5 w-5 text-[#F7D88C]" />
            <div>
              <p className="font-semibold text-[#F5E6D3]">{t('offline_ui_title')}</p>
              <p className="text-sm text-[#C4A882]">{t('offline_ui_desc')}</p>
            </div>
          </div>
          <div className="mt-4">
            <Button asChild className="w-full rounded-2xl bg-[#C9A84C] text-[#0E0916]">
              <a href="/explore">{t('continue_exploring')}</a>
            </Button>
          </div>
        </AppCard>
      </div>
    </AppShell>
  )
}