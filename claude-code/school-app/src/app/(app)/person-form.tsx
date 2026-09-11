import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { useProvisionUser, useSessionEnrollments } from '@/data/admin';
import { useCurrentSession } from '@/data/queries';
import { normalisePhone } from '@/lib/phone';
import { color, font, semantic, space } from '@/theme';
import { Avatar, Flow, FormLabel, Input } from '@/ui/bits';
import { Icon } from '@/ui/icon';
import { Banner, Button, Card, T } from '@/ui/primitives';

/**
 * Create a teacher or parent account. There is no self-signup anywhere in the
 * app — this form, calling the provision-user Edge Function, is the only way
 * an account comes to exist. Teachers get email + password; parents get
 * phone + 6-digit PIN and are linked to their children in the same step.
 */
export default function PersonForm() {
  const { kind, studentId } = useLocalSearchParams<{
    kind: 'teacher' | 'parent';
    studentId?: string;
  }>();
  const isParent = kind === 'parent';
  const session = useCurrentSession();
  const enrollments = useSessionEnrollments(isParent ? session.data?.id : undefined);
  const provision = useProvisionUser();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [relation, setRelation] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set(studentId ? [studentId] : []));
  const [error, setError] = useState<string | null>(null);

  const students = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (enrollments.data ?? [])
      .filter((e) => e.student)
      .filter((e) => !q || e.student!.full_name.toLowerCase().includes(q))
      .sort((a, b) => a.student!.full_name.localeCompare(b.student!.full_name));
  }, [enrollments.data, query]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    if (!name.trim()) return setError('Enter the full name.');
    if (isParent) {
      if (!normalisePhone(phone))
        return setError('Enter a Pakistani mobile number, e.g. 0300 1234567.');
      if (!/^\d{6}$/.test(pin)) return setError('The PIN must be exactly 6 digits.');
      if (selected.size === 0) return setError('Link at least one child.');
    } else {
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.');
      if (password.length < 8) return setError('Password must be at least 8 characters.');
    }
    setError(null);
    try {
      await provision.mutateAsync(
        isParent
          ? {
              kind: 'parent',
              full_name: name.trim(),
              phone,
              pin,
              student_ids: [...selected],
              relation: relation.trim() || undefined,
            }
          : {
              kind: 'teacher',
              full_name: name.trim(),
              email: email.trim(),
              password,
              employee_id: employeeId.trim() || undefined,
            },
      );
      Alert.alert(
        'Account created',
        isParent
          ? `Tell the parent to sign in with ${phone.trim()} and the PIN you set.`
          : `Tell ${name.trim().split(' ')[0]} to sign in with ${email.trim()} and the password you set.`,
        [{ text: 'Done', onPress: () => router.back() }],
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the account.');
    }
  }

  return (
    <Flow
      title={isParent ? 'New parent account' : 'New teacher account'}
      footer={<Button label="Create account" onPress={submit} loading={provision.isPending} />}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {error ? <Banner tone="danger">{error}</Banner> : null}

        <Input
          label="Full name"
          value={name}
          onChangeText={setName}
          placeholder={isParent ? 'Mrs. Iqbal' : 'Ms. Sana Tariq'}
          autoCapitalize="words"
        />

        {isParent ? (
          <>
            <Input
              label="Mobile number"
              value={phone}
              onChangeText={setPhone}
              placeholder="0300 1234567"
              keyboardType="phone-pad"
              hint="This is what the parent types to sign in."
            />
            <Input
              label="6-digit PIN"
              value={pin}
              onChangeText={(v) => setPin(v.replace(/\D/g, '').slice(0, 6))}
              placeholder="112233"
              keyboardType="number-pad"
              maxLength={6}
              hint="Share it with the parent in person. They cannot reset it themselves."
            />
            <Input
              label="Relation (optional)"
              value={relation}
              onChangeText={setRelation}
              placeholder="Mother"
              autoCapitalize="words"
            />

            <FormLabel>Children ({selected.size} selected)</FormLabel>
            <View style={styles.search}>
              <Icon name="search" size={18} stroke={color.inkFaint} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search students"
                placeholderTextColor={color.inkFaint}
                style={styles.searchInput}
                autoCorrect={false}
              />
            </View>
            <Card style={styles.list}>
              {students.length === 0 ? (
                <T variant="listSub">No students match.</T>
              ) : (
                students.slice(0, 40).map((e, i) => {
                  const st = e.student!;
                  const on = selected.has(st.id);
                  return (
                    <Pressable
                      key={e.id}
                      onPress={() => toggle(st.id)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                      style={[styles.row, i > 0 && styles.divider]}>
                      <Avatar name={st.full_name} seed={st.avatar_seed} size={32} />
                      <View style={styles.flex}>
                        <T variant="listTitle">{st.full_name}</T>
                        <T variant="listSub">
                          {e.class ? `${e.class.grade} ${e.class.section}` : ''} · Roll {e.roll_no}
                        </T>
                      </View>
                      <View style={[styles.check, on && styles.checkOn]}>
                        {on ? <Icon name="check" size={14} stroke="#fff" width={2.6} /> : null}
                      </View>
                    </Pressable>
                  );
                })
              )}
              {students.length > 40 ? (
                <T variant="faint" style={styles.more}>
                  Showing 40 — search to narrow down.
                </T>
              ) : null}
            </Card>
          </>
        ) : (
          <>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="teacher@school.edu"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              label="Temporary password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              autoCapitalize="none"
              autoCorrect={false}
              hint="Share it in person. The teacher can change it from their profile later."
            />
            <Input
              label="Employee ID (optional)"
              value={employeeId}
              onChangeText={setEmployeeId}
              placeholder="T-014"
              autoCapitalize="characters"
            />
          </>
        )}
        <View style={styles.spacer} />
      </ScrollView>
    </Flow>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: space.screen, paddingTop: space.sm },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: color.surface,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: color.line,
    paddingHorizontal: 12,
    marginBottom: space.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: font.body,
    fontSize: 13.5,
    color: color.ink,
  },
  list: { paddingVertical: space.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 9 },
  divider: { borderTopWidth: 1, borderTopColor: color.line },
  flex: { flex: 1 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: color.trackOff,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: semantic.safe.solid, borderColor: semantic.safe.solid },
  more: { textAlign: 'center', paddingTop: space.sm },
  spacer: { height: space.xxl },
});
