import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useLinkGuardian, useParents, useStudent, useUnlinkGuardian } from '@/data/admin';
import { useCurrentSession, useMe, useMyClasses } from '@/data/queries';
import { formatPhone } from '@/lib/phone';
import { color, space } from '@/theme';
import { AddButton, Avatar, Chip, ChipRow, Empty, Flow, IconTile, Input, Row } from '@/ui/bits';
import { Icon } from '@/ui/icon';
import { Banner, Button, Card, T } from '@/ui/primitives';
import { SectionTitle } from '@/ui/screen';

/**
 * One student, for an admin: enrollment details and guardians. A guardian is
 * a link in the `guardians` table — a student can have two, a parent can have
 * several children — so this screen links and unlinks rather than "sets".
 */
export default function StudentDetail() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const me = useMe();
  const session = useCurrentSession();
  const classes = useMyClasses();
  const student = useStudent(studentId, session.data?.id);
  const parents = useParents();
  const link = useLinkGuardian();
  const unlink = useUnlinkGuardian();

  const [linking, setLinking] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [relation, setRelation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const s = student.data;
  const klass = classes.data?.find((c) => c.id === s?.enrollment?.class_id);
  const linkedIds = new Set((s?.guardians ?? []).map((g) => g.parent?.id));
  const candidates = (parents.data ?? []).filter((p) => !linkedIds.has(p.id));

  async function addLink() {
    if (!parentId) return setError('Choose a parent.');
    if (!me.data) return;
    setError(null);
    try {
      await link.mutateAsync({
        school_id: me.data.school_id,
        student_id: studentId,
        profile_id: parentId,
        relation: relation.trim() || null,
      });
      setLinking(false);
      setParentId(null);
      setRelation('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not link.');
    }
  }

  function confirmUnlink(id: string, name: string) {
    Alert.alert(`Unlink ${name}?`, 'They will no longer see this child in the app.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Unlink', style: 'destructive', onPress: () => void unlink.mutateAsync(id) },
    ]);
  }

  return (
    <Flow
      title={s?.full_name ?? 'Student'}
      sub={
        klass
          ? `${klass.grade} — Section ${klass.section} · Roll ${s?.enrollment?.roll_no}`
          : undefined
      }
      right={
        <Pressable
          hitSlop={10}
          onPress={() => router.push({ pathname: '/student-form', params: { studentId } })}
          accessibilityLabel="Edit student">
          <Icon name="edit" size={20} stroke={color.inkSoft} />
        </Pressable>
      }>
      {student.isPending ? (
        <ActivityIndicator color={color.navy} style={styles.loading} />
      ) : !s ? (
        <Card style={styles.card}>
          <Empty icon="graduation" text="Student not found." />
        </Card>
      ) : (
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Card style={styles.identity}>
            <Avatar name={s.full_name} seed={s.avatar_seed} size={52} />
            <View style={styles.flex}>
              <T variant="cardTitle">{s.full_name}</T>
              <T variant="listSub">
                {s.enrollment
                  ? `Enrolled · ${klass ? `${klass.grade} ${klass.section}` : ''} · Roll ${s.enrollment.roll_no}`
                  : 'Not enrolled this session'}
              </T>
            </View>
          </Card>

          <View style={styles.sectionRow}>
            <SectionTitle style={styles.flex}>Guardians</SectionTitle>
            <AddButton label="Link parent" onPress={() => setLinking((v) => !v)} />
          </View>

          {linking ? (
            <Card style={styles.linkCard}>
              {error ? <Banner tone="danger">{error}</Banner> : null}
              <T variant="listSub" style={styles.linkHint}>
                Pick an existing parent account, or create a new one.
              </T>
              <ChipRow style={styles.chips}>
                {candidates.map((p) => (
                  <Chip
                    key={p.id}
                    label={p.full_name}
                    active={parentId === p.id}
                    onPress={() => setParentId(p.id)}
                  />
                ))}
              </ChipRow>
              {candidates.length === 0 ? (
                <T variant="faint" style={styles.chips}>
                  Every parent account is already linked to this student.
                </T>
              ) : null}
              <Input
                label="Relation (optional)"
                value={relation}
                onChangeText={setRelation}
                placeholder="Mother, Father, Uncle…"
                autoCapitalize="words"
              />
              <Button
                label="Link"
                onPress={addLink}
                loading={link.isPending}
                disabled={!parentId}
              />
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/person-form', params: { kind: 'parent', studentId } })
                }
                style={styles.createParent}>
                <T variant="badge" style={{ color: color.navy }}>
                  Create a new parent account for {s.full_name.split(' ')[0]}
                </T>
              </Pressable>
            </Card>
          ) : null}

          <Card style={styles.card}>
            {s.guardians.length ? (
              s.guardians.map((g, i) => (
                <Row
                  key={g.id}
                  first={i === 0}
                  leading={<IconTile name="pin" tone="warning" />}
                  title={g.parent?.full_name ?? 'Parent'}
                  sub={[g.relation, g.parent?.phone ? formatPhone(g.parent.phone) : null]
                    .filter(Boolean)
                    .join(' · ')}
                  trailing={
                    <Pressable
                      hitSlop={10}
                      onPress={() => confirmUnlink(g.id, g.parent?.full_name ?? 'this parent')}
                      accessibilityLabel="Unlink">
                      <Icon name="x" size={18} stroke={color.inkFaint} />
                    </Pressable>
                  }
                />
              ))
            ) : (
              <Empty
                icon="pin"
                text="No guardian linked. Until one is, nobody can see this child's attendance or results."
              />
            )}
          </Card>
          <View style={styles.spacer} />
        </ScrollView>
      )}
    </Flow>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: space.xxl },
  body: { paddingHorizontal: space.screen, paddingTop: space.xs },
  identity: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flex: { flex: 1 },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md },
  card: { paddingVertical: space.xs },
  linkCard: { marginBottom: space.cardGap },
  linkHint: { marginBottom: space.sm },
  chips: { marginBottom: space.md },
  createParent: { alignItems: 'center', paddingTop: space.md },
  spacer: { height: space.xxl },
});
