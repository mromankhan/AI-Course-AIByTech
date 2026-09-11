import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrap } from '@/data/queries';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

/**
 * Weekly feedback. One entry per (student, ISO week). A teacher may save a draft
 * and send it later; a parent only ever sees rows with `sent_at` set — that rule
 * is in the RLS policy, not here.
 */

type FeedbackInsert = Database['public']['Tables']['feedback_entries']['Insert'];
type Enums = Database['public']['Enums'];

/** The four 3-option groups, verbatim from the prototype. Labels are display only. */
export const FEEDBACK_OPTIONS = {
  academic: [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'needs_improvement', label: 'Needs improvement' },
  ],
  homework: [
    { value: 'completed', label: 'Completed' },
    { value: 'partial', label: 'Partial' },
    { value: 'incomplete', label: 'Incomplete' },
  ],
  behaviour: [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
  ],
  participation: [
    { value: 'very_active', label: 'Very active' },
    { value: 'active', label: 'Active' },
    { value: 'reserved', label: 'Reserved' },
  ],
} as const satisfies {
  academic: { value: Enums['feedback_academic']; label: string }[];
  homework: { value: Enums['feedback_homework']; label: string }[];
  behaviour: { value: Enums['feedback_behaviour']; label: string }[];
  participation: { value: Enums['feedback_participation']; label: string }[];
};

/** The first option in each group is the good one; the last is the concern. */
export function optionTone(index: number, count: number): 'safe' | 'warning' | 'danger' {
  if (index === 0) return 'safe';
  return index === count - 1 ? 'danger' : 'warning';
}

export function labelFor<K extends keyof typeof FEEDBACK_OPTIONS>(group: K, value: string) {
  const opts: readonly { value: string; label: string }[] = FEEDBACK_OPTIONS[group];
  const i = opts.findIndex((o) => o.value === value);
  return { label: opts[i]?.label ?? value, tone: optionTone(i, opts.length) };
}

/** Feedback rows a class has for one week — drafts included, for the teacher. */
export function useClassFeedback(classId: string | undefined, weekStart: string) {
  return useQuery({
    queryKey: ['class-feedback', classId, weekStart],
    enabled: !!classId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('feedback_entries')
          .select('id, enrollment_id, sent_at, concern, enrollments!inner(class_id)')
          .eq('week_start', weekStart)
          .eq('enrollments.class_id', classId!),
      ),
  });
}

export function useFeedbackEntry(enrollmentId: string | undefined, weekStart: string) {
  return useQuery({
    queryKey: ['feedback-entry', enrollmentId, weekStart],
    enabled: !!enrollmentId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('feedback_entries')
          .select('*')
          .eq('enrollment_id', enrollmentId!)
          .eq('week_start', weekStart)
          .maybeSingle(),
      ),
  });
}

/** What a parent sees: only entries the teacher has sent, newest week first. */
export function useStudentFeedback(enrollmentId: string | undefined) {
  return useQuery({
    queryKey: ['student-feedback', enrollmentId],
    enabled: !!enrollmentId,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('feedback_sent')
          .select(
            'id, week_start, academic, homework, behaviour, participation, strengths, areas_to_improve, concern, sent_at',
          )
          .eq('enrollment_id', enrollmentId!)
          .order('week_start', { ascending: false }),
      ),
  });
}

/** Upsert on (enrollment_id, week_start): saving twice edits, never duplicates. */
export function useSaveFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: FeedbackInsert) =>
      unwrap(
        await supabase
          .from('feedback_entries')
          .upsert(row, { onConflict: 'enrollment_id,week_start' })
          .select('id, sent_at')
          .single(),
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['class-feedback'] });
      void qc.invalidateQueries({ queryKey: ['feedback-entry'] });
      void qc.invalidateQueries({ queryKey: ['pending-feedback'] });
    },
  });
}
