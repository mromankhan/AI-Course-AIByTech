import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { parentEmail } from '@/lib/phone';
import { supabase, type AppClaims } from '@/lib/supabase';

type SignInResult = { error: string | null };

type SessionValue = {
  /** null once loaded and signed out; undefined while the stored session is read. */
  session: Session | null | undefined;
  claims: AppClaims | null;
  signInStaff: (email: string, password: string) => Promise<SignInResult>;
  signInParent: (phone: string, pin: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<SessionValue | null>(null);

/** Decodes our custom claims straight off the access token — no extra round trip. */
function readClaims(session: Session | null | undefined): AppClaims | null {
  const payload = session?.access_token?.split('.')[1];
  if (!payload) return null;
  try {
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    ) as Partial<AppClaims>;
    if (!decoded.school_id || !decoded.user_role) return null;
    return { school_id: decoded.school_id, user_role: decoded.user_role };
  } catch {
    return null;
  }
}

/**
 * Supabase's own messages leak implementation detail — a parent typing a wrong
 * PIN must not be told their derived email address does not exist.
 */
function friendly(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Those details do not match our records.';
  if (/network|fetch/i.test(message)) return 'No connection. Check your internet and try again.';
  return message;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      session,
      claims: readClaims(session),

      async signInStaff(email, password) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        return { error: error ? friendly(error.message) : null };
      },

      async signInParent(phone, pin) {
        const email = parentEmail(phone);
        if (!email)
          return { error: 'Enter the phone number the school registered, e.g. 0300 1234567.' };
        const { error } = await supabase.auth.signInWithPassword({ email, password: pin });
        return { error: error ? friendly(error.message) : null };
      },

      async signOut() {
        await supabase.auth.signOut();
      },
    }),
    [session],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(Ctx);
  if (!value) throw new Error('useSession must be used inside <SessionProvider>');
  return value;
}

/** For screens that only render behind the signed-in gate. */
export function useClaims(): AppClaims {
  const { claims } = useSession();
  if (!claims) {
    throw new Error(
      'No app claims on the access token. The custom access token hook is not running, ' +
        'or this token predates it — sign out and back in.',
    );
  }
  return claims;
}
