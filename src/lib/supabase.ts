import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Auth is disabled if env vars are not set — local-only mode
export const supabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = supabaseEnabled
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

export type SupabaseRosterRow = {
  id: string
  user_id: string
  name: string
  game_system_id: string
  points: number
  points_limit: number
  data: unknown
  created_at: string
  updated_at: string
}
