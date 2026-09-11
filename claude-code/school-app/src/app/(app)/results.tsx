import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { shortDate, useClassRoster, useMe } from '@/data/queries';
import { useTest, useTestResults } from '@/data/results';
import { drainIfOnline, pendingForTest, queueResult } from '@/lib/outbox';
import { color, font, radius, semantic, shadow, space } from '@/theme';
import { Avatar, Flow } from '@/ui/bits';
import { Icon } from '@/ui/icon';
import { Button, T } from '@/ui/primitives';

/**
 * Enter marks for one test. The prototype's version had a Save button and no
 * inputs; this one has a numeric field per student, validated against the
 * test's total. Marks go through the same outbox as attendance, so a teacher
 * can key in 32 scores on the bus and sync later.
 */
export default function EnterResults() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  const qc = useQueryClient();
  const me = useMe();
  const test = useTest(testId);
  const roster = useClassRoster(test.data?.class_id, test.data?.session_id);
  const server = useTestResults(testId);

  const [marks, setMarks] = useState<Record<string, string>>({});
  const [seeded, setSeeded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (seeded || !server.data) return;
    (async () => {
      const seed: Record<string, string> = {};
      for (const r of server.data) seed[r.enrollment_id] = String(r.obtained_marks);
      for (const [id, m] of Object.entries(await pendingForTest(testId))) seed[id] = String(m);
      setMarks(seed);
      setSeeded(true);
    })();
  }, [server.data, seeded, testId]);

  const total = test.data?.total_marks ?? 0;

  /** enrollment -> parsed mark, or 'bad' when the text is not a valid score. */
  const parsed = useMemo(() => {
    const out: Record<string, number | 'bad'> = {};
    for (const [id, text] of Object.entries(marks)) {
      if (text.trim() === '') continue;
      const n = Number(text);
      out[id] = Number.isFinite(n) && n >= 0 && n <= total ? n : 'bad';
    }
    return out;
  }, [marks, total]);

  const entered = Object.values(parsed).filter((v) => v !== 'bad').length;
  const invalid = Object.values(parsed).filter((v) => v === 'bad').length;
  const count = roster.data?.length ?? 0;

  async function save() {
    if (saving || !me.data || !test.data || invalid > 0) return;
    setSaving(true);
    setNote(null);
    for (const [enrollmentId, value] of Object.entries(parsed)) {
      if (value === 'bad') continue;
      await queueResult({
        school_id: me.data.school_id,
        test_id: test.data.id,
        enrollment_id: enrollmentId,
        obtained_marks: value,
      });
    }
    const result = await drainIfOnline();
    setSaving(false);
    if (result.remaining > 0) {
      setNote('Saved on this device. Results will sync when you are back online.');
      return;
    }
    if (result.failed > 0) {
      setNote('Some marks were refused by the server. Check with your administrator.');
      return;
    }
    await qc.invalidateQueries();
    router.back();
  }

  const loading = test.isPending || roster.isPending || server.isPending || !seeded;
  const t = test.data;

  return (
    <Flow
      title={t ? `${t.subject?.name_en ?? 'Test'} — ${t.title}` : 'Enter results'}
      sub={t ? `${shortDate(t.test_date, true)} · out of ${t.total_marks}` : undefined}
      footer={
        <Button
          label={
            invalid > 0
              ? `${invalid} ${invalid === 1 ? 'mark is' : 'marks are'} over ${total}`
              : entered === 0
                ? 'Nothing to save'
                : `Save ${entered} ${entered === 1 ? 'result' : 'results'}`
          }
          onPress={save}
          loading={saving}
          disabled={entered === 0 || invalid > 0}
        />
      }>
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <T variant="listTitle">
            {entered} of {count} entered
          </T>
          <T variant="listSub">{count - entered === 0 ? 'All in' : `${count - entered} left`}</T>
        </View>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${count ? Math.round((100 * entered) / count) : 0}%` as `${number}%` },
            ]}
          />
        </View>
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
        <ActivityIndicator color={color.navy} style={styles.loading} />
      ) : (
        <FlatList
          data={roster.data}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const name = item.student?.full_name ?? 'Student';
            const value = marks[item.id] ?? '';
            const state = parsed[item.id];
            const bad = state === 'bad';
            return (
              <View style={styles.row}>
                <Avatar name={name} seed={item.student?.avatar_seed ?? 0} />
                <View style={styles.rowText}>
                  <T variant="listTitle" numberOfLines={1}>
                    {name}
                  </T>
                  <T variant="listSub">Roll {item.roll_no}</T>
                </View>
                <View style={[styles.markBox, bad && styles.markBad]}>
                  <TextInput
                    value={value}
                    onChangeText={(text) => {
                      setNote(null);
                      setMarks((prev) => ({ ...prev, [item.id]: text.replace(/[^\d.]/g, '') }));
                    }}
                    keyboardType="decimal-pad"
                    placeholder="–"
                    placeholderTextColor={color.inkFaint}
                    accessibilityLabel={`${name} marks`}
                    selectTextOnFocus
                    style={styles.markInput}
                    maxLength={6}
                  />
                  <T variant="faint">/ {total}</T>
                </View>
                <Pressable
                  hitSlop={8}
                  accessibilityLabel={`${name}: full marks`}
                  onPress={() => setMarks((prev) => ({ ...prev, [item.id]: String(total) }))}
                  style={styles.full}>
                  <Icon name="check" size={14} stroke={semantic.safe.fg} width={2.4} />
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </Flow>
  );
}

const styles = StyleSheet.create({
  summary: {
    marginHorizontal: space.screen,
    backgroundColor: color.surface,
    borderRadius: radius.panel,
    padding: space.card,
    ...shadow.card,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.sm },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: color.neutral,
    overflow: 'hidden',
  },
  fill: { height: 8, borderRadius: radius.pill, backgroundColor: color.emerald },
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
  rowText: { flex: 1 },
  markBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: color.neutral,
    borderRadius: radius.chip,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  markBad: { borderColor: color.coral, backgroundColor: color.coralSoft },
  markInput: {
    width: 52,
    paddingVertical: 8,
    fontFamily: font.displayBold,
    fontSize: 15,
    color: color.ink,
    textAlign: 'right',
  },
  full: {
    width: 30,
    height: 30,
    borderRadius: radius.cell,
    backgroundColor: semantic.safe.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
