import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 
    'https://huwqeyyjurnekqplwwmk.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 
    'sb_publishable_scP_9KxjtCDh26lqejHddA_CCyuSIRg',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'sanskriti-ai-auth',  // unique key prevents conflicts
    }
  }
)


export type UserProfile = {
  id: string
  email: string
  full_name: string
  phone: string
  user_type: 'student' | 'tourist'
  language: 'en' | 'hi'
  total_xp: number
  monuments_visited: string[]
  quiz_scores: Record<string, number>
  chat_history: { role: string; content: string; monument: string }[]
  created_at: string
}
