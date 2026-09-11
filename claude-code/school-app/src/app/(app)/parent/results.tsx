import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { shortDate } from '@/data/queries';
import {
  useStanding,
  useStudentResults,
  useSubjectAverages,
  useUpcomingTests,
} from '@/data/results';
import { ChildSwitcher } from '@/features/parent/child-switcher';
import { useChild } from '@/features/parent/child';
import { color, radius, semantic, space } from '@/theme';
import { Badge, Empty, GradeBadge, IconTile } from '@/ui/bits';
import { Card, T } from '@/ui/primitives';
import { Screen, SectionTitle } from '@/ui/screen';

function toneFor(pct: number): keyof typeof semantic {
  return pct >= 80 ? 'safe' : pct >= 60 ? 'info' : pct >= 50 ? 'warning' : 'danger';
}

/**
 * Parent results. Every number here is a view column — the average, the grade
 * letter, the rank and the class average all come from Postgres, so this
 * screen cannot contradict the teacher's.
 */
export default function ParentResults() {
  const { selected, loading } = useChild();
  const standing = useStanding(selected?.id);
  const subjects = useSubjectAverages(selected?.id);
  const results = useStudentResults(selected?.id);
  const upcoming = useUpcomingTests(selected?.class?.id);

  const child = selected?.student?.full_name?.split(' ')[0] ?? 'your child';

  return (
    <Screen title="Results">
      <ChildSwitcher />
      {loading ? (
        <ActivityIndicator color={color.navy} style={styles.loading} />
      ) : !selected ? (
        <Card>
          <T variant="listSub">No child is linked to this account yet.</T>
        </Card>
      ) : (
        <>
          <Card style={styles.standing}>
            <View style={styles.standingMain}>
              <T variant="eyebrow">Overall this session</T>
              <View style={styles.standingRow}>
                <T variant="screenTitle">
                  {standing.data?.avg_pct != null
                    ? `${Math.round(Number(standing.data.avg_pct))}%`
                    : '—'}
                </T>
                <GradeBadge grade={standing.data?.grade ?? null} size={40} />
              </View>
              <T variant="listSub">
                {standing.data?.tests_taken
                  ? `${standing.data.tests_taken} ${standing.data.tests_taken === 1 ? 'test' : 'tests'} · rank ${standing.data.rank_in_class} of ${standing.data.class_size}`
                  : 'No results yet'}
              </T>
            </View>
            <IconTile name="award" tone="warning" size={52} />
          </Card>

          <SectionTitle>By subject</SectionTitle>
          <Card>
            {subjects.isPending ? (
              <ActivityIndicator color={color.navy} />
            ) : !subjects.data?.length ? (
              <Empty icon="chart" text={`Subject averages appear once ${child} has a result.`} />
            ) : (
              subjects.data.map((s, i) => {
                const pct = Number(s.avg_pct ?? 0);
                const tone = semantic[toneFor(pct)];
                return (
                  <View key={s.subject_id} style={[styles.subject, i > 0 && styles.divider]}>
                    <View style={styles.subjectTop}>
                      <T variant="listTitle" style={styles.flex}>
                        {s.name_en}
                      </T>
                      <T variant="listSub">
                        {s.tests_count} {s.tests_count === 1 ? 'test' : 'tests'}
                      </T>
                      <T variant="statValue" style={{ color: tone.fg, marginLeft: space.sm }}>
                        {Math.round(pct)}%
                      </T>
                    </View>
                    <View style={styles.track}>
                      <View
                        style={[
                          styles.fill,
                          { width: `${Math.round(pct)}%`, backgroundColor: tone.solid },
                        ]}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </Card>

          <SectionTitle>Recent tests</SectionTitle>
          <Card>
            {results.isPending ? (
              <ActivityIndicator color={color.navy} />
            ) : !results.data?.length ? (
              <Empty icon="clipboard" text="Results will show here as the teacher enters them." />
            ) : (
              results.data.map((r, i) => {
                const pct = Number(r.pct ?? 0);
                const avg = Number(r.class_avg_pct ?? 0);
                return (
                  <View key={r.id} style={[styles.result, i > 0 && styles.divider]}>
                    <GradeBadge grade={r.grade} />
                    <View style={styles.flex}>
                      <T variant="listTitle" numberOfLines={1}>
                        {r.subject?.name_en ?? 'Test'} — {r.title}
                      </T>
                      <T variant="listSub">
                        {shortDate(r.test_date!)} · class avg {Math.round(avg)}% · rank{' '}
                        {r.rank_in_class}/{r.class_size}
                      </T>
                    </View>
                    <View style={styles.score}>
                      <T variant="statValue">
                        {Number(r.obtained_marks)}/{r.total_marks}
                      </T>
                      <Badge
                        tone={pct >= avg ? 'safe' : 'caution'}
                        label={`${pct >= avg ? '+' : ''}${Math.round(pct - avg)} vs avg`}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </Card>

          <SectionTitle>Upcoming</SectionTitle>
          <Card>
            {!upcoming.data?.length ? (
              <T variant="listSub">No tests scheduled.</T>
            ) : (
              upcoming.data.map((t, i) => (
                <View key={t.id} style={[styles.result, i > 0 && styles.divider]}>
                  <IconTile name="calendar" tone="warning" size={36} />
                  <View style={styles.flex}>
                    <T variant="listTitle">
                      {t.subject?.name_en ?? 'Test'} — {t.title}
                    </T>
                    <T variant="listSub">
                      {shortDate(t.test_date, true)} · {t.total_marks} marks
                    </T>
                  </View>
                </View>
              ))
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: space.xl },
  standing: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  standingMain: { flex: 1 },
  standingRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginVertical: 4 },
  subject: { paddingVertical: 10 },
  subjectTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  track: {
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: color.neutral,
    overflow: 'hidden',
  },
  fill: { height: 7, borderRadius: radius.pill },
  result: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 10 },
  score: { alignItems: 'flex-end', gap: 4 },
  divider: { borderTopWidth: 1, borderTopColor: color.line },
  flex: { flex: 1 },
});
