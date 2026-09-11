import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { FEEDBACK_OPTIONS, labelFor, useStudentFeedback } from '@/data/feedback';
import { addDays, shortDate } from '@/data/queries';
import { ChildSwitcher } from '@/features/parent/child-switcher';
import { useChild } from '@/features/parent/child';
import { color, radius, semantic, space } from '@/theme';
import { Badge, Empty } from '@/ui/bits';
import { Icon } from '@/ui/icon';
import { Card, T } from '@/ui/primitives';
import { Screen } from '@/ui/screen';

const GROUPS: { key: keyof typeof FEEDBACK_OPTIONS; label: string }[] = [
  { key: 'academic', label: 'Academic' },
  { key: 'homework', label: 'Homework' },
  { key: 'behaviour', label: 'Behaviour' },
  { key: 'participation', label: 'Participation' },
];

/** Weekly feedback the teacher has sent, newest first. Drafts never reach here. */
export default function ParentFeedback() {
  const { selected, loading } = useChild();
  const feedback = useStudentFeedback(selected?.id);
  const child = selected?.student?.full_name?.split(' ')[0] ?? 'your child';

  return (
    <Screen title="Weekly Feedback">
      <ChildSwitcher />
      {loading || feedback.isPending ? (
        <ActivityIndicator color={color.navy} style={styles.loading} />
      ) : !selected ? (
        <Card>
          <T variant="listSub">No child is linked to this account yet.</T>
        </Card>
      ) : !feedback.data?.length ? (
        <Card>
          <Empty
            icon="message"
            text={`${child}'s teacher sends feedback every week. The first one will appear here.`}
          />
        </Card>
      ) : (
        feedback.data.map((f) => (
          <Card key={f.id} style={styles.card}>
            <View style={styles.head}>
              <View style={styles.flex}>
                <T variant="cardTitle">Week of {shortDate(f.week_start!)}</T>
                <T variant="listSub">
                  {shortDate(f.week_start!)} – {shortDate(addDays(f.week_start!, 4))}
                </T>
              </View>
              {f.concern ? (
                <Badge tone="danger" label="Concern" />
              ) : (
                <Badge tone="safe" label="On track" />
              )}
            </View>

            <View style={styles.grid}>
              {GROUPS.map((g) => {
                const value = f[g.key];
                const { label, tone } = labelFor(g.key, value ?? '');
                const s = semantic[tone];
                return (
                  <View key={g.key} style={styles.cell}>
                    <T variant="faint">{g.label}</T>
                    <View style={[styles.pill, { backgroundColor: s.bg }]}>
                      <T variant="badge" style={{ color: s.fg }}>
                        {label}
                      </T>
                    </View>
                  </View>
                );
              })}
            </View>

            {f.strengths ? <Note label="Strengths" text={f.strengths} /> : null}
            {f.areas_to_improve ? (
              <Note label="Areas to improve" text={f.areas_to_improve} />
            ) : null}
            {f.concern ? (
              <View style={styles.concern}>
                <Icon name="bell" size={16} stroke={semantic.danger.fg} />
                <View style={styles.flex}>
                  <T variant="badge" style={{ color: semantic.danger.fg }}>
                    Teacher&apos;s concern
                  </T>
                  <T variant="body" style={styles.concernText}>
                    {f.concern}
                  </T>
                </View>
              </View>
            ) : null}
          </Card>
        ))
      )}
    </Screen>
  );
}

function Note({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.note}>
      <T variant="faint">{label}</T>
      <T variant="body">{text}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: space.xl },
  card: { marginBottom: space.cardGap },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.md },
  flex: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  cell: { width: '48%', flexGrow: 1, gap: 4 },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  note: { marginTop: space.md, gap: 2 },
  concern: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.chip,
    backgroundColor: semantic.danger.bg,
    borderLeftWidth: 3,
    borderLeftColor: semantic.danger.solid,
  },
  concernText: { color: color.ink, marginTop: 2 },
});
