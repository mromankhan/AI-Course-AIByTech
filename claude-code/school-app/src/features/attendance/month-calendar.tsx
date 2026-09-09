import { StyleSheet, View } from 'react-native';

import type { Database } from '@/lib/database.types';
import { attendanceRole, color, radius, semantic, space } from '@/theme';
import { T } from '@/ui/primitives';

type Status = Database['public']['Enums']['attendance_status'];

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/**
 * A month grid of attendance.
 *
 * Only the four stored statuses come from the database. Weekends are derived
 * from the date and holidays from `school_calendar` — neither is a per-student
 * attendance row, which is what keeps a 20-school-day month from looking like
 * 31 days with 11 absences.
 */
export function MonthCalendar({
  month,
  marks,
  holidays,
}: {
  /** YYYY-MM-01 */
  month: string;
  marks: Record<string, Status>;
  holidays: Record<string, string>;
}) {
  const [year, mon] = month.split('-').map(Number);
  const first = new Date(year, mon - 1, 1);
  const daysInMonth = new Date(year, mon, 0).getDate();
  // JS weeks start Sunday; the grid starts Monday, as the prototype does.
  const lead = (first.getDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <View>
      <View style={styles.week}>
        {WEEKDAYS.map((d, i) => (
          <T key={i} variant="faint" style={styles.weekday}>
            {d}
          </T>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) return <View key={i} style={styles.cell} />;

          const iso = `${month.slice(0, 7)}-${String(day).padStart(2, '0')}`;
          const weekend = [0, 6].includes(new Date(year, mon - 1, day).getDay());
          const holiday = holidays[iso];
          const status = marks[iso];

          const tone = status ? semantic[attendanceRole[status]] : null;

          return (
            <View
              key={i}
              style={[
                styles.cell,
                styles.day,
                tone ? { backgroundColor: tone.bg } : null,
                !tone && holiday ? styles.holiday : null,
              ]}>
              <T
                variant="badge"
                style={[
                  styles.dayText,
                  tone ? { color: tone.fg } : null,
                  !tone && (weekend || holiday) ? styles.muted : null,
                ]}>
                {day}
              </T>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        {(['present', 'absent', 'late', 'leave'] as Status[]).map((s) => (
          <View key={s} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: semantic[attendanceRole[s]].solid }]} />
            <T variant="listSub" style={styles.legendLabel}>
              {s}
            </T>
          </View>
        ))}
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: color.trackOff }]} />
          <T variant="listSub" style={styles.legendLabel}>
            holiday
          </T>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  week: { flexDirection: 'row', marginBottom: space.xs },
  weekday: { flex: 1, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2.5 },
  day: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.cell,
  },
  holiday: { backgroundColor: color.neutral },
  dayText: { color: color.ink },
  muted: { color: color.weekendText },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
    marginTop: space.md,
    justifyContent: 'center',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendLabel: { textTransform: 'capitalize' },
  dot: { width: 7, height: 7, borderRadius: radius.pill },
});
