import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Only create client if keys are configured; otherwise the app runs in local-data mode
export let supabase: SupabaseClient | null = null

if (
  supabaseUrl &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your-anon-key-here'
) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export const isSupabaseEnabled = supabase !== null
