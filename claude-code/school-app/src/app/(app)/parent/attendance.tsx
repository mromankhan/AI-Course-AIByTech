import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import {
  addMonths,
  monthKey,
  useCalendar,
  useMonthAttendance,
  useMonthSummary,
  useSummaryHistory,
} from '@/data/queries';
import { MonthCalendar } from '@/features/attendance/month-calendar';
import { Ring } from '@/features/attendance/ring';
import { ChildSwitcher } from '@/features/parent/child-switcher';
import { useChild } from '@/features/parent/child';
import type { Database } from '@/lib/database.types';
import { color, radius, semantic, space } from '@/theme';
import { Icon } from '@/ui/icon';
import { Card, T } from '@/ui/primitives';
import { Screen, SectionTitle } from '@/ui/screen';

type Status = Database['public']['Enums']['attendance_status'];

function monthLabel(month: string) {
  return new Date(`${month}T00:00:00`).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

export default function ParentAttendance() {
  const { selected, loading } = useChild();
  const [month, setMonth] = useState(monthKey());

  const summary = useMonthSummary(selected?.id, month);
  const days = useMonthAttendance(selected?.id, month);
  const calendar = useCalendar(month);
  const history = useSummaryHistory(selected?.id, 3);

  const marks: Record<string, Status> = {};
  for (const d of days.data ?? []) marks[d.date] = d.status;

  const holidays: Record<string, string> = {};
  for (const h of calendar.data ?? []) holidays[h.date] = h.label ?? h.kind;

  // Never let a parent page forward past the current month into empty grids.
  const atLatest = month >= monthKey();

  return (
    <Screen title="Attendance">
      <ChildSwitcher />

      {loading || !selected ? (
        <ActivityIndicator color={color.navy} style={styles.loading} />
      ) : (
        <>
          <Card style={styles.hero}>
            <Ring pct={summary.data?.attendance_pct ?? null} caption={monthLabel(month)} />
            <View style={styles.stats}>
              <Stat label="Present" value={summary.data?.present_days} tone="safe" />
              <Stat label="Absent" value={summary.data?.absent_days} tone="danger" />
              <Stat label="Late" value={summary.data?.late_days} tone="warning" />
              <Stat label="Leave" value={summary.data?.leave_days} tone="info" />
            </View>
          </Card>

          <View style={styles.monthNav}>
            <Pressable
              hitSlop={10}
              onPress={() => setMonth(addMonths(month, -1))}
              accessibilityLabel="Previous month">
              <Icon name="chevronLeft" size={20} stroke={color.inkSoft} />
            </Pressable>
            <T variant="sectionTitle">{monthLabel(month)}</T>
            <Pressable
              hitSlop={10}
              disabled={atLatest}
              onPress={() => setMonth(addMonths(month, 1))}
              accessibilityLabel="Next month">
              <Icon name="chevron" size={20} stroke={atLatest ? color.line : color.inkSoft} />
            </Pressable>
          </View>

          <Card>
            {days.isPending ? (
              <ActivityIndicator color={color.navy} />
            ) : (
              <MonthCalendar month={month} marks={marks} holidays={holidays} />
            )}
          </Card>

          <SectionTitle>Recent months</SectionTitle>
          <Card>
            {history.data?.length ? (
              history.data.map((h) => (
                <View key={h.month} style={styles.barRow}>
                  <T variant="listSub" style={styles.barLabel}>
                    {new Date(`${h.month}T00:00:00`).toLocaleDateString('en-GB', {
                      month: 'short',
                    })}
                  </T>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${Math.max(0, Math.min(100, Number(h.attendance_pct ?? 0)))}%` },
                      ]}
                    />
                  </View>
                  <T variant="badge" style={styles.barValue}>
                    {Math.round(Number(h.attendance_pct ?? 0))}%
                  </T>
                </View>
              ))
            ) : (
              <T variant="listSub">Not enough history yet.</T>
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | null | undefined;
  tone: keyof typeof semantic;
}) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statDot, { backgroundColor: semantic[tone].solid }]} />
      <T variant="listSub" style={styles.statLabel}>
        {label}
      </T>
      <T variant="listTitle">{value ?? 0}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: space.xl },
  hero: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  stats: { flex: 1, gap: 6 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  statDot: { width: 8, height: 8, borderRadius: radius.pill },
  statLabel: { flex: 1 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.xl,
    marginBottom: space.sm,
    paddingHorizontal: space.xs,
  },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 6 },
  barLabel: { width: 34 },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: color.neutral,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: color.emerald, borderRadius: radius.pill },
  barValue: { width: 38, textAlign: 'right', color: color.inkSoft },
});
