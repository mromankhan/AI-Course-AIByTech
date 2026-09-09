import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { color, semantic } from '@/theme';
import { T } from '@/ui/primitives';

/**
 * The prototype's attendance ring. The percentage is whatever
 * student_attendance_summary returns — present / days_marked — and is never
 * recomputed here, so the number on screen always matches the database.
 */
export function Ring({
  pct,
  size = 132,
  stroke = 12,
  caption,
}: {
  pct: number | null;
  size?: number;
  stroke?: number;
  caption?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = Math.max(0, Math.min(100, pct ?? 0));

  // Below 75% is the threshold Pakistani schools generally act on.
  const tone = value >= 90 ? semantic.safe : value >= 75 ? semantic.warning : semantic.danger;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color.neutral}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tone.solid}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <T variant="screenTitle">{pct === null ? '—' : `${Math.round(value)}%`}</T>
        {caption ? <T variant="listSub">{caption}</T> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
