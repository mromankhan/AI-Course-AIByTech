import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { useStaff } from '@/data/admin';
import { useMyClasses } from '@/data/queries';
import { color, space } from '@/theme';
import { AddButton, Empty, IconTile, Row } from '@/ui/bits';
import { Card } from '@/ui/primitives';
import { Screen } from '@/ui/screen';

export default function AdminClasses() {
  const classes = useMyClasses();
  const staff = useStaff();
  const teacherName = new Map((staff.data ?? []).map((t) => [t.id, t.full_name]));

  return (
    <Screen
      title="Classes"
      right={<AddButton label="New class" onPress={() => router.push('/admin/class-form')} />}>
      {classes.isPending ? (
        <ActivityIndicator color={color.navy} style={styles.loading} />
      ) : (
        <Card style={styles.card}>
          {classes.data?.length ? (
            classes.data.map((c, i) => (
              <Row
                key={c.id}
                first={i === 0}
                leading={<IconTile name="book" tone="info" />}
                title={`${c.grade} — Section ${c.section}`}
                sub={
                  c.class_teacher_id
                    ? (teacherName.get(c.class_teacher_id) ?? 'Class teacher assigned')
                    : 'No class teacher yet'
                }
                onPress={() => router.push({ pathname: '/class', params: { classId: c.id } })}
              />
            ))
          ) : (
            <Empty icon="book" text="No classes yet. Create the first one." />
          )}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: space.xl },
  card: { paddingVertical: space.xs },
});
