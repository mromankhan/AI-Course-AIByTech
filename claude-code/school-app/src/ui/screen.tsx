import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { color, space } from '@/theme';
import { T } from '@/ui/primitives';

/**
 * Standard screen frame: header block, scrolling body, pull-to-refresh.
 * Refresh refetches every active query — we deliberately do not use Realtime,
 * so this pull is the user's way of asking for fresh data.
 */
export function Screen({
  eyebrow,
  title,
  right,
  children,
}: {
  eyebrow?: string;
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await qc.refetchQueries({ type: 'active' });
    setRefreshing(false);
  }, [qc]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          {eyebrow ? <T variant="eyebrow">{eyebrow}</T> : null}
          <T variant="pageTitle" style={styles.title}>
            {title}
          </T>
        </View>
        {right}
      </View>
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={color.navy} />
        }>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function SectionTitle({ children, style }: { children: ReactNode; style?: object }) {
  return (
    <T variant="sectionTitle" style={[styles.section, style]}>
      {children}
    </T>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.screen,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  headerText: { flex: 1 },
  title: { marginTop: 2 },
  body: { paddingHorizontal: space.screen, paddingBottom: space.xxl },
  section: { marginTop: space.xl, marginBottom: space.sm },
});
