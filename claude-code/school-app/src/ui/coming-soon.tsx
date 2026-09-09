import { StyleSheet, View } from 'react-native';

import { color, radius, semantic, space } from '@/theme';
import { Icon, type IconName } from '@/ui/icon';
import { Card, T } from '@/ui/primitives';
import { Screen } from '@/ui/screen';

/**
 * An honest placeholder. The schema, RLS and seed data behind these screens are
 * already in place — only the UI is outstanding — so this says which milestone
 * builds it rather than pretending to be a real screen.
 */
export function ComingSoon({
  title,
  icon,
  milestone,
  what,
}: {
  title: string;
  icon: IconName;
  milestone: string;
  what: string;
}) {
  return (
    <Screen title={title}>
      <Card style={styles.card}>
        <View style={styles.icon}>
          <Icon name={icon} size={24} stroke={semantic.info.fg} />
        </View>
        <T variant="cardTitle" style={styles.center}>
          {milestone}
        </T>
        <T variant="listSub" style={styles.center}>
          {what}
        </T>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: space.sm, paddingVertical: space.xxl },
  icon: {
    width: 52,
    height: 52,
    borderRadius: radius.panel,
    backgroundColor: semantic.info.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xs,
  },
  center: { textAlign: 'center', color: color.inkSoft },
});
