import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrap } from '@/data/queries';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

/**
 * Admin data. Everything here is plain table access — RLS restricts every one
 * of these to `is_admin()` in the caller's own school. The only thing an admin
 * cannot do through PostgREST is create an auth user; that goes through the
 * `provision-user` Edge Function (see provisionUser below).
 */

type Tables = Database['public']['Tables'];

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () =>
      unwrap(
        await supabase
          .from('sessions')
          .select('id, label, starts_on, ends_on, is_current')
          .order('starts_on', { ascending: false }),
      ),
  });
}

export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () =>
      unwrap(
        await supabase
          .from('profiles')
          .select('id, full_name, role, email, employee_id')
          .in('role', ['teacher', 'admin'])
          .order('full_name'),
      ),
  });
}

/** Parents with the children they are linked to. */
export function useParents() {
  return useQuery({
    queryKey: ['parents'],
    queryFn: async () =>
      unwrap(
        await supabase
          .from('profiles')
          .select('id, full_name, phone, guardians(id, relation, student:students(id, full_name))')
          .eq('role', 'parent')
          .order('full_name'),
      ),
  });
}

/** Every enrollment in a session with class and student, for the admin list. */
export function useSessionEnrollments(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['enrollments', sessionId],
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

/** Students not enrolled in the given session — the ones an admin still has to place. */
export function useStudentsAll() {
  return useQuery({
    queryKey: ['students-all'],
    queryFn: async () =>
      unwrap(
        await supabase.from('students').select('id, full_name, avatar_seed').order('full_name'),
      ),
  });
}

export function useStudent(studentId: string | undefined, sessionId: string | undefined) {
  return useQuery({
    queryKey: ['student', studentId, sessionId],
    enabled: !!studentId && !!sessionId,
    queryFn: async () => {
      const [student, enrollment, guardians] = await Promise.all([
        supabase
          .from('students')
          .select('id, full_name, avatar_seed')
          .eq('id', studentId!)
          .single(),
        supabase
          .from('enrollments')
          .select('id, roll_no, class_id')
          .eq('student_id', studentId!)
          .eq('session_id', sessionId!)
          .maybeSingle(),
        supabase
          .from('guardians')
          .select('id, relation, parent:profiles(id, full_name, phone)')
          .eq('student_id', studentId!),
      ]);
      return { ...unwrap(student), enrollment: unwrap(enrollment), guardians: unwrap(guardians) };
    },
  });
}

export function useClass(classId: string | undefined) {
  return useQuery({
    queryKey: ['class', classId],
    enabled: !!classId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('classes')
          .select('id, grade, section, class_teacher_id, teacher:profiles(full_name)')
          .eq('id', classId!)
          .single(),
      ),
  });
}

export function useSessionCalendar(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['session-calendar', sessionId],
    enabled: !!sessionId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('school_calendar')
          .select('id, date, kind, label')
          .eq('session_id', sessionId!)
          .order('date'),
      ),
  });
}

export function useGradeBands() {
  return useQuery({
    queryKey: ['grade-bands'],
    queryFn: async () =>
      unwrap(
        await supabase
          .from('grade_bands')
          .select('id, letter, min_pct')
          .order('min_pct', { ascending: false }),
      ),
  });
}

/** Today's attendance per class — the admin's "who has marked" overview. */
export function useSchoolDay(date: string) {
  return useQuery({
    queryKey: ['school-day', date],
    queryFn: async () =>
      unwrap(
        await supabase
          .from('class_attendance_daily')
          .select('class_id, marked, present, absent, late, leave_count, present_pct')
          .eq('date', date),
      ),
  });
}

export function useSchoolCounts(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['school-counts', sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const head = { count: 'exact' as const, head: true };
      const [students, teachers, parents, classes] = await Promise.all([
        supabase.from('enrollments').select('id', head).eq('session_id', sessionId!),
        supabase.from('profiles').select('id', head).eq('role', 'teacher'),
        supabase.from('profiles').select('id', head).eq('role', 'parent'),
        supabase.from('classes').select('id', head),
      ]);
      for (const r of [students, teachers, parents, classes]) {
        if (r.error) throw new Error(r.error.message);
      }
      return {
        students: students.count ?? 0,
        teachers: teachers.count ?? 0,
        parents: parents.count ?? 0,
        classes: classes.count ?? 0,
      };
    },
  });
}

// ---------------------------------------------------------------------------
// Mutations. Each invalidates the lists it affects; screens do not.
// ---------------------------------------------------------------------------

function useInvalidating<TVars, TOut>(keys: string[][], fn: (vars: TVars) => Promise<TOut>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      for (const key of keys) void qc.invalidateQueries({ queryKey: key });
    },
  });
}

export function useSaveClass() {
  return useInvalidating(
    [['classes'], ['class'], ['school-counts']],
    async (input: { id?: string } & Tables['classes']['Insert']) => {
      const { id, ...row } = input;
      const res = id
        ? await supabase.from('classes').update(row).eq('id', id).select('id').single()
        : await supabase.from('classes').insert(row).select('id').single();
      return unwrap(res);
    },
  );
}

