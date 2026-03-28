// DEMO MODE — restore for production:
// import { createClient } from '@supabase/supabase-js';
// import type { Database } from '../types/database';
//
// const supabaseUrl = import.meta.env.VITE_SUPABASE_DATABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
//
// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables. Please check your .env file.');
// }
//
// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
//
// export const authHelpers = {
//   signUp: (email: string, password: string, fullName?: string) => {
//     const options = fullName ? { data: { full_name: fullName } } : undefined;
//     return supabase.auth.signUp({ email, password, options });
//   },
//   signIn: (email: string, password: string) => {
//     return supabase.auth.signInWithPassword({ email, password });
//   },
//   signOut: () => {
//     return supabase.auth.signOut();
//   },
//   resetPassword: (email: string) => {
//     return supabase.auth.resetPasswordForEmail(email);
//   },
// };

// ─── Demo stubs ───────────────────────────────────────────────────────────────

const noop = async () => ({ data: null, error: null });

export const supabase = {
  auth: {
    getSession:         async () => ({ data: { session: null }, error: null }),
    getUser:            async () => ({ data: { user: null }, error: null }),
    signUp:             noop,
    signInWithPassword: noop,
    signOut:            noop,
    resetPasswordForEmail: noop,
    onAuthStateChange:  (_event: unknown, _cb: unknown) => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
  },
  from: (_table: string) => ({
    select:   (_cols?: string) => ({ eq: () => ({ data: [], error: null }), order: () => ({ data: [], error: null }), maybeSingle: async () => ({ data: null, error: null }) }),
    insert:   (_row: unknown) => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
    upsert:   (_row: unknown, _opts?: unknown) => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
    delete:   () => ({ eq: () => ({ error: null }) }),
  }),
} as unknown as import('@supabase/supabase-js').SupabaseClient;

export const authHelpers = {
  signUp:        async (_email: string, _password: string, _fullName?: string) => ({ data: null, error: null }),
  signIn:        async (_email: string, _password: string) => ({ data: null, error: null }),
  signOut:       async () => ({ error: null }),
  resetPassword: async (_email: string) => ({ error: null }),
};
