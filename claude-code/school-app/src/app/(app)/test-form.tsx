import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { today, useCurrentSession, useMe } from '@/data/queries';
import { useDeleteTest, useSaveTest, useSubjects, useTest } from '@/data/results';
import { color, space } from '@/theme';
import { Chip, ChipRow, DateInput, Flow, FormLabel, Input } from '@/ui/bits';
import { Icon } from '@/ui/icon';
import { Banner, Button, T } from '@/ui/primitives';

type Existing = NonNullable<ReturnType<typeof useTest>['data']>;
type Subject = NonNullable<ReturnType<typeof useSubjects>['data']>[number];

/**
 * Create or edit a test. The prototype's version put grade and section in one
 * radio group so picking a section deselected the grade; here the class is
 * fixed by the route and only the subject is chosen.
 *
 * The route component only loads; the editor below mounts once with the row
 * as its initial state, so there is no effect syncing server data into inputs.
 */
export default function TestForm() {
  const { classId, testId } = useLocalSearchParams<{ classId: string; testId?: string }>();
  const subjects = useSubjects(classId);
  const existing = useTest(testId);
  const loading = (testId && existing.isPending) || subjects.isPending;

  if (loading) {
    return (
      <Flow title={testId ? 'Edit test' : 'New test'}>
        <ActivityIndicator color={color.navy} style={styles.loading} />
      </Flow>
    );
  }
  return (
    <TestEditor classId={classId} existing={existing.data ?? null} subjects={subjects.data ?? []} />
  );
}

function TestEditor({
  classId,
  existing,
  subjects,
}: {
  classId: string;
  existing: Existing | null;
  subjects: Subject[];
}) {
  const me = useMe();
  const session = useCurrentSession();
  const save = useSaveTest();
  const remove = useDeleteTest();

  const [subjectId, setSubjectId] = useState<string | null>(existing?.subject_id ?? null);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [date, setDate] = useState(existing?.test_date ?? today());
  const [marks, setMarks] = useState(existing ? String(existing.total_marks) : '');
  const [syllabus, setSyllabus] = useState(existing?.syllabus ?? '');
  const [error, setError] = useState<string | null>(null);

  const locked = existing?.status === 'results_entered';

  async function submit() {
    const total = Number(marks);
    if (!subjectId) return setError('Pick a subject.');
    if (!title.trim()) return setError('Give the test a title, e.g. "Unit 3 test".');
    if (!Number.isInteger(total) || total <= 0 || total > 1000) {
      return setError('Total marks must be a whole number between 1 and 1000.');
    }
    if (!me.data || !session.data) return;
    setError(null);
    try {
      await save.mutateAsync({
        id: existing?.id,
        school_id: me.data.school_id,
        session_id: session.data.id,
        class_id: classId,
        subject_id: subjectId,
        title: title.trim(),
        test_date: date,
        total_marks: total,
        syllabus: syllabus.trim() || null,
        created_by: me.data.id,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the test.');
    }
  }

  function confirmDelete() {
    Alert.alert('Delete this test?', 'Parents will no longer see it. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove.mutateAsync(existing!.id);
            router.back();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not delete the test.');
          }
        },
      },
    ]);
  }

  return (
    <Flow
      title={existing ? 'Edit test' : 'New test'}
      right={
        existing && !locked ? (
          <Pressable hitSlop={10} onPress={confirmDelete} accessibilityLabel="Delete test">
            <Icon name="trash" size={20} stroke={color.coralText} />
          </Pressable>
        ) : undefined
      }
      footer={
        <Button
          label={existing ? 'Save changes' : 'Schedule test'}
          onPress={submit}
          loading={save.isPending}
        />
      }>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {error ? <Banner tone="danger">{error}</Banner> : null}
        {locked ? (
          <Banner tone="info">
            Results have been entered, so the total marks cannot change. Title, date and syllabus
            can.
          </Banner>
        ) : null}

        <FormLabel>Subject</FormLabel>
        <ChipRow style={styles.chips}>
          {subjects.map((s) => (
            <Chip
              key={s.id}
              label={s.name_en}
              active={s.id === subjectId}
              onPress={() => setSubjectId(s.id)}
              disabled={locked}
            />
          ))}
        </ChipRow>
        {subjects.length === 0 ? (
          <T variant="faint" style={styles.noSubjects}>
            This class has no subjects yet. Add them from the class screen first.
          </T>
        ) : null}

        <Input
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Unit 3 test"
          autoCapitalize="sentences"
        />
        <DateInput label="Date" value={date} onChange={setDate} />
        <Input
          label="Total marks"
          value={marks}
          onChangeText={setMarks}
          keyboardType="number-pad"
          placeholder="50"
          editable={!locked}
        />
        <Input
          label="Syllabus (optional)"
          value={syllabus}
          onChangeText={setSyllabus}
          placeholder="Chapters 5–7: fractions and decimals"
          multiline
        />
        <View style={styles.spacer} />
      </ScrollView>
    </Flow>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: space.xxl },
  body: { paddingHorizontal: space.screen, paddingTop: space.sm },
  chips: { marginBottom: space.md },
  noSubjects: { marginBottom: space.md },
  spacer: { height: space.xxl },
});
