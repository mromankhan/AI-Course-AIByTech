import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  useDeleteCalendarDay,
  useGradeBands,
  useSaveCalendarDay,
  useSaveGradeBand,
  useSaveSession,
  useSessionCalendar,
  useSessions,
} from '@/data/admin';
import { shortDate, today, useCurrentSession, useMe } from '@/data/queries';
import { color, space } from '@/theme';
import {
  AddButton,
  Badge,
  DateInput,
  Empty,
  Flow,
  GradeBadge,
  IconTile,
  Input,
  Row,
} from '@/ui/bits';
import { Icon } from '@/ui/icon';
import { Banner, Button, Card, T } from '@/ui/primitives';
import { SectionTitle } from '@/ui/screen';

/**
 * School-level settings: academic sessions, holidays and the grading scale.
 * These are data, not code — a school changes its holidays every year and
 * its grade cut-offs are a policy decision, so an admin edits them here.
 */
export default function Setup() {
  return (
    <Flow title="Sessions & calendar">
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Sessions />
        <Holidays />
        <GradeBands />
        <View style={styles.spacer} />
      </ScrollView>
    </Flow>
  );
}

function Sessions() {
  const me = useMe();
  const sessions = useSessions();
  const save = useSaveSession();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [starts, setStarts] = useState(today());
  const [ends, setEnds] = useState(today());
  const [error, setError] = useState<string | null>(null);

  async function add() {
    if (!/^\d{4}-\d{2}$/.test(label.trim())) return setError('Label like 2026-27.');
    if (ends <= starts) return setError('The session must end after it starts.');
    if (!me.data) return;
    setError(null);
    try {
      await save.mutateAsync({
        school_id: me.data.school_id,
        label: label.trim(),
        starts_on: starts,
        ends_on: ends,
        is_current: (sessions.data?.length ?? 0) === 0,
      });
      setAdding(false);
      setLabel('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not save.';
      setError(/duplicate|unique/i.test(msg) ? 'That session already exists.' : msg);
    }
  }

  function makeCurrent(id: string, sessionLabel: string) {
    Alert.alert(
      `Switch to ${sessionLabel}?`,
      'Every screen — attendance, tests, feedback — will show this session. Students need enrollments in it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => {
            const s = sessions.data?.find((x) => x.id === id);
            if (!s || !me.data) return;
            void save.mutateAsync({ ...s, id, school_id: me.data.school_id, is_current: true });
          },
        },
      ],
    );
  }

  return (
    <>
      <View style={styles.sectionRow}>
        <SectionTitle style={styles.flex}>Academic sessions</SectionTitle>
        <AddButton label="New session" onPress={() => setAdding((v) => !v)} />
      </View>
      {adding ? (
        <Card style={styles.form}>
          {error ? <Banner tone="danger">{error}</Banner> : null}
          <Input
            label="Label"
            value={label}
            onChangeText={setLabel}
            placeholder="2027-28"
            autoCapitalize="none"
          />
          <DateInput label="Starts" value={starts} onChange={setStarts} />
          <DateInput label="Ends" value={ends} onChange={setEnds} minimum={starts} />
          <Button label="Add session" onPress={add} loading={save.isPending} />
        </Card>
      ) : null}
      <Card style={styles.list}>
        {sessions.data?.length ? (
          sessions.data.map((s, i) => (
            <Row
              key={s.id}
              first={i === 0}
              leading={<IconTile name="calendar" tone={s.is_current ? 'safe' : 'neutral'} />}
              title={`Session ${s.label}`}
              sub={`${shortDate(s.starts_on)} – ${shortDate(s.ends_on)}`}
              trailing={
                s.is_current ? (
                  <Badge tone="safe" label="Current" icon="check" />
                ) : (
                  <Pressable onPress={() => makeCurrent(s.id, s.label)} hitSlop={8}>
                    <T variant="badge" style={{ color: color.navy }}>
                      Make current
                    </T>
                  </Pressable>
                )
              }
            />
          ))
        ) : (
          <Empty icon="calendar" text="No sessions yet. Add the current academic year." />
        )}
      </Card>
    </>
  );
}

