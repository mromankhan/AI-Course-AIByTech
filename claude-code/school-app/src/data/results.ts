import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { today, unwrap } from '@/data/queries';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

/**
 * Tests & results. Every derived number — percentage, grade letter, class
 * average, rank — comes from the Postgres views, so the teacher's list and the
 * parent's card can never disagree.
 */

type TestInsert = Database['public']['Tables']['tests']['Insert'];

export function useSubjects(classId: string | undefined) {
  return useQuery({
    queryKey: ['subjects', classId],
    enabled: !!classId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('subjects')
          .select('id, name_en, name_ur, sort_order')
          .eq('class_id', classId!)
          .order('sort_order')
          .order('name_en'),
      ),
  });
}

/** Every test for a class in a session, newest first, with its result stats. */
export function useClassTests(classId: string | undefined, sessionId: string | undefined) {
  return useQuery({
    queryKey: ['tests', classId, sessionId],
    enabled: !!classId && !!sessionId,
    queryFn: async () => {
      const [tests, stats] = await Promise.all([
        supabase
          .from('tests')
          .select('id, title, test_date, total_marks, status, subject:subjects(id, name_en)')
          .eq('class_id', classId!)
          .eq('session_id', sessionId!)
          .order('test_date', { ascending: false }),
        supabase
          .from('test_stats')
          .select('test_id, results_count, avg_pct, highest, lowest')
          .eq('class_id', classId!),
      ]);
      const byTest = new Map(unwrap(stats).map((s) => [s.test_id, s]));
      return unwrap(tests).map((t) => ({ ...t, stats: byTest.get(t.id) }));
    },
  });
}

export function useTest(testId: string | undefined) {
  return useQuery({
    queryKey: ['test', testId],
    enabled: !!testId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('tests')
          .select(
            'id, class_id, session_id, subject_id, title, test_date, total_marks, syllabus, status, subject:subjects(name_en)',
          )
          .eq('id', testId!)
          .single(),
      ),
  });
}

export function useTestResults(testId: string | undefined) {
  return useQuery({
    queryKey: ['test-results', testId],
    enabled: !!testId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('test_results')
          .select('enrollment_id, obtained_marks')
          .eq('test_id', testId!),
      ),
  });
}

/** One student's results, newest first. */
export function useStudentResults(enrollmentId: string | undefined) {
  return useQuery({
    queryKey: ['student-results', enrollmentId],
    enabled: !!enrollmentId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('test_result_summary')
          .select(
            'id, test_id, title, test_date, total_marks, obtained_marks, pct, grade, rank_in_class, class_size, class_avg_pct, subject:subjects(name_en)',
          )
          .eq('enrollment_id', enrollmentId!)
          .order('test_date', { ascending: false }),
      ),
  });
}

export function useSubjectAverages(enrollmentId: string | undefined) {
  return useQuery({
    queryKey: ['subject-averages', enrollmentId],
    enabled: !!enrollmentId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('subject_averages')
          .select('subject_id, name_en, avg_pct, grade, tests_count, sort_order')
          .eq('enrollment_id', enrollmentId!)
          .order('sort_order'),
      ),
  });
}

export function useStanding(enrollmentId: string | undefined) {
  return useQuery({
    queryKey: ['standing', enrollmentId],
    enabled: !!enrollmentId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('student_standing')
          .select('tests_taken, avg_pct, grade, rank_in_class, class_size')
          .eq('enrollment_id', enrollmentId!)
          .maybeSingle(),
      ),
  });
}

/** Tests still ahead for a class, soonest first. Shared by teacher and parent. */
export function useUpcomingTests(classId: string | undefined) {
  return useQuery({
    queryKey: ['upcoming-tests', classId],
    enabled: !!classId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('tests')
          .select('id, title, test_date, total_marks, status, subject:subjects(name_en)')
          .eq('class_id', classId!)
          .gte('test_date', today())
          .order('test_date')
          .limit(5),
      ),
  });
}

/** Create or update a test. Results are written through the outbox, not here. */
export function useSaveTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string } & TestInsert) => {
      const { id, ...row } = input;
      const res = id
        ? await supabase.from('tests').update(row).eq('id', id).select('id').single()
        : await supabase.from('tests').insert(row).select('id').single();
      return unwrap(res);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tests'] });
      void qc.invalidateQueries({ queryKey: ['test'] });
      void qc.invalidateQueries({ queryKey: ['upcoming-tests'] });
    },
  });
}

export function useDeleteTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tests').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tests'] });
      void qc.invalidateQueries({ queryKey: ['upcoming-tests'] });
    },
  });
}
