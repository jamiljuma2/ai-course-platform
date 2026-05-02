// lib/supabase/client.ts - Browser client
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts - Server client (for API routes & Server Components)
// Usage: import { createServerClient } from '@/lib/supabase/server'
