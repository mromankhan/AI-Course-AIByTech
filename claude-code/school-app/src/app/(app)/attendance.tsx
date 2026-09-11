import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { today, useClassRoster, useCurrentSession, useDayAttendance, useMe } from '@/data/queries';
import { StatusBar, type Counts } from '@/features/attendance/status-bar';
import { drainIfOnline, pendingForDate, queueAttendanceForCell } from '@/lib/outbox';
import type { Database } from '@/lib/database.types';
import { attendanceRole, avatarGradients, color, radius, semantic, shadow, space } from '@/theme';
import { Icon } from '@/ui/icon';
import { Button, T } from '@/ui/primitives';

type Status = Database['public']['Enums']['attendance_status'];

const OPTIONS: { status: Status; label: string }[] = [
  { status: 'present', label: 'P' },
  { status: 'absent', label: 'A' },
  { status: 'late', label: 'L' },
  { status: 'leave', label: 'Lv' },
];

/**
 * Mark attendance for a class on one date.
 *
 * Marks are written to the local outbox, never straight to the network, so the
 * screen stays usable with no signal. Saving queues every change and then tries
 * a drain; if that fails the marks are still safe on the device.
 */
export default function MarkAttendance() {
  const { classId, date: dateParam } = useLocalSearchParams<{ classId: string; date?: string }>();
  const date = dateParam ?? today();
  const qc = useQueryClient();

  const me = useMe();
  const session = useCurrentSession();
  const roster = useClassRoster(classId, session.data?.id);
  const server = useDayAttendance(classId, date);

  /** enrollment_id -> status, seeded from the server then from the outbox. */
  const [marks, setMarks] = useState<Record<string, Status>>({});
  const [seeded, setSeeded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (seeded || !server.data) return;
    (async () => {
      const fromServer: Record<string, Status> = {};
      for (const row of server.data) fromServer[row.enrollment_id] = row.status;
      // Local marks are newer than anything the server has by definition.
      setMarks({ ...fromServer, ...(await pendingForDate(date)) });
      setSeeded(true);
    })();
  }, [server.data, seeded, date]);

  const counts = useMemo<Counts>(() => {
    const c: Counts = { present: 0, absent: 0, late: 0, leave: 0 };
    for (const status of Object.values(marks)) c[status] += 1;
    return c;
  }, [marks]);

  const total = roster.data?.length ?? 0;
  const marked = counts.present + counts.absent + counts.late + counts.leave;

  function setMark(enrollmentId: string, status: Status) {
    setMarks((prev) => ({ ...prev, [enrollmentId]: status }));
    setNote(null);
  }

  /** Everyone still unmarked is present — the common case on a normal day. */
  function markRestPresent() {
    if (!roster.data) return;
    setMarks((prev) => {
      const next = { ...prev };
      for (const e of roster.data) next[e.id] ??= 'present';
      return next;
    });
  }

  async function save() {
    if (saving || !session.data || !me.data) return;
    setSaving(true);
    setNote(null);

    for (const [enrollmentId, status] of Object.entries(marks)) {
      await queueAttendanceForCell({
        school_id: me.data.school_id,
        session_id: session.data.id,
        enrollment_id: enrollmentId,
        date,
        status,
        marked_by: me.data.id,
      });
    }

    const result = await drainIfOnline();
    setSaving(false);

    if (result.remaining > 0) {
      setNote('Saved on this device. It will sync when you are back online.');
      return;
    }
    if (result.failed > 0) {
      setNote('Some marks were refused by the server. Check with your administrator.');
      return;
    }
    await qc.invalidateQueries();
    router.back();
  }

  const loading = roster.isPending || server.isPending || !seeded;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()} accessibilityLabel="Back">
          <Icon name="chevronLeft" size={22} stroke={color.inkSoft} />
        </Pressable>
        <View style={styles.headerText}>
          <T variant="overlayTitle">Mark Attendance</T>
          <T variant="listSub">
            {new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </T>
        </View>
        <Pressable onPress={markRestPresent} hitSlop={8} style={styles.allPresent}>
          <T variant="badge" style={styles.allPresentLabel}>
            All present
          </T>
        </Pressable>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryTop}>
          <T variant="listTitle">
            {marked} of {total} marked
          </T>
          {note ? null : (
            <T variant="listSub">
              {total - marked === 0 ? 'Ready to save' : `${total - marked} left`}
            </T>
          )}
        </View>
        <StatusBar counts={counts} />
        {note ? (
          <View style={styles.note}>
            <Icon name="cloudOff" size={15} stroke={semantic.info.fg} />
            <T variant="listSub" style={styles.noteText}>
              {note}
            </T>
          </View>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loading} color={color.navy} />
      ) : (
        <FlatList
          data={roster.data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <StudentRow
              name={item.student?.full_name ?? 'Student'}
              roll={item.roll_no}
              seed={item.student?.avatar_seed ?? 0}
              status={marks[item.id]}
              onSet={(s) => setMark(item.id, s)}
            />
          )}
        />
      )}

      <View style={styles.footer}>
        <Button
          label={marked === 0 ? 'Nothing to save' : `Save ${marked} marks`}
          onPress={save}
          loading={saving}
          disabled={marked === 0}
        />
      </View>
    </SafeAreaView>
  );
}

function StudentRow({
  name,
  roll,
  seed,
  status,
  onSet,
}: {
  name: string;
  roll: string;
  seed: number;
  status: Status | undefined;
  onSet: (s: Status) => void;
}) {
  const gradient = avatarGradients[seed % avatarGradients.length];
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('');

  return (
    <View style={styles.row}>
      <LinearGradient
        colors={[gradient[0], gradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatar}>
        <T variant="badge" style={styles.avatarText}>
          {initials}
        </T>
      </LinearGradient>

      <View style={styles.rowText}>
        <T variant="listTitle" numberOfLines={1}>
          {name}
        </T>
        <T variant="listSub">Roll {roll}</T>
      </View>

      <View style={styles.options}>
        {OPTIONS.map((o) => {
          const active = status === o.status;
          const tone = semantic[attendanceRole[o.status]];
          return (
            <Pressable
              key={o.status}
              accessibilityRole="button"
              accessibilityLabel={`${name}: ${o.status}`}
              accessibilityState={{ selected: active }}
              onPress={() => onSet(o.status)}
              style={[styles.option, active && { backgroundColor: tone.solid }]}>
              <T variant="badge" style={active ? styles.optionActive : { color: color.inkSoft }}>
                {o.label}
              </T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.screen,
    paddingVertical: space.md,
  },
  headerText: { flex: 1 },
  allPresent: {
    backgroundColor: color.navyTint,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  allPresentLabel: { color: color.navy },
  summary: {
    marginHorizontal: space.screen,
    backgroundColor: color.surface,
    borderRadius: radius.panel,
    padding: space.card,
    ...shadow.card,
  },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  note: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: space.sm },
  noteText: { flex: 1, color: semantic.info.fg },
  loading: { marginTop: space.xxl },
  list: { paddingHorizontal: space.screen, paddingTop: space.md, paddingBottom: space.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderRadius: radius.panel,
    padding: 11,
    marginBottom: space.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff' },
  rowText: { flex: 1 },
  options: { flexDirection: 'row', gap: 5 },
  option: {
    minWidth: 32,
    height: 30,
    borderRadius: radius.cell,
    backgroundColor: color.neutral,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  optionActive: { color: '#fff' },
  footer: {
    paddingHorizontal: space.screen,
    paddingTop: space.md,
    paddingBottom: space.xl,
    backgroundColor: color.bg,
    borderTopWidth: 1,
    borderTopColor: color.line,
  },
});