function Holidays() {
  const me = useMe();
  const session = useCurrentSession();
  const days = useSessionCalendar(session.data?.id);
  const save = useSaveCalendarDay();
  const remove = useDeleteCalendarDay();
  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState(today());
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function add() {
    if (!label.trim()) return setError('Give the holiday a name.');
    if (!me.data || !session.data) return;
    setError(null);
    try {
      await save.mutateAsync({
        school_id: me.data.school_id,
        session_id: session.data.id,
        date,
        kind: 'holiday',
        label: label.trim(),
      });
      setAdding(false);
      setLabel('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    }
  }

  const upcoming = (days.data ?? []).filter((d) => d.date >= today());
  const past = (days.data ?? []).filter((d) => d.date < today());

  return (
    <>
      <View style={styles.sectionRow}>
        <SectionTitle style={styles.flex}>
          Holidays {session.data ? `· ${session.data.label}` : ''}
        </SectionTitle>
        <AddButton label="Add holiday" onPress={() => setAdding((v) => !v)} />
      </View>
      {adding ? (
        <Card style={styles.form}>
          {error ? <Banner tone="danger">{error}</Banner> : null}
          <DateInput label="Date" value={date} onChange={setDate} />
          <Input
            label="Name"
            value={label}
            onChangeText={setLabel}
            placeholder="Independence Day"
            autoCapitalize="words"
          />
          <Button label="Add holiday" onPress={add} loading={save.isPending} />
        </Card>
      ) : null}
      <Card style={styles.list}>
        {days.data?.length ? (
          [...upcoming, ...past.slice().reverse()].map((d, i) => (
            <Row
              key={d.id}
              first={i === 0}
              leading={
                <IconTile name="sun" tone={d.date >= today() ? 'warning' : 'neutral'} size={34} />
              }
              title={d.label ?? (d.kind === 'break' ? 'Break' : 'Holiday')}
              sub={shortDate(d.date, true)}
              trailing={
                <Pressable
                  hitSlop={10}
                  accessibilityLabel="Remove holiday"
                  onPress={() =>
                    Alert.alert(`Remove ${d.label ?? 'this holiday'}?`, undefined, [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => void remove.mutateAsync(d.id),
                      },
                    ])
                  }>
                  <Icon name="trash" size={18} stroke={color.inkFaint} />
                </Pressable>
              }
            />
          ))
        ) : (
          <Empty icon="sun" text="No holidays yet. Days added here never count as absences." />
        )}
      </Card>
    </>
  );
}

function GradeBands() {
  const bands = useGradeBands();
  const save = useSaveGradeBand();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function commit(id: string, letter: string) {
    const text = edits[id];
    if (text === undefined) return;
    const n = Number(text);
    if (!Number.isFinite(n) || n < 0 || n > 100) return setError(`${letter}: enter 0–100.`);
    setError(null);
    try {
      await save.mutateAsync({ id, min_pct: n });
      setEdits((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not save.';
      setError(
        /duplicate|unique/i.test(msg) ? 'Two grades cannot start at the same percentage.' : msg,
      );
    }
  }

  return (
    <>
      <SectionTitle>Grading scale</SectionTitle>
      <Card>
        {error ? <Banner tone="danger">{error}</Banner> : null}
        <T variant="listSub" style={styles.gradeHint}>
          The lowest percentage that earns each letter. Results already entered re-grade
          automatically.
        </T>
        {(bands.data ?? []).map((b, i) => (
          <View key={b.id} style={[styles.gradeRow, i > 0 && styles.divider]}>
            <GradeBadge grade={b.letter} />
            <T variant="listTitle" style={styles.flex}>
              {b.letter}
            </T>
            <Input
              value={edits[b.id] ?? String(Number(b.min_pct))}
              onChangeText={(v) =>
                setEdits((prev) => ({ ...prev, [b.id]: v.replace(/[^\d.]/g, '') }))
              }
              onBlur={() => void commit(b.id, b.letter)}
              keyboardType="decimal-pad"
              style={styles.gradeInput}
            />
            <T variant="listSub">% and above</T>
          </View>
        ))}
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: space.screen, paddingTop: space.xs },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md },
  flex: { flex: 1 },
  form: { marginBottom: space.cardGap },
  list: { paddingVertical: space.xs },
  gradeHint: { marginBottom: space.sm },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 6 },
  gradeInput: { width: 72, textAlign: 'right', paddingVertical: 8 },
  divider: { borderTopWidth: 1, borderTopColor: color.line },
  spacer: { height: space.xxl },
});
