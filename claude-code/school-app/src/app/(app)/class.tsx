import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useClass, useDeleteSubject, useSaveSubject } from '@/data/admin';
import { useSubjects } from '@/data/results';
import { today, useClassDaySummary, useCurrentSession, useMe } from '@/data/queries';
import { StatusBar } from '@/features/attendance/status-bar';
import { FeedbackList } from '@/features/feedback/feedback-list';
import { Roster } from '@/features/roster/roster';
import { TestList } from '@/features/tests/test-list';
import { color, semantic, space } from '@/theme';
import { Badge, Empty, Flow, IconTile, Input, Row, Segmented } from '@/ui/bits';
import { Icon } from '@/ui/icon';
import { Banner, Button, Card, T } from '@/ui/primitives';
import { SectionTitle } from '@/ui/screen';

type Tab = 'roster' | 'subjects' | 'tests' | 'feedback';

/**
 * One class, for an admin: today's attendance, roster, subjects, tests and
 * feedback. Attendance, tests and feedback reuse the teacher's components
 * because RLS lets an admin act on any class in the school.
 */
export default function ClassDetail() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const me = useMe();
  const session = useCurrentSession();
  const klass = useClass(classId);
  const summary = useClassDaySummary(classId, today());
  const [tab, setTab] = useState<Tab>('roster');
  const isAdmin = me.data?.role === 'admin';

  const title = klass.data ? `${klass.data.grade} — Section ${klass.data.section}` : 'Class';
  const marked = summary.data?.marked ?? 0;

  return (
    <Flow
      title={title}
      sub={klass.data?.teacher?.full_name ?? 'No class teacher'}
      right={
        isAdmin ? (
          <Pressable
            hitSlop={10}
            onPress={() => router.push({ pathname: '/admin/class-form', params: { classId } })}
            accessibilityLabel="Edit class">
            <Icon name="edit" size={20} stroke={color.inkSoft} />
          </Pressable>
        ) : undefined
      }>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Pressable
          onPress={() => router.push({ pathname: '/attendance', params: { classId } })}
          accessibilityRole="button">
          <Card style={styles.today}>
            <IconTile name="calendarCheck" tone={marked ? 'safe' : 'caution'} />
            <View style={styles.flex}>
              <T variant="listTitle">
                {marked
                  ? `Today: ${Math.round(Number(summary.data?.present_pct ?? 0))}% present`
                  : 'Today not marked'}
              </T>
              {marked ? (
                <StatusBar
                  counts={{
                    present: summary.data?.present ?? 0,
                    absent: summary.data?.absent ?? 0,
                    late: summary.data?.late ?? 0,
                    leave: summary.data?.leave_count ?? 0,
                  }}
                />
              ) : (
                <T variant="listSub">Tap to mark attendance</T>
              )}
            </View>
            <Icon name="chevron" size={18} stroke={color.inkFaint} />
          </Card>
        </Pressable>

        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'roster', label: 'Students' },
            { value: 'subjects', label: 'Subjects' },
            { value: 'tests', label: 'Tests' },
            { value: 'feedback', label: 'Feedback' },
          ]}
        />

        {tab === 'roster' ? (
          <Roster
            classId={classId}
            sessionId={session.data?.id}
            onStudent={
              isAdmin
                ? (studentId) => router.push({ pathname: '/student', params: { studentId } })
                : undefined
            }
          />
        ) : tab === 'subjects' ? (
          <Subjects classId={classId} schoolId={me.data?.school_id} />
        ) : tab === 'tests' ? (
          <TestList classId={classId} sessionId={session.data?.id} />
        ) : (
          <FeedbackList classId={classId} sessionId={session.data?.id} />
        )}
        <View style={styles.spacer} />
      </ScrollView>
    </Flow>
  );
}

/** Subjects for the class, with inline add and delete. Teachers may edit too. */
function Subjects({ classId, schoolId }: { classId: string; schoolId?: string }) {
  const subjects = useSubjects(classId);
  const save = useSaveSubject();
  const remove = useDeleteSubject();
  const [nameEn, setNameEn] = useState('');
  const [nameUr, setNameUr] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function add() {
    if (!nameEn.trim()) return setError('Enter the subject name.');
    if (!schoolId) return;
    setError(null);
    try {
      await save.mutateAsync({
        school_id: schoolId,
        class_id: classId,
        name_en: nameEn.trim(),
        name_ur: nameUr.trim() || nameEn.trim(),
        sort_order: (subjects.data?.length ?? 0) + 1,
      });
      setNameEn('');
      setNameUr('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not add.';
      setError(/duplicate|unique/i.test(msg) ? 'That subject already exists for this class.' : msg);
    }
  }

  function confirmRemove(id: string, name: string) {
    Alert.alert(
      `Remove ${name}?`,
      'Tests for this subject would lose their subject. Only remove a subject added by mistake.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            remove
              .mutateAsync(id)
              .catch((e: Error) =>
                setError(
                  /foreign key|violates/i.test(e.message)
                    ? `${name} has tests, so it cannot be removed.`
                    : e.message,
                ),
              ),
        },
      ],
    );
  }

  return (
    <>
      <Card style={styles.list}>
        {subjects.data?.length ? (
          subjects.data.map((s, i) => (
            <Row
              key={s.id}
              first={i === 0}
              leading={<IconTile name="book" tone="info" size={34} />}
              title={s.name_en}
              sub={s.name_ur !== s.name_en ? s.name_ur : null}
              trailing={
                <Pressable
                  hitSlop={10}
                  onPress={() => confirmRemove(s.id, s.name_en)}
                  accessibilityLabel={`Remove ${s.name_en}`}>
                  <Icon name="trash" size={18} stroke={color.inkFaint} />
                </Pressable>
              }
            />
          ))
        ) : (
          <Empty icon="book" text="No subjects yet. Tests need a subject, so add them first." />
        )}
      </Card>

      <SectionTitle>Add a subject</SectionTitle>
      <Card>
        {error ? <Banner tone="danger">{error}</Banner> : null}
        <Input
          label="Name (English)"
          value={nameEn}
          onChangeText={setNameEn}
          placeholder="Mathematics"
        />
        <Input
          label="Name (Urdu)"
          value={nameUr}
          onChangeText={setNameUr}
          placeholder="ریاضی"
          hint="Optional — shown when the app is in Urdu."
        />
        <Button label="Add subject" onPress={add} loading={save.isPending} />
      </Card>
      <View style={styles.hintRow}>
        <Badge tone="neutral" label={`${subjects.data?.length ?? 0} subjects`} />
        <T variant="faint" style={{ color: semantic.neutral.fg }}>
          Order follows the order added.
        </T>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: space.screen, paddingTop: space.xs },
  today: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginBottom: space.cardGap,
  },
  flex: { flex: 1 },
  list: { paddingVertical: space.xs },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.md },
  spacer: { height: space.xxl },
});
