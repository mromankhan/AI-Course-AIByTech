import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { shortDate, today } from '@/data/queries';
import { useClassTests } from '@/data/results';
import { color, space } from '@/theme';
import { AddButton, Badge, Empty, IconTile } from '@/ui/bits';
import { Icon } from '@/ui/icon';
import { Card, T } from '@/ui/primitives';
import { SectionTitle } from '@/ui/screen';

/**
 * A class's tests split into upcoming and past. Tapping a past test opens
 * results entry; tapping an upcoming one opens the editor. Shared by the
 * teacher's Tests tab and the admin's class detail.
 */
export function TestList({ classId, sessionId }: { classId?: string; sessionId?: string }) {
  const tests = useClassTests(classId, sessionId);
  const date = today();

  if (tests.isPending) return <ActivityIndicator color={color.navy} style={styles.loading} />;

  const all = tests.data ?? [];
  const upcoming = all.filter((t) => t.test_date >= date && t.status === 'scheduled').reverse();
  const past = all.filter((t) => !(t.test_date >= date && t.status === 'scheduled'));

  return (
    <>
      <View style={styles.sectionRow}>
        <SectionTitle style={styles.sectionTitle}>Upcoming</SectionTitle>
        {classId ? (
          <AddButton
            label="New test"
            onPress={() => router.push({ pathname: '/test-form', params: { classId } })}
          />
        ) : null}
      </View>
      <Card>
        {upcoming.length === 0 ? (
          <Empty icon="calendar" text="No tests scheduled. Add one and parents will see it." />
        ) : (
          upcoming.map((t, i) => (
            <TestRow
              key={t.id}
              first={i === 0}
              title={`${t.subject?.name_en ?? 'Test'} — ${t.title}`}
              sub={`${shortDate(t.test_date, true)} · ${t.total_marks} marks`}
              tone="warning"
              badge={<Badge tone="warning" label="Scheduled" />}
              onPress={() =>
                router.push({ pathname: '/test-form', params: { classId, testId: t.id } })
              }
            />
          ))
        )}
      </Card>

      <SectionTitle>Results</SectionTitle>
      <Card>
        {past.length === 0 ? (
          <Empty icon="chart" text="Once a test date passes, enter its results here." />
        ) : (
          past.map((t, i) => {
            const entered = t.status === 'results_entered';
            const n = t.stats?.results_count ?? 0;
            return (
              <TestRow
                key={t.id}
                first={i === 0}
                title={`${t.subject?.name_en ?? 'Test'} — ${t.title}`}
                sub={
                  entered
                    ? `${shortDate(t.test_date)} · ${n} entered · avg ${Math.round(Number(t.stats?.avg_pct ?? 0))}%`
                    : `${shortDate(t.test_date)} · ${t.total_marks} marks`
                }
                tone={entered ? 'safe' : 'caution'}
                badge={
                  entered ? (
                    <Badge tone="safe" label="Entered" icon="check" />
                  ) : (
                    <Badge tone="caution" label="Enter results" />
                  )
                }
                onPress={() => router.push({ pathname: '/results', params: { testId: t.id } })}
              />
            );
          })
        )}
      </Card>
    </>
  );
}

function TestRow({
  first,
  title,
  sub,
  tone,
  badge,
  onPress,
}: {
  first: boolean;
  title: string;
  sub: string;
  tone: 'safe' | 'warning' | 'caution';
  badge: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.row, !first && styles.divider]}>
      <IconTile name="chart" tone={tone} size={36} />
      <View style={styles.flex}>
        <T variant="listTitle" numberOfLines={1}>
          {title}
        </T>
        <T variant="listSub">{sub}</T>
      </View>
      {badge}
      <Icon name="chevron" size={16} stroke={color.inkFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: space.xl },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionTitle: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderTopColor: color.line },
  flex: { flex: 1 },
});
