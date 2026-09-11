import { router, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useSchoolCounts, useSchoolDay } from '@/data/admin';
import { today, useCurrentSession, useMe, useMyClasses, useSchool } from '@/data/queries';
import { color, radius, semantic, shadow, space } from '@/theme';
import { Badge, IconTile } from '@/ui/bits';
import { Icon, type IconName } from '@/ui/icon';
import { Card, T } from '@/ui/primitives';
import { Screen, SectionTitle } from '@/ui/screen';

function longDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Admin home: the school at a glance, and which classes have marked today.
 * Everything an admin sees is school-wide because RLS grants `is_admin()`
 * the whole school — there is no client-side scoping to do.
 */
export default function AdminHome() {
  const date = today();
  const me = useMe();
  const school = useSchool();
  const session = useCurrentSession();
  const counts = useSchoolCounts(session.data?.id);
  const classes = useMyClasses();
  const day = useSchoolDay(date);

  const marked = new Map((day.data ?? []).map((d) => [d.class_id, d]));
  const markedCount = (classes.data ?? []).filter((c) => marked.has(c.id)).length;

  return (
    <Screen
      eyebrow={longDate(date)}
      title={school.data?.name ?? (me.data ? me.data.full_name : 'Admin')}>
      <View style={styles.grid}>
        <Stat icon="graduation" tone="info" value={counts.data?.students} label="Students" />
        <Stat icon="book" tone="safe" value={counts.data?.classes} label="Classes" />
        <Stat icon="users" tone="warning" value={counts.data?.teachers} label="Teachers" />
        <Stat icon="pin" tone="caution" value={counts.data?.parents} label="Parents" />
      </View>

      <SectionTitle>Today&apos;s attendance</SectionTitle>
      <Card>
        {classes.isPending || day.isPending ? (
          <ActivityIndicator color={color.navy} />
        ) : !classes.data?.length ? (
          <T variant="listSub">No classes yet. Add one under Classes.</T>
        ) : (
          <>
            <View style={styles.row}>
              <T variant="listTitle" style={styles.flex}>
                {markedCount} of {classes.data.length} classes marked
              </T>
              <Badge
                tone={markedCount === classes.data.length ? 'safe' : 'caution'}
                label={markedCount === classes.data.length ? 'Complete' : 'In progress'}
              />
            </View>
            {classes.data.map((c) => {
              const d = marked.get(c.id);
              return (
                <Pressable
                  key={c.id}
                  onPress={() =>
                    router.push(
                      d
                        ? { pathname: '/class', params: { classId: c.id } }
                        : { pathname: '/attendance', params: { classId: c.id } },
                    )
                  }
                  style={[styles.row, styles.divider]}>
                  <View
                    style={[styles.dot, { backgroundColor: d ? color.emerald : color.trackOff }]}
                  />
                  <T variant="listTitle" style={styles.flex}>
                    {c.grade} — {c.section}
                  </T>
                  {d ? (
                    <T variant="listSub">
                      {d.present}/{d.marked} present · {Math.round(Number(d.present_pct ?? 0))}%
                    </T>
                  ) : (
                    <T variant="listSub" style={{ color: semantic.caution.fg }}>
                      Tap to mark
                    </T>
                  )}
                  <Icon name="chevron" size={16} stroke={color.inkFaint} />
                </Pressable>
              );
            })}
          </>
        )}
      </Card>

      <SectionTitle>Quick actions</SectionTitle>
      <View style={styles.grid}>
        <Quick href="/student-form" icon="graduation" tone="info" label="Add student" />
        <Quick
          href={{ pathname: '/person-form', params: { kind: 'teacher' } }}
          icon="users"
          tone="safe"
          label="Add teacher"
        />
        <Quick
          href={{ pathname: '/person-form', params: { kind: 'parent' } }}
          icon="pin"
          tone="warning"
          label="Add parent"
        />
        <Quick href="/admin/setup" icon="settings" tone="neutral" label="Sessions & calendar" />
      </View>

      <SectionTitle>Session</SectionTitle>
      <Card style={styles.row}>
        <IconTile name="calendar" tone="info" />
        <View style={styles.flex}>
          <T variant="listTitle">{session.data ? `Session ${session.data.label}` : '—'}</T>
          <T variant="listSub">
            {session.data
              ? `${session.data.starts_on} to ${session.data.ends_on}`
              : 'No current session — set one under Sessions & calendar'}
          </T>
        </View>
      </Card>
    </Screen>
  );
}

function Stat({
  icon,
  tone,
  value,
  label,
}: {
  icon: IconName;
  tone: keyof typeof semantic;
  value: number | undefined;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <IconTile name={icon} tone={tone} size={34} />
      <View>
        <T variant="statValue">{value ?? '—'}</T>
        <T variant="listSub">{label}</T>
      </View>
    </View>
  );
}

function Quick({
  href,
  icon,
  tone,
  label,
}: {
  href: Href;
  icon: IconName;
  tone: keyof typeof semantic;
  label: string;
}) {
  return (
    <Pressable
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.quick, pressed && styles.quickPressed]}>
      <IconTile name={icon} tone={tone} size={40} />
      <T variant="listSub" style={styles.quickLabel}>
        {label}
      </T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.cardGap },
  stat: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderRadius: radius.panel,
    padding: space.md,
    ...shadow.card,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 8 },
  divider: { borderTopWidth: 1, borderTopColor: color.line },
  dot: { width: 8, height: 8, borderRadius: radius.pill },
  flex: { flex: 1 },
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
});
