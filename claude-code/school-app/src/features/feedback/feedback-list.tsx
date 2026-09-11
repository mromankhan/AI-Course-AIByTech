import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useClassFeedback } from '@/data/feedback';
import { addDays, mondayOf, shortDate, useClassRoster } from '@/data/queries';
import { color, radius, space } from '@/theme';
import { Avatar, Badge, Empty } from '@/ui/bits';
import { Icon } from '@/ui/icon';
import { Card, T } from '@/ui/primitives';

/**
 * Week picker plus the roster with each student's feedback state for that
 * week. The prototype had a student chevron with no handler and no week
 * selector at all; this is both.
 */
export function FeedbackList({ classId, sessionId }: { classId?: string; sessionId?: string }) {
  const thisWeek = mondayOf();
  const [week, setWeek] = useState(thisWeek);
  const roster = useClassRoster(classId, sessionId);
  const entries = useClassFeedback(classId, week);

  const byEnrollment = new Map((entries.data ?? []).map((e) => [e.enrollment_id, e]));
  const sent = (entries.data ?? []).filter((e) => e.sent_at).length;
  const drafts = (entries.data ?? []).length - sent;
  const total = roster.data?.length ?? 0;

  return (
    <>
      <View style={styles.weekBar}>
        <Pressable hitSlop={10} onPress={() => setWeek(addDays(week, -7))} style={styles.weekBtn}>
          <Icon name="chevronLeft" size={18} stroke={color.inkSoft} />
        </Pressable>
        <View style={styles.weekText}>
          <T variant="listTitle">
            {week === thisWeek ? 'This week' : `Week of ${shortDate(week)}`}
          </T>
          <T variant="listSub">
            {shortDate(week)} – {shortDate(addDays(week, 4))}
          </T>
        </View>
        <Pressable
          hitSlop={10}
          disabled={week >= thisWeek}
          onPress={() => setWeek(addDays(week, 7))}
          style={[styles.weekBtn, week >= thisWeek && styles.off]}>
          <Icon name="chevron" size={18} stroke={color.inkSoft} />
        </Pressable>
      </View>

      <Card style={styles.progress}>
        <View style={styles.progressRow}>
          <T variant="listTitle">
            {sent} of {total} sent
          </T>
          <T variant="listSub">
            {drafts > 0 ? `${drafts} draft${drafts === 1 ? '' : 's'}` : 'Due Friday'}
          </T>
        </View>
        <View style={styles.track}>
          <View
            style={[styles.fill, { width: `${total ? Math.round((100 * sent) / total) : 0}%` }]}
          />
        </View>
      </Card>

      {roster.isPending || entries.isPending ? (
        <ActivityIndicator color={color.navy} style={styles.loading} />
      ) : total === 0 ? (
        <Card>
          <Empty icon="users" text="No students enrolled in this class." />
        </Card>
      ) : (
        <Card>
          {roster.data!.map((e, i) => {
            const name = e.student?.full_name ?? 'Student';
            const entry = byEnrollment.get(e.id);
            return (
              <Pressable
                key={e.id}
                onPress={() =>
                  router.push({
                    pathname: '/feedback-form',
                    params: { enrollmentId: e.id, weekStart: week, name },
                  })
                }
                style={[styles.row, i > 0 && styles.divider]}>
                <Avatar name={name} seed={e.student?.avatar_seed ?? 0} />
                <View style={styles.flex}>
                  <T variant="listTitle" numberOfLines={1}>
                    {name}
                  </T>
                  <T variant="listSub">Roll {e.roll_no}</T>
                </View>
                {entry?.sent_at ? (
                  <Badge tone={entry.concern ? 'danger' : 'safe'} label="Sent" icon="check" />
                ) : entry ? (
                  <Badge tone="warning" label="Draft" />
                ) : (
                  <Badge tone="neutral" label="Pending" />
                )}
                <Icon name="chevron" size={16} stroke={color.inkFaint} />
              </Pressable>
            );
          })}
        </Card>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  weekBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.cardGap,
  },
  weekBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekText: { flex: 1, alignItems: 'center' },
  off: { opacity: 0.35 },
  progress: { marginBottom: space.cardGap },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.sm },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: color.neutral,
    overflow: 'hidden',
  },
  fill: { height: 8, borderRadius: radius.pill, backgroundColor: color.emerald },
  loading: { marginTop: space.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderTopColor: color.line },
  flex: { flex: 1 },
});
