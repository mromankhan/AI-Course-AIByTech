import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useClassRoster, useCurrentSession, useMe, useMyClasses } from '@/data/queries';
import { avatarGradients, color, radius, space } from '@/theme';
import { Icon } from '@/ui/icon';
import { Card, T } from '@/ui/primitives';
import { Screen, SectionTitle } from '@/ui/screen';

/**
 * The class roster. Classes the teacher does not teach are not fetched at all —
 * RLS filters them server-side, which is why the prototype's padlocked rows for
 * other sections have no equivalent here: there is nothing to lock.
 */
export default function Classes() {
  const me = useMe();
  const session = useCurrentSession();
  const classes = useMyClasses();
  const myClass =
    classes.data?.find((c) => c.class_teacher_id === me.data?.id) ?? classes.data?.[0];
  const roster = useClassRoster(myClass?.id, session.data?.id);

  return (
    <Screen
      eyebrow={session.data ? `Session ${session.data.label}` : ''}
      title={myClass ? `${myClass.grade} — Section ${myClass.section}` : 'My Class'}>
      <SectionTitle>Students ({roster.data?.length ?? 0})</SectionTitle>

      {roster.isPending ? (
        <ActivityIndicator color={color.navy} style={styles.loading} />
      ) : roster.data?.length ? (
        <Card style={styles.card}>
          {roster.data.map((e, i) => {
            const name = e.student?.full_name ?? 'Student';
            const gradient =
              avatarGradients[(e.student?.avatar_seed ?? 0) % avatarGradients.length];
            return (
              <View key={e.id} style={[styles.row, i > 0 && styles.divider]}>
                <LinearGradient
                  colors={[gradient[0], gradient[1]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatar}>
                  <T variant="badge" style={styles.avatarText}>
                    {name
                      .split(' ')
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join('')}
                  </T>
                </LinearGradient>
                <View style={styles.text}>
                  <T variant="listTitle" numberOfLines={1}>
                    {name}
                  </T>
                  <T variant="listSub">Roll {e.roll_no}</T>
                </View>
                <Icon name="chevron" size={16} stroke={color.inkFaint} />
              </View>
            );
          })}
        </Card>
      ) : (
        <Card>
          <T variant="listSub">No students enrolled in this session yet.</T>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: space.xl },
  card: { paddingVertical: space.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderTopColor: color.line },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff' },
  text: { flex: 1 },
});
