import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { FEEDBACK_OPTIONS, optionTone, useFeedbackEntry, useSaveFeedback } from '@/data/feedback';
import { addDays, shortDate, useCurrentSession, useMe } from '@/data/queries';
import type { Database } from '@/lib/database.types';
import { color, semantic, space } from '@/theme';
import { Badge, Chip, ChipRow, Flow, FormLabel, Input } from '@/ui/bits';
import { Banner, Button, T } from '@/ui/primitives';

type Enums = Database['public']['Enums'];

type Draft = {
  academic: Enums['feedback_academic'] | null;
  homework: Enums['feedback_homework'] | null;
  behaviour: Enums['feedback_behaviour'] | null;
  participation: Enums['feedback_participation'] | null;
  strengths: string;
  areas_to_improve: string;
  concern: string;
};

const EMPTY: Draft = {
  academic: null,
  homework: null,
  behaviour: null,
  participation: null,
  strengths: '',
  areas_to_improve: '',
  concern: '',
};

const GROUPS: { key: keyof typeof FEEDBACK_OPTIONS; label: string }[] = [
  { key: 'academic', label: 'Academic performance' },
  { key: 'homework', label: 'Homework' },
  { key: 'behaviour', label: 'Behaviour' },
  { key: 'participation', label: 'Class participation' },
];

/**
 * One student's feedback for one week. "Save draft" keeps it private to the
 * teacher; "Send to parent" stamps sent_at, which is what the parent's RLS
 * policy keys on. Sending again after edits just updates the same row.
 */
type Existing = NonNullable<ReturnType<typeof useFeedbackEntry>['data']>;

export default function FeedbackForm() {
  const { enrollmentId, weekStart, name } = useLocalSearchParams<{
    enrollmentId: string;
    weekStart: string;
    name?: string;
  }>();
  const existing = useFeedbackEntry(enrollmentId, weekStart);

  if (existing.isPending) {
    return (
      <Flow title={name ?? 'Feedback'}>
        <ActivityIndicator color={color.navy} style={styles.loading} />
      </Flow>
    );
  }
  return (
    <FeedbackEditor
      enrollmentId={enrollmentId}
      weekStart={weekStart}
      name={name}
      existing={existing.data ?? null}
    />
  );
}

/** Mounts once the row is known, so its initial state comes straight from it. */
function FeedbackEditor({
  enrollmentId,
  weekStart,
  name,
  existing,
}: {
  enrollmentId: string;
  weekStart: string;
  name?: string;
  existing: Existing | null;
}) {
  const me = useMe();
  const session = useCurrentSession();
  const save = useSaveFeedback();

  const [draft, setDraft] = useState<Draft>(() =>
    existing
      ? {
          academic: existing.academic,
          homework: existing.homework,
          behaviour: existing.behaviour,
          participation: existing.participation,
          strengths: existing.strengths ?? '',
          areas_to_improve: existing.areas_to_improve ?? '',
          concern: existing.concern ?? '',
        }
      : EMPTY,
  );
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState<'draft' | 'send' | null>(null);

  const complete = !!(draft.academic && draft.homework && draft.behaviour && draft.participation);
  const wasSent = !!existing?.sent_at;

  async function submit(mode: 'draft' | 'send') {
    if (!me.data || !session.data) return;
    if (!complete) return setError('Choose an option in every group first.');
    setError(null);
    setSending(mode);
    try {
      await save.mutateAsync({
        id: existing?.id,
        school_id: me.data.school_id,
        session_id: session.data.id,
        enrollment_id: enrollmentId,
        week_start: weekStart,
        academic: draft.academic!,
        homework: draft.homework!,
        behaviour: draft.behaviour!,
        participation: draft.participation!,
        strengths: draft.strengths.trim() || null,
        areas_to_improve: draft.areas_to_improve.trim() || null,
        concern: draft.concern.trim() || null,
        created_by: me.data.id,
        // Once sent, edits stay visible to the parent; a draft never was.
        sent_at: mode === 'send' || wasSent ? new Date().toISOString() : null,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setSending(null);
    }
  }

  return (
    <Flow
      title={name ?? 'Feedback'}
      sub={`Week of ${shortDate(weekStart)} – ${shortDate(addDays(weekStart, 4))}`}
      right={wasSent ? <Badge tone="safe" label="Sent" icon="check" /> : undefined}
      footer={
        <View style={styles.footer}>
          {!wasSent ? (
            <Pressable
              onPress={() => submit('draft')}
              disabled={!!sending}
              style={styles.draftBtn}
              accessibilityRole="button">
              <T variant="badge" style={styles.draftLabel}>
                {sending === 'draft' ? 'Saving…' : 'Save draft'}
              </T>
            </Pressable>
          ) : null}
          <View style={styles.flex}>
            <Button
              label={wasSent ? 'Update for parent' : 'Send to parent'}
              onPress={() => submit('send')}
              loading={sending === 'send'}
              disabled={!!sending}
            />
          </View>
        </View>
      }>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {error ? <Banner tone="danger">{error}</Banner> : null}

        {GROUPS.map((g) => {
          const opts: readonly { value: string; label: string }[] = FEEDBACK_OPTIONS[g.key];
          return (
            <View key={g.key} style={styles.group}>
              <FormLabel>{g.label}</FormLabel>
              <ChipRow>
                {opts.map((o, i) => (
                  <Chip
                    key={o.value}
                    label={o.label}
                    tone={optionTone(i, opts.length)}
                    active={draft[g.key] === o.value}
                    onPress={() => setDraft((d) => ({ ...d, [g.key]: o.value }) as Draft)}
                  />
                ))}
              </ChipRow>
            </View>
          );
        })}

        <Input
          label="Strengths"
          value={draft.strengths}
          onChangeText={(v) => setDraft((d) => ({ ...d, strengths: v }))}
          placeholder="Reads confidently, helps classmates"
          multiline
        />
        <Input
          label="Areas to improve"
          value={draft.areas_to_improve}
          onChangeText={(v) => setDraft((d) => ({ ...d, areas_to_improve: v }))}
          placeholder="Needs more practice with fractions"
          multiline
        />
        <Input
          label="Concern for parent (optional)"
          hint="Shown to the parent in a highlighted box. Leave empty if there is none."
          value={draft.concern}
          onChangeText={(v) => setDraft((d) => ({ ...d, concern: v }))}
          placeholder="Missed homework three days this week"
          multiline
          style={draft.concern.trim() ? styles.concern : undefined}
        />
        <View style={styles.spacer} />
      </ScrollView>
    </Flow>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: space.xxl },
  body: { paddingHorizontal: space.screen, paddingTop: space.sm },
  group: { marginBottom: space.lg },
  concern: { borderColor: semantic.danger.solid, backgroundColor: semantic.danger.bg },
  spacer: { height: space.xxl },
  footer: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flex: { flex: 1 },
  draftBtn: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: color.navyTint,
  },
  draftLabel: { color: color.navy },
});
