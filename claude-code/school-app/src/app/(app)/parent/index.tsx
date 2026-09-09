import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import {
  monthKey,
  useCurrentSession,
  useMe,
  useMonthAttendance,
  useMonthSummary,
} from '@/data/queries';
import { Ring } from '@/features/attendance/ring';
import { ChildSwitcher } from '@/features/parent/child-switcher';
import { useChild } from '@/features/parent/child';
import { attendanceRole, color, radius, semantic, space } from '@/theme';
import { Icon } from '@/ui/icon';
import { Card, T } from '@/ui/primitives';
import { Screen, SectionTitle } from '@/ui/screen';

export default function ParentDashboard() {
  const me = useMe();
  const session = useCurrentSession();
  const { selected, loading } = useChild();
  const month = monthKey();

  const summary = useMonthSummary(selected?.id, month);
  const recent = useMonthAttendance(selected?.id, month);

  const child = selected?.student?.full_name ?? '';
  const klass = selected?.class
    ? `${selected.class.grade} — Section ${selected.class.section}`
    : '';

  // Newest first, and only the exceptions — a parent scanning this wants the
  // days that went wrong, not a list of thirty "present".
  const notable = (recent.data ?? [])
    .filter((r) => r.status !== 'present')
    .slice(-5)
    .reverse();

  return (
    <Screen
      eyebrow={session.data ? `Session ${session.data.label}` : ''}
      title={me.data ? me.data.full_name : 'Welcome'}>
      <ChildSwitcher />

      {loading ? (
        <ActivityIndicator color={color.navy} style={styles.loading} />
      ) : !selected ? (
        <Card>
          <T variant="listSub">
            No child is linked to this account yet. Ask the school office to link your children.
          </T>
        </Card>
      ) : (
        <>
          <Card style={styles.hero}>
            <Ring pct={summary.data?.attendance_pct ?? null} caption="this month" />
            <View style={styles.heroText}>
              <T variant="cardTitle">{child}</T>
              <T variant="listSub">{klass}</T>
              <T variant="listSub" style={styles.heroDays}>
                {summary.data
                  ? `${summary.data.present_days} of ${summary.data.days_marked} school days present`
                  : 'No attendance recorded yet this month'}
              </T>
            </View>
          </Card>

          <Link href="/parent/attendance" asChild>
            <Pressable>
              <Card style={styles.linkCard}>
                <View style={[styles.icon, { backgroundColor: semantic.safe.bg }]}>
                  <Icon name="calendarCheck" size={19} stroke={semantic.safe.fg} />
                </View>
                <T variant="listTitle" style={styles.flex}>
                  View full attendance
                </T>
                <Icon name="chevron" size={18} stroke={color.inkFaint} />
              </Card>
            </Pressable>
          </Link>

          <SectionTitle>Days to note</SectionTitle>
          <Card>
            {recent.isPending ? (
              <ActivityIndicator color={color.navy} />
            ) : notable.length === 0 ? (
              <T variant="listSub">A full month of attendance so far. Nothing to flag.</T>
            ) : (
              notable.map((r, i) => {
                const tone = semantic[attendanceRole[r.status]];
                return (
                  <View key={r.date} style={[styles.row, i > 0 && styles.divider]}>
                    <View style={[styles.dot, { backgroundColor: tone.solid }]} />
                    <T variant="listTitle" style={styles.flex}>
                      {new Date(`${r.date}T00:00:00`).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </T>
                    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
                      <T variant="badge" style={{ color: tone.fg }}>
                        {r.status}
                      </T>
                    </View>
                  </View>
                );
              })
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: space.xl },
  hero: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  heroText: { flex: 1 },
  heroDays: { marginTop: space.sm },
  linkCard: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.cardGap },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  divider: { borderTopWidth: 1, borderTopColor: color.line },
  dot: { width: 8, height: 8, borderRadius: radius.pill },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill },
});
