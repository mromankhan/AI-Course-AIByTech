import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { useClass, useSaveClass, useStaff } from '@/data/admin';
import { useMe } from '@/data/queries';
import { color, space } from '@/theme';
import { Chip, ChipRow, Flow, FormLabel, Input } from '@/ui/bits';
import { Banner, Button, T } from '@/ui/primitives';

type Existing = NonNullable<ReturnType<typeof useClass>['data']>;

/** Create or edit a class: grade, section and (optionally) its class teacher. */
export default function ClassForm() {
  const { classId } = useLocalSearchParams<{ classId?: string }>();
  const existing = useClass(classId);

  if (classId && existing.isPending) {
    return (
      <Flow title="Edit class">
        <ActivityIndicator color={color.navy} style={styles.loading} />
      </Flow>
    );
  }
  return <ClassEditor existing={existing.data ?? null} />;
}

function ClassEditor({ existing }: { existing: Existing | null }) {
  const me = useMe();
  const staff = useStaff();
  const save = useSaveClass();

  const [grade, setGrade] = useState(existing?.grade ?? '');
  const [section, setSection] = useState(existing?.section ?? '');
  const [teacherId, setTeacherId] = useState<string | null>(existing?.class_teacher_id ?? null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!grade.trim()) return setError('Enter the grade, e.g. "Grade 5".');
    if (!section.trim()) return setError('Enter the section, e.g. "A".');
    if (!me.data) return;
    setError(null);
    try {
      await save.mutateAsync({
        id: existing?.id,
        school_id: me.data.school_id,
        grade: grade.trim(),
        section: section.trim().toUpperCase(),
        class_teacher_id: teacherId,
      });
      router.back();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not save.';
      setError(/duplicate|unique/i.test(msg) ? 'That grade and section already exists.' : msg);
    }
  }

  const teachers = (staff.data ?? []).filter((t) => t.role === 'teacher');

  return (
    <Flow
      title={existing ? 'Edit class' : 'New class'}
      footer={<Button label="Save class" onPress={submit} loading={save.isPending} />}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {error ? <Banner tone="danger">{error}</Banner> : null}
        <Input
          label="Grade"
          value={grade}
          onChangeText={setGrade}
          placeholder="Grade 5"
          hint="Written the way it is said, e.g. Grade 5, Nursery, Class IX."
        />
        <Input
          label="Section"
          value={section}
          onChangeText={setSection}
          placeholder="A"
          autoCapitalize="characters"
          maxLength={4}
        />
        <FormLabel>Class teacher</FormLabel>
        <ChipRow style={styles.chips}>
          <Chip label="None yet" active={teacherId === null} onPress={() => setTeacherId(null)} />
          {teachers.map((t) => (
            <Chip
              key={t.id}
              label={t.full_name}
              active={teacherId === t.id}
              onPress={() => setTeacherId(t.id)}
            />
          ))}
        </ChipRow>
        {teachers.length === 0 ? (
          <T variant="faint">No teachers yet — add them under People, then assign here.</T>
        ) : null}
        <View style={styles.spacer} />
      </ScrollView>
    </Flow>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: space.xxl },
  body: { paddingHorizontal: space.screen, paddingTop: space.sm },
  chips: { marginBottom: space.sm },
  spacer: { height: space.xxl },
});
