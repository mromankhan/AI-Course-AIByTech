import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';

import { useSessionEnrollments } from '@/data/admin';
import { useCurrentSession, useMyClasses } from '@/data/queries';
import { color, font, radius, space } from '@/theme';
import { AddButton, Avatar, Chip, Empty, Row } from '@/ui/bits';
import { Icon } from '@/ui/icon';
import { Card, T } from '@/ui/primitives';
import { Screen } from '@/ui/screen';

/** Every student enrolled this session, searchable and filterable by class. */
export default function AdminStudents() {
  const session = useCurrentSession();
  const classes = useMyClasses();
  const enrollments = useSessionEnrollments(session.data?.id);
  const [query, setQuery] = useState('');
  const [classId, setClassId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (enrollments.data ?? [])
      .filter((e) => !classId || e.class?.id === classId)
      .filter((e) => !q || (e.student?.full_name ?? '').toLowerCase().includes(q))
      .sort((a, b) =>
        classId
          ? a.roll_no.localeCompare(b.roll_no, undefined, { numeric: true })
          : (a.student?.full_name ?? '').localeCompare(b.student?.full_name ?? ''),
      );
  }, [enrollments.data, classId, query]);

  return (
    <Screen
      eyebrow={session.data ? `Session ${session.data.label}` : ''}
      title="Students"
      right={<AddButton label="Add" onPress={() => router.push('/student-form')} />}>
      <View style={styles.search}>
        <Icon name="search" size={18} stroke={color.inkFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name"
          placeholderTextColor={color.inkFaint}
          style={styles.searchInput}
          autoCorrect={false}
        />
      </View>
      <View style={styles.chips}>
        <Chip label="All" active={classId === null} onPress={() => setClassId(null)} />
        {(classes.data ?? []).map((c) => (
          <Chip
            key={c.id}
            label={`${c.grade} ${c.section}`}
            active={classId === c.id}
            onPress={() => setClassId(c.id)}
          />
        ))}
      </View>

      {enrollments.isPending ? (
        <ActivityIndicator color={color.navy} style={styles.loading} />
      ) : (
        <Card style={styles.card}>
          {rows.length ? (
            rows.map((e, i) => {
              const name = e.student?.full_name ?? 'Student';
              return (
                <Row
                  key={e.id}
                  first={i === 0}
                  leading={<Avatar name={name} seed={e.student?.avatar_seed ?? 0} />}
                  title={name}
                  sub={`${e.class ? `${e.class.grade} ${e.class.section}` : 'No class'} · Roll ${e.roll_no}`}
                  onPress={() =>
                    router.push({ pathname: '/student', params: { studentId: e.student!.id } })
                  }
                />
              );
            })
          ) : (
            <Empty
              icon="graduation"
              text={
                query ? 'No student matches that name.' : 'No students enrolled this session yet.'
              }
            />
          )}
        </Card>
      )}
      <T variant="faint" style={styles.count}>
        {rows.length} of {enrollments.data?.length ?? 0} students
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: color.surface,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: color.line,
    paddingHorizontal: 12,
    marginBottom: space.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: font.body,
    fontSize: 13.5,
    color: color.ink,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.cardGap },
  loading: { marginTop: space.xl },
  card: { paddingVertical: space.xs },
  count: { textAlign: 'center', marginTop: space.md },
  pill: { borderRadius: radius.pill },
});
