import { StyleSheet, View } from 'react-native';

import { color, radius, space } from '@/theme';
import { T } from '@/ui/primitives';

export type Counts = { present: number; absent: number; late: number; leave: number };

const legend = [
  { key: 'present', label: 'Present', solid: color.emerald },
  { key: 'absent', label: 'Absent', solid: color.coral },
  { key: 'late', label: 'Late', solid: color.yellow },
  { key: 'leave', label: 'Leave', solid: color.blue },
] as const;

/** The prototype's .status-track: one proportional bar plus a dotted legend. */
export function StatusBar({ counts }: { counts: Counts }) {
  const total = counts.present + counts.absent + counts.late + counts.leave;

  return (
    <View>
      <View style={styles.track}>
        {total > 0 &&
          legend.map(({ key, solid }) =>
            counts[key] > 0 ? (
              <View
                key={key}
                style={{ backgroundColor: solid, width: `${(counts[key] / total) * 100}%` }}
              />
            ) : null,
          )}
      </View>
      <View style={styles.legend}>
        {legend.map(({ key, label, solid }) => (
          <View key={key} style={styles.item}>
            <View style={[styles.dot, { backgroundColor: solid }]} />
            <T variant="listSub">
              {counts[key]} {label}
            </T>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 8,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: color.neutral,
    marginTop: 11,
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: radius.pill },
});
