// lib/supabase/client.ts - Browser client
import { createBrowserClient } from '@supabase/ssr'

function createNoopQueryBuilder() {
  const result = Promise.resolve({ data: null, error: null })

  const builder: any = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') {
          return result.then.bind(result)
        }

        if (
          prop === 'select' ||
          prop === 'eq' ||
          prop === 'in' ||
          prop === 'order' ||
          prop === 'limit' ||
          prop === 'range' ||
          prop === 'gte' ||
          prop === 'lte' ||
          prop === 'gt' ||
          prop === 'lt' ||
          prop === 'ilike' ||
          prop === 'like' ||
          prop === 'or' ||
          prop === 'not' ||
          prop === 'match' ||
          prop === 'contains' ||
          prop === 'overlaps' ||
          prop === 'textSearch' ||
          prop === 'filter'
        ) {
          return () => builder
        }

        return () => result
      },
    }
  )

  return builder
}

function createNoopAuth() {
  const authResult = Promise.resolve({ data: { user: null, session: null }, error: null })

  return {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    signInWithPassword: () => authResult,
    resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe() {},
        },
      },
    }),
    admin: {
      createUser: () => Promise.resolve({ data: { user: null }, error: null }),
      listUsers: () => Promise.resolve({ data: { users: [] }, error: null }),
    },
  }
}

function createNoopClient() {
  const queryBuilder = createNoopQueryBuilder()
  const auth = createNoopAuth()

  return {
    auth,
    from: () => queryBuilder,
    rpc: () => Promise.resolve({ data: null, error: null }),
    channel: () => ({
      subscribe: () => ({ unsubscribe() {} }),
    }),
    removeChannel: () => Promise.resolve(),
  }
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return createNoopClient() as unknown as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(url, anonKey)
}

// lib/supabase/server.ts - Server client (for API routes & Server Components)
// Usage: import { createServerClient } from '@/lib/supabase/server'
