import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import type { Database } from '@/lib/database.types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ' +
      'Copy .env.example to .env and restart the bundler.',
  );
}

export const supabase = createClient<Database>(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // No deep-link auth callbacks: there is no OAuth and no email confirmation,
    // because there is no self-signup. Accounts are provisioned by an admin.
    detectSessionInUrl: false,
  },
});

/**
 * Claims injected by public.custom_access_token_hook.
 *
 * Note `user_role`, not `role` -- `role` is reserved by Supabase for the
 * Postgres role ('authenticated') and must not be overwritten.
 */
export type AppClaims = {
  school_id: string;
  user_role: 'admin' | 'teacher' | 'parent';
};

/**
 * Reads our custom claims off the current access token.
 *
 * Returns null when the user is signed out, or when the token predates the
 * access-token hook being enabled -- in that case sign out and back in.
 */
export async function getAppClaims(): Promise<AppClaims | null> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return null;

  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const decoded = JSON.parse(
      // base64url -> base64, then decode
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    ) as Partial<AppClaims>;

    if (!decoded.school_id || !decoded.user_role) return null;
    return { school_id: decoded.school_id, user_role: decoded.user_role };
  } catch {
    return null;
  }
}
