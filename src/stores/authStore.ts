import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, supabaseEnabled } from '@/lib/supabase'
import type { Roster } from '@/lib/roster/types'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean

  // Actions
  initialize: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<string | null>
  signUpWithEmail: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>

  // Cloud sync
  uploadRoster: (roster: Roster) => Promise<void>
  deleteCloudRoster: (id: string) => Promise<void>
  fetchCloudRosters: () => Promise<Roster[]>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  initialized: !supabaseEnabled,

  initialize: async () => {
    if (!supabase) {
      set({ initialized: true })
      return
    }
    const { data } = await supabase.auth.getSession()
    set({
      session: data.session,
      user: data.session?.user ?? null,
      initialized: true,
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },

  signInWithEmail: async (email, password) => {
    if (!supabase) return 'Auth not configured'
    set({ loading: true })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    set({ loading: false })
    return error?.message ?? null
  },

  signUpWithEmail: async (email, password) => {
    if (!supabase) return 'Auth not configured'
    set({ loading: true })
    const { error } = await supabase.auth.signUp({ email, password })
    set({ loading: false })
    return error?.message ?? null
  },

  signOut: async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },

  uploadRoster: async (roster) => {
    const { user } = get()
    if (!supabase || !user) return
    await supabase.from('rosters').upsert({
      id: roster.id,
      user_id: user.id,
      name: roster.name,
      game_system_id: roster.gameSystemId,
      points: roster.points,
      points_limit: roster.pointsLimit,
      data: roster,
      updated_at: new Date().toISOString(),
    })
  },

  deleteCloudRoster: async (id) => {
    if (!supabase) return
    await supabase.from('rosters').delete().eq('id', id)
  },

  fetchCloudRosters: async () => {
    const { user } = get()
    if (!supabase || !user) return []
    const { data, error } = await supabase
      .from('rosters')
      .select('data')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    if (error || !data) return []
    return data.map((row) => row.data as Roster)
  },
}))
