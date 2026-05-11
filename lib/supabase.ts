import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Client-side helper
export const getSupabaseClient = () => supabase

// Server-side helper (si es necesario usar service key)
export const getSupabaseAdmin = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  })
}
