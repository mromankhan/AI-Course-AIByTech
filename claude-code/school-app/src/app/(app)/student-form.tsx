import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useSaveStudent, useStudent } from '@/data/admin';
import { useCurrentSession, useMe, useMyClasses } from '@/data/queries';
import { avatarGradients, color, space } from '@/theme';
import { Avatar, Chip, ChipRow, Flow, FormLabel, Input } from '@/ui/bits';
import { Banner, Button, T } from '@/ui/primitives';

type Existing = NonNullable<ReturnType<typeof useStudent>['data']>;

/**
 * Add or edit a student together with their enrollment in the current session.
 * Students are never edited into a new class between sessions — they are
 * promoted by a new enrollment — but within a session the admin can correct
 * the class or roll number here.
 */
export default function StudentForm() {
  const { studentId } = useLocalSearchParams<{ studentId?: string }>();
  const session = useCurrentSession();
  const existing = useStudent(studentId, session.data?.id);

  if (session.isPending || (studentId && existing.isPending)) {
    return (
      <Flow title={studentId ? 'Edit student' : 'Add student'}>
        <ActivityIndicator color={color.navy} style={styles.loading} />
      </Flow>
    );
  }
  return <StudentEditor existing={existing.data ?? null} sessionLabel={session.data?.label} />;
}

function StudentEditor({
  existing,
  sessionLabel,
}: {
  existing: Existing | null;
  sessionLabel?: string;
}) {
  const me = useMe();
  const session = useCurrentSession();
  const classes = useMyClasses();
  const save = useSaveStudent();

  const [name, setName] = useState(existing?.full_name ?? '');
  const [seed, setSeed] = useState(existing?.avatar_seed ?? 1);
  const [classId, setClassId] = useState<string | null>(existing?.enrollment?.class_id ?? null);
  const [roll, setRoll] = useState(existing?.enrollment?.roll_no ?? '');
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!name.trim()) return setError("Enter the student's full name.");
    if (!classId) return setError('Choose a class.');
    if (!roll.trim()) return setError('Enter a roll number.');
    if (!me.data || !session.data) return;
    setError(null);
    try {
      await save.mutateAsync({
        studentId: existing?.id,
        enrollmentId: existing?.enrollment?.id,
        school_id: me.data.school_id,
        session_id: session.data.id,
        full_name: name.trim(),
        avatar_seed: seed,
        class_id: classId,
        roll_no: roll.trim().padStart(2, '0'),
      });
      router.back();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not save.';
      setError(
        /duplicate|unique/i.test(msg) ? 'That roll number is already taken in this class.' : msg,
      );
    }
  }

  return (
    <Flow
      title={existing ? 'Edit student' : 'Add student'}
      sub={sessionLabel ? `Session ${sessionLabel}` : undefined}
      footer={
        <Button
          label={existing ? 'Save changes' : 'Add student'}
          onPress={submit}
          loading={save.isPending}
        />
      }>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {error ? <Banner tone="danger">{error}</Banner> : null}
        <Input
          label="Full name"
          value={name}
          onChangeText={setName}
          placeholder="Ayesha Malik"
          autoCapitalize="words"
        />

        <FormLabel>Avatar colour</FormLabel>
        <View style={styles.avatars}>
          {avatarGradients.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => setSeed(i + 1)}
              accessibilityRole="button"
              accessibilityState={{ selected: seed === i + 1 }}
              style={[styles.avatarWrap, seed === i + 1 && styles.avatarActive]}>
              <Avatar name={name || 'A'} seed={i + 1} size={34} />
            </Pressable>
          ))}
        </View>

        <FormLabel>Class</FormLabel>
        <ChipRow style={styles.chips}>
          {(classes.data ?? []).map((c) => (
            <Chip
              key={c.id}
              label={`${c.grade} ${c.section}`}
              active={classId === c.id}
              onPress={() => setClassId(c.id)}
            />
          ))}
        </ChipRow>
        {classes.data?.length === 0 ? (
          <T variant="faint" style={styles.chips}>
            Create a class first under Classes.
          </T>
        ) : null}

        <Input
          label="Roll number"
          value={roll}
          onChangeText={setRoll}
          placeholder="01"
          keyboardType="number-pad"
          hint="Unique within the class. Single digits are padded to two."
        />
        <View style={styles.spacer} />
      </ScrollView>
    </Flow>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: space.xxl },
  body: { paddingHorizontal: space.screen, paddingTop: space.sm },
  avatars: { flexDirection: 'row', gap: space.sm, marginBottom: space.md },
  avatarWrap: { padding: 3, borderRadius: 100, borderWidth: 2, borderColor: 'transparent' },
  avatarActive: { borderColor: color.navy },
  chips: { marginBottom: space.md },
  spacer: { height: space.xxl },
});
