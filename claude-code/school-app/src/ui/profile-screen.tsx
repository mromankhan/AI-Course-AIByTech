import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { useMe, useSchool } from '@/data/queries';
import { formatPhone } from '@/lib/phone';
import { drainIfOnline, pendingCount } from '@/lib/outbox';
import { useSession } from '@/lib/session';
import { color, radius, semantic, space } from '@/theme';
import { Icon } from '@/ui/icon';
import { BrandMark, Card, T } from '@/ui/primitives';
import { Screen, SectionTitle } from '@/ui/screen';

/** Shared by both roles: who you are, what is still unsynced, and sign out. */
export function ProfileScreen() {
  const me = useMe();
  const school = useSchool();
  const { claims, signOut } = useSession();
  const qc = useQueryClient();

  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshPending = useCallback(() => {
    pendingCount().then(setPending);
  }, []);

  useEffect(refreshPending, [refreshPending]);

  async function syncNow() {
    setSyncing(true);
    const result = await drainIfOnline();
    setSyncing(false);
    refreshPending();
    if (result.sent > 0) await qc.invalidateQueries();
    if (result.remaining > 0) {
      Alert.alert('Still offline', 'Your marks are safe on this device and will sync later.');
    }
  }

  function confirmSignOut() {
    const go = async () => {
      await signOut();
      qc.clear();
    };
    if (pending > 0) {
      Alert.alert(
        'Unsynced marks',
        `${pending} attendance ${pending === 1 ? 'mark has' : 'marks have'} not reached the server yet. ` +
          'Signing out keeps them on this device, but they will only sync when you sign back in.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign out anyway', style: 'destructive', onPress: go },
        ],
      );
      return;
    }
    void go();
  }

  return (
    <Screen title="Profile">
      <Card style={styles.identity}>
        <BrandMark size={48} />
        <View style={styles.identityText}>
          <T variant="cardTitle">{me.data?.full_name ?? '—'}</T>
          <T variant="listSub">
            {school.data?.name ?? ''}
            {claims ? ` · ${claims.user_role}` : ''}
          </T>
        </View>
      </Card>

      <SectionTitle>Account</SectionTitle>
      <Card style={styles.rows}>
        {me.data?.email && !me.data.email.endsWith('.local') ? (
          <Row icon="mail" label="Email" value={me.data.email} />
        ) : null}
        {me.data?.phone ? (
          <Row icon="phone" label="Phone" value={formatPhone(me.data.phone)} />
        ) : null}
      </Card>

      <SectionTitle>Sync</SectionTitle>
      <Pressable onPress={syncNow} disabled={syncing}>
        <Card style={styles.sync}>
          <View
            style={[
              styles.icon,
              { backgroundColor: pending > 0 ? semantic.caution.bg : semantic.safe.bg },
            ]}>
            <Icon
              name={pending > 0 ? 'cloudOff' : 'check'}
              size={19}
              stroke={pending > 0 ? semantic.caution.fg : semantic.safe.fg}
            />
          </View>
          <View style={styles.flex}>
            <T variant="listTitle">
              {pending === 0
                ? 'Everything is synced'
                : `${pending} ${pending === 1 ? 'change' : 'changes'} waiting to sync`}
            </T>
            <T variant="listSub">{syncing ? 'Syncing…' : 'Tap to sync now'}</T>
          </View>
          <Icon name="refresh" size={18} stroke={color.inkFaint} />
        </Card>
      </Pressable>

      <Pressable onPress={confirmSignOut} style={styles.signOutWrap}>
        <Card style={styles.signOut}>
          <Icon name="logout" size={19} stroke={semantic.danger.fg} />
          <T variant="listTitle" style={styles.signOutLabel}>
            Sign out
          </T>
        </Card>
      </Pressable>
    </Screen>
  );
}

function Row({ icon, label, value }: { icon: 'mail' | 'phone'; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Icon name={icon} size={18} stroke={color.inkFaint} />
      <View style={styles.flex}>
        <T variant="listSub">{label}</T>
        <T variant="listTitle">{value}</T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  identityText: { flex: 1 },
  rows: { gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 4 },
  sync: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  signOutWrap: { marginTop: space.xl },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    borderRadius: radius.panel,
  },
  signOutLabel: { color: semantic.danger.fg },
});
