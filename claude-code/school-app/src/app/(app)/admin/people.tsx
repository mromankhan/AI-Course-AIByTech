import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { useParents, useStaff } from '@/data/admin';
import { formatPhone } from '@/lib/phone';
import { color, space } from '@/theme';
import { AddButton, Badge, Empty, IconTile, Row, Segmented } from '@/ui/bits';
import { Card } from '@/ui/primitives';
import { Screen } from '@/ui/screen';

type Kind = 'teacher' | 'parent';

/** Staff and parent accounts. Accounts are only ever created from here. */
export default function AdminPeople() {
  const [kind, setKind] = useState<Kind>('teacher');
  const staff = useStaff();
  const parents = useParents();

  return (
    <Screen
      title="People"
      right={
        <AddButton
          label={kind === 'teacher' ? 'Add teacher' : 'Add parent'}
          onPress={() => router.push({ pathname: '/person-form', params: { kind } })}
        />
      }>
      <Segmented
        value={kind}
        onChange={setKind}
        options={[
          { value: 'teacher', label: `Staff (${staff.data?.length ?? '…'})` },
          { value: 'parent', label: `Parents (${parents.data?.length ?? '…'})` },
        ]}
      />

      {kind === 'teacher' ? (
        staff.isPending ? (
          <ActivityIndicator color={color.navy} style={styles.loading} />
        ) : (
          <Card style={styles.card}>
            {staff.data?.length ? (
              staff.data.map((p, i) => (
                <Row
                  key={p.id}
                  first={i === 0}
                  leading={
                    <IconTile
                      name={p.role === 'admin' ? 'shield' : 'user'}
                      tone={p.role === 'admin' ? 'caution' : 'info'}
                    />
                  }
                  title={p.full_name}
                  sub={[p.email, p.employee_id ? `ID ${p.employee_id}` : null]
                    .filter(Boolean)
                    .join(' · ')}
                  trailing={<Badge tone={p.role === 'admin' ? 'caution' : 'info'} label={p.role} />}
                />
              ))
            ) : (
              <Empty icon="users" text="No staff accounts yet." />
            )}
          </Card>
        )
      ) : parents.isPending ? (
        <ActivityIndicator color={color.navy} style={styles.loading} />
      ) : (
        <Card style={styles.card}>
          {parents.data?.length ? (
            parents.data.map((p, i) => {
              const kids = p.guardians
                .map((g) => g.student?.full_name?.split(' ')[0])
                .filter(Boolean);
              return (
                <Row
                  key={p.id}
                  first={i === 0}
                  leading={<IconTile name="pin" tone="warning" />}
                  title={p.full_name}
                  sub={`${p.phone ? formatPhone(p.phone) : ''}${kids.length ? ` · ${kids.join(', ')}` : ' · no child linked'}`}
                  trailing={kids.length ? undefined : <Badge tone="danger" label="Unlinked" />}
                  onPress={
                    p.guardians[0]?.student?.id
                      ? () =>
                          router.push({
                            pathname: '/student',
                            params: { studentId: p.guardians[0]!.student!.id },
                          })
                      : undefined
                  }
                />
              );
            })
          ) : (
            <Empty icon="pin" text="No parent accounts yet." />
          )}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: space.xl },
  card: { paddingVertical: space.xs },
});
