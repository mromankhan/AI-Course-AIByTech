import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import {
  today,
  useClassDaySummary,
  useCurrentSession,
  useMe,
  useMyClasses,
  usePendingFeedbackCount,
  useUpcomingTests,
} from '@/data/queries';
import { StatusBar } from '@/features/attendance/status-bar';
import { color, radius, semantic, shadow, space } from '@/theme';
import { Icon, type IconName } from '@/ui/icon';
import { Card, T } from '@/ui/primitives';
import { Screen, SectionTitle } from '@/ui/screen';

/** "Monday, 31 August" — the prototype's header eyebrow. */
function longDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function shortDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

/** "Ms. Sana Tariq" -> "Ms. Tariq", the way a class teacher is addressed. */
function shortName(full: string) {
  const parts = full.split(' ');
  return parts.length > 2 ? `${parts[0]} ${parts[parts.length - 1]}` : full;
}

export default function TeacherDashboard() {
  const date = today();
  const me = useMe();
  const session = useCurrentSession();
  const classes = useMyClasses();

  // A class teacher has exactly one class. An admin sees the whole school, and
  // falls back to the first until the admin screens land in Milestone 4.
  const myClass =
    classes.data?.find((c) => c.class_teacher_id === me.data?.id) ?? classes.data?.[0];

  const summary = useClassDaySummary(myClass?.id, date);
  const tests = useUpcomingTests(myClass?.id);
  const pending = usePendingFeedbackCount(myClass?.id);

  const counts = {
    present: summary.data?.present ?? 0,
    absent: summary.data?.absent ?? 0,
    late: summary.data?.late ?? 0,
    leave: summary.data?.leave_count ?? 0,
  };
  const marked = summary.data?.marked ?? 0;

  return (
    <Screen
      eyebrow={longDate(date)}
      title={me.data ? `Welcome back, ${shortName(me.data.full_name)}` : 'Welcome back'}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Icon name="users" size={22} stroke={color.navy} />
        </View>
        <View style={styles.heroText}>
          <T variant="cardTitle">
            {myClass ? `${myClass.grade} — Section ${myClass.section}` : 'No class assigned'}
          </T>
          <T variant="listSub" style={styles.heroSub}>
            {session.data ? `Session ${session.data.label}` : ' '}
          </T>
        </View>
      </View>

      <SectionTitle>Today&apos;s attendance</SectionTitle>
      <Card>
        {summary.isPending ? (
          <ActivityIndicator color={color.navy} />
        ) : marked === 0 ? (
          <View style={styles.row}>
            <T variant="listTitle" style={styles.flex}>
              Not marked yet
            </T>
            <Badge tone="caution" label="Pending" />
          </View>
        ) : (
          <>
            <View style={styles.row}>
              <View style={styles.pctRow}>
                <T variant="screenTitle" style={styles.pct}>
                  {Math.round(Number(summary.data?.present_pct ?? 0))}%
                </T>
                <T variant="listSub"> present</T>
              </View>
              <Badge tone="safe" label="Marked" icon="check" />
            </View>
            <StatusBar counts={counts} />
          </>
        )}
      </Card>

      <SectionTitle>Quick actions</SectionTitle>
      <View style={styles.grid}>
        <Quick
          href={{ pathname: '/teacher/attendance', params: { classId: myClass?.id ?? '' } }}
          icon="calendarCheck"
          tone="safe"
          label={marked === 0 ? 'Mark Attendance' : 'Edit Attendance'}
          disabled={!myClass}
        />
        <Quick href="/teacher/tests" icon="chart" tone="warning" label="Tests & Results" />
        <Quick href="/teacher/feedback" icon="message" tone="danger" label="Weekly Feedback" />
        <Quick href="/teacher/classes" icon="book" tone="info" label="My Class" />
      </View>

      <SectionTitle>Upcoming tests</SectionTitle>
      <Card>
        {tests.isPending ? (
          <ActivityIndicator color={color.navy} />
        ) : tests.data?.length ? (
          tests.data.map((t, i) => (
            <View key={t.id} style={[styles.listRow, i > 0 && styles.divider]}>
              <View style={[styles.smallIcon, { backgroundColor: semantic.warning.bg }]}>
                <Icon name="chart" size={16} stroke={semantic.warning.fg} />
              </View>
              <View style={styles.flex}>
                <T variant="listTitle">
                  {t.subject?.name_en ?? 'Test'} — {t.title}
                </T>
                <T variant="listSub">
                  {shortDate(t.test_date)} · {t.total_marks} marks
                </T>
              </View>
            </View>
          ))
        ) : (
          <T variant="listSub">No tests scheduled.</T>
        )}
      </Card>

      <SectionTitle>Pending feedback</SectionTitle>
      <Link href="/teacher/feedback" asChild>
        <Pressable>
          <Card style={styles.pendingCard}>
            <View
              style={[styles.smallIcon, styles.bigIcon, { backgroundColor: semantic.danger.bg }]}>
              <Icon name="message" size={20} stroke={semantic.danger.fg} />
            </View>
            <View style={styles.flex}>
              <T variant="listTitle">
                {pending.data === 0
                  ? "This week's feedback is complete"
                  : `${pending.data ?? '—'} students still need feedback this week`}
              </T>
              <T variant="listSub">Due by Friday</T>
            </View>
            <Icon name="chevron" size={18} stroke={color.inkFaint} />
          </Card>
        </Pressable>
      </Link>
    </Screen>
  );
}

function Badge({
  tone,
  label,
  icon,
}: {
  tone: keyof typeof semantic;
  label: string;
  icon?: IconName;
}) {
  const s = semantic[tone];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      {icon ? <Icon name={icon} size={13} stroke={s.fg} width={2.4} /> : null}
      <T variant="badge" style={{ color: s.fg }}>
        {label}
      </T>
    </View>
  );
}

function Quick({
  href,
  icon,
  tone,
  label,
  disabled,
}: {
  href: React.ComponentProps<typeof Link>['href'];
  icon: IconName;
  tone: keyof typeof semantic;
  label: string;
  disabled?: boolean;
}) {
  const s = semantic[tone];
  const body = (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.quick,
        pressed && styles.quickPressed,
        disabled && styles.off,
      ]}>
      <View style={[styles.smallIcon, styles.bigIcon, { backgroundColor: s.bg }]}>
        <Icon name={icon} size={20} stroke={s.fg} />
      </View>
      <T variant="listSub" style={styles.quickLabel}>
        {label}
      </T>
    </Pressable>
  );
  return disabled ? (
    body
  ) : (
    <Link href={href} asChild>
      {body}
    </Link>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderRadius: radius.card,
    padding: space.card,
    ...shadow.card,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: color.navyTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1 },
  heroSub: { marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pctRow: { flexDirection: 'row', alignItems: 'baseline' },
  pct: { fontSize: 22 },
  flex: { flex: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.cardGap },
  quick: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: color.surface,
    borderRadius: radius.panel,
    padding: space.card,
    alignItems: 'flex-start',
    gap: space.sm,
    ...shadow.card,
  },
  quickPressed: { backgroundColor: color.navyTint },
  quickLabel: { color: color.ink },
  off: { opacity: 0.45 },
  smallIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigIcon: { width: 40, height: 40, borderRadius: 12 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  divider: { borderTopWidth: 1, borderTopColor: color.line },
  pendingCard: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