export function useSaveSubject() {
  return useInvalidating(
    [['subjects']],
    async (input: { id?: string } & Tables['subjects']['Insert']) => {
      const { id, ...row } = input;
      const res = id
        ? await supabase.from('subjects').update(row).eq('id', id).select('id').single()
        : await supabase.from('subjects').insert(row).select('id').single();
      return unwrap(res);
    },
  );
}

export function useDeleteSubject() {
  return useInvalidating([['subjects']], async (id: string) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) throw new Error(error.message);
  });
}

/** Creates the student and enrols them in one go; edits update both rows. */
export function useSaveStudent() {
  return useInvalidating(
    [['enrollments'], ['student'], ['students-all'], ['roster'], ['school-counts']],
    async (input: {
      studentId?: string;
      enrollmentId?: string;
      school_id: string;
      session_id: string;
      full_name: string;
      avatar_seed: number;
      class_id: string;
      roll_no: string;
    }) => {
      let studentId = input.studentId;
      if (studentId) {
        unwrap(
          await supabase
            .from('students')
            .update({ full_name: input.full_name, avatar_seed: input.avatar_seed })
            .eq('id', studentId)
            .select('id')
            .single(),
        );
      } else {
        studentId = unwrap(
          await supabase
            .from('students')
            .insert({
              school_id: input.school_id,
              full_name: input.full_name,
              avatar_seed: input.avatar_seed,
            })
            .select('id')
            .single(),
        ).id;
      }

      const enrollment = {
        school_id: input.school_id,
        session_id: input.session_id,
        student_id: studentId,
        class_id: input.class_id,
        roll_no: input.roll_no,
      };
      if (input.enrollmentId) {
        unwrap(
          await supabase
            .from('enrollments')
            .update(enrollment)
            .eq('id', input.enrollmentId)
            .select('id')
            .single(),
        );
      } else {
        unwrap(await supabase.from('enrollments').insert(enrollment).select('id').single());
      }
      return studentId;
    },
  );
}

export function useLinkGuardian() {
  return useInvalidating(
    [['student'], ['parents'], ['children']],
    async (row: Tables['guardians']['Insert']) =>
      unwrap(await supabase.from('guardians').insert(row).select('id').single()),
  );
}

export function useUnlinkGuardian() {
  return useInvalidating([['student'], ['parents'], ['children']], async (id: string) => {
    const { error } = await supabase.from('guardians').delete().eq('id', id);
    if (error) throw new Error(error.message);
  });
}

export function useSaveSession() {
  return useInvalidating(
    [['sessions'], ['session-row']],
    async (input: { id?: string } & Tables['sessions']['Insert']) => {
      const { id, ...row } = input;
      // Only one session is current. Clear the flag elsewhere before setting it.
      if (row.is_current) {
        const { error } = await supabase
          .from('sessions')
          .update({ is_current: false })
          .eq('school_id', row.school_id)
          .eq('is_current', true);
        if (error) throw new Error(error.message);
      }
      const res = id
        ? await supabase.from('sessions').update(row).eq('id', id).select('id').single()
        : await supabase.from('sessions').insert(row).select('id').single();
      return unwrap(res);
    },
  );
}

export function useSaveCalendarDay() {
  return useInvalidating(
    [['session-calendar'], ['calendar']],
    async (row: Tables['school_calendar']['Insert']) =>
      unwrap(
        await supabase
          .from('school_calendar')
          .upsert(row, { onConflict: 'school_id,date' })
          .select('id')
          .single(),
      ),
  );
}

export function useDeleteCalendarDay() {
  return useInvalidating([['session-calendar'], ['calendar']], async (id: string) => {
    const { error } = await supabase.from('school_calendar').delete().eq('id', id);
    if (error) throw new Error(error.message);
  });
}

export function useSaveGradeBand() {
  return useInvalidating([['grade-bands']], async (input: { id: string; min_pct: number }) =>
    unwrap(
      await supabase
        .from('grade_bands')
        .update({ min_pct: input.min_pct })
        .eq('id', input.id)
        .select('id')
        .single(),
    ),
  );
}

export type ProvisionInput =
  | { kind: 'teacher'; full_name: string; email: string; password: string; employee_id?: string }
  | {
      kind: 'parent';
      full_name: string;
      phone: string;
      pin: string;
      student_ids: string[];
      relation?: string;
    };

/**
 * Creates the auth user + profile via the Edge Function. supabase-js attaches
 * the admin's JWT; the function checks `user_role` on it and scopes everything
 * to the admin's school.
 */
export function useProvisionUser() {
  return useInvalidating(
    [['staff'], ['parents'], ['student'], ['school-counts']],
    async (input: ProvisionInput) => {
      const { data, error } = await supabase.functions.invoke<{ id?: string; error?: string }>(
        'provision-user',
        { body: input },
      );
      if (error) {
        // A non-2xx response carries the function's JSON body with the reason.
        const ctx = (error as { context?: Response }).context;
        const body = ctx ? await ctx.json().catch(() => null) : null;
        throw new Error(body?.error ?? error.message);
      }
      if (data?.error) throw new Error(data.error);
      return data?.id ?? '';
    },
  );
}
