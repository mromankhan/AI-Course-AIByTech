import { ActivityIndicator, StyleSheet } from 'react-native';

import { useClassRoster } from '@/data/queries';
import { color, space } from '@/theme';
import { Avatar, Empty, Row } from '@/ui/bits';
import { Card } from '@/ui/primitives';

/** A class's students in roll order. `onStudent` makes rows tappable (admin). */
export function Roster({
  classId,
  sessionId,
  onStudent,
}: {
  classId?: string;
  sessionId?: string;
  onStudent?: (studentId: string) => void;
}) {
  const roster = useClassRoster(classId, sessionId);

  if (roster.isPending) return <ActivityIndicator color={color.navy} style={styles.loading} />;

  return (
    <Card style={styles.card}>
      {roster.data?.length ? (
        roster.data.map((e, i) => {
          const name = e.student?.full_name ?? 'Student';
          const id = e.student?.id;
          return (
            <Row
              key={e.id}
              first={i === 0}
              leading={<Avatar name={name} seed={e.student?.avatar_seed ?? 0} />}
              title={name}
              sub={`Roll ${e.roll_no}`}
              onPress={onStudent && id ? () => onStudent(id) : undefined}
            />
          );
        })
      ) : (
        <Empty icon="users" text="No students enrolled in this session yet." />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: space.xl },
  card: { paddingVertical: space.xs },
});
