import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { useChild } from '@/features/parent/child';
import { avatarGradients, color, radius, space } from '@/theme';
import { T } from '@/ui/primitives';

/** Only rendered when a guardian actually has more than one child enrolled. */
export function ChildSwitcher() {
  const { children, selected, select } = useChild();
  if (children.length < 2) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {children.map((c) => {
        const active = c.id === selected?.id;
        const name = c.student?.full_name ?? 'Student';
        const gradient = avatarGradients[(c.student?.avatar_seed ?? 0) % avatarGradients.length];
        return (
          <Pressable
            key={c.id}
            onPress={() => select(c.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.chip, active && styles.chipActive]}>
            <LinearGradient
              colors={[gradient[0], gradient[1]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}>
              <T variant="badge" style={styles.avatarText}>
                {name
                  .split(' ')
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join('')}
              </T>
            </LinearGradient>
            <T variant="badge" style={active ? styles.labelActive : styles.label}>
              {name.split(' ')[0]}
            </T>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: space.sm, paddingBottom: space.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: color.surface,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: color.line,
  },
  chipActive: { borderColor: color.navy, backgroundColor: color.navyTint },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 9 },
  label: { color: color.inkSoft },
  labelActive: { color: color.navy },
});
