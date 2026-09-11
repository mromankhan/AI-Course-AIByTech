import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

/** Local calendar date as YYYY-MM-DD. Never use toISOString() — that is UTC. */
export function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** First day of the month a date falls in, which is how the summary view is keyed. */
export function monthKey(date = today()): string {
  return `${date.slice(0, 7)}-01`;
}

/** Throws on a PostgREST error so TanStack Query surfaces it instead of a null row. */
export function unwrap<T>(res: PostgrestSingleResponse<T>): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

function fmt(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Monday of the ISO week a date falls in — feedback_entries.week_start. */
export function mondayOf(date = today()): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return fmt(d);
}

export function addDays(date: string, delta: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return fmt(d);
}

/** "Mon, 31 Aug" style short date used all over the lists. */
export function shortDate(iso: string, weekday = false): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    ...(weekday ? { weekday: 'short' as const } : {}),
    day: 'numeric',
    month: 'short',
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    staleTime: Infinity,
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error('Signed out');
      return unwrap(
        await supabase
          .from('profiles')
          .select('id, full_name, role, email, phone, school_id')
          .eq('id', auth.user.id)
          .single(),
      );
    },
  });
}

export function useCurrentSession() {
  return useQuery({
    queryKey: ['session-row'],
    staleTime: Infinity,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('sessions')
          .select('id, label, starts_on, ends_on')
          .eq('is_current', true)
          .single(),
      ),
  });
}

export function useSchool() {
  return useQuery({
    queryKey: ['school'],
    staleTime: Infinity,
    queryFn: async () => unwrap(await supabase.from('schools').select('id, name').single()),
  });
}

/**
 * Classes the signed-in user can see. RLS already narrows this: a teacher gets
 * only the class they are class teacher of, an admin gets the whole school. The
 * client does no filtering of its own.
 */
export function useMyClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () =>
      unwrap(
        await supabase
          .from('classes')
          .select('id, grade, section, class_teacher_id')
          .order('grade')
          .order('section'),
      ),
  });
}

/**
 * The class a teacher's tabs are about. A class teacher has exactly one; an
 * admin using the shared flows passes an explicit classId instead.
 */
export function useMyClass() {
  const me = useMe();
  const classes = useMyClasses();
  const klass = classes.data?.find((c) => c.class_teacher_id === me.data?.id) ?? classes.data?.[0];
  return { klass, isPending: me.isPending || classes.isPending };
}

export function useClassRoster(classId: string | undefined, sessionId: string | undefined) {
  return useQuery({
    queryKey: ['roster', classId, sessionId],
    enabled: !!classId && !!sessionId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('enrollments')
          .select('id, roll_no, student:students(id, full_name, avatar_seed)')
          .eq('class_id', classId!)
          .eq('session_id', sessionId!)
          .order('roll_no'),
      ),
  });
}

/** One day's attendance for a class, keyed by enrollment for quick lookup. */
export function useDayAttendance(classId: string | undefined, date: string) {
  return useQuery({
    queryKey: ['attendance', classId, date],
    enabled: !!classId,
    queryFn: async () => {
      // !inner turns the embed into a join filter: only rows whose enrollment
      // belongs to this class come back. The embedded column itself is unused.
      return unwrap(
        await supabase
          .from('attendance')
          .select('enrollment_id, status, enrollments!inner(class_id)')
          .eq('date', date)
          .eq('enrollments.class_id', classId!),
      );
    },
  });
}

export function useClassDaySummary(classId: string | undefined, date: string) {
  return useQuery({
    queryKey: ['class-day', classId, date],
    enabled: !!classId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('class_attendance_daily')
          .select('present, absent, late, leave_count, marked, present_pct')
          .eq('class_id', classId!)
          .eq('date', date)
          .maybeSingle(),
      ),
  });
}

export function usePendingFeedbackCount(classId: string | undefined) {
  return useQuery({
    queryKey: ['pending-feedback', classId],
    enabled: !!classId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('feedback_pending')
        .select('enrollment_id', { count: 'exact', head: true })
        .eq('class_id', classId!);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
  });
}

/**
 * The signed-in parent's children. `guardians` is many-to-many, so this can be
 * more than one and the UI always offers a switcher. RLS does the filtering.
 */
export function useMyChildren(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['children', sessionId],
    enabled: !!sessionId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('enrollments')
          .select(
            'id, roll_no, class:classes(id, grade, section), student:students(id, full_name, avatar_seed)',
          )
          .eq('session_id', sessionId!)
          .order('roll_no'),
      ),
  });
}

export function useMonthSummary(enrollmentId: string | undefined, month: string) {
  return useQuery({
    queryKey: ['month-summary', enrollmentId, month],
    enabled: !!enrollmentId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('student_attendance_summary')
          .select('present_days, absent_days, late_days, leave_days, days_marked, attendance_pct')
          .eq('enrollment_id', enrollmentId!)
          .eq('month', month)
          .maybeSingle(),
      ),
  });
}

/** The last `months` monthly summaries, oldest first — the 3-month bar chart. */
export function useSummaryHistory(enrollmentId: string | undefined, months = 3) {
  return useQuery({
    queryKey: ['summary-history', enrollmentId, months],
    enabled: !!enrollmentId,
    queryFn: async () => {
      const rows = unwrap(
        await supabase
          .from('student_attendance_summary')
          .select('month, attendance_pct, days_marked')
          .eq('enrollment_id', enrollmentId!)
          .order('month', { ascending: false })
          .limit(months),
      );
      return rows.slice().reverse();
    },
  });
}

/** Every marked day in one month, for the calendar grid. */
export function useMonthAttendance(enrollmentId: string | undefined, month: string) {
  const from = month;
  const to = addMonths(month, 1);
  return useQuery({
    queryKey: ['month-attendance', enrollmentId, month],
    enabled: !!enrollmentId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('attendance')
          .select('date, status')
          .eq('enrollment_id', enrollmentId!)
          .gte('date', from)
          .lt('date', to)
          .order('date'),
      ),
  });
}

/** Holidays and breaks, so the calendar does not show a holiday as an absence. */
export function useCalendar(month: string) {
  return useQuery({
    queryKey: ['calendar', month],
    staleTime: 5 * 60_000,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('school_calendar')
          .select('date, kind, label')
          .gte('date', month)
          .lt('date', addMonths(month, 1)),
      ),
  });
}

/** Month arithmetic on the YYYY-MM-01 keys, without pulling in a date library. */
export function addMonths(monthStart: string, delta: number): string {
  const [y, m] = monthStart.split('-').map(Number);
  const total = y * 12 + (m - 1) + delta;
  const year = Math.floor(total / 12);
  const mon = (total % 12) + 1;
  return `${year}-${String(mon).padStart(2, '0')}-01`;
}
