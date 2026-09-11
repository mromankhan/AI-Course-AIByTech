import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { avatarGradients, color, font, radius, semantic, shadow, space } from '@/theme';
import { Icon, type IconName } from '@/ui/icon';
import { T } from '@/ui/primitives';

/** Small building blocks shared by the list, form and detail screens. */

export type Tone = keyof typeof semantic;

export function Badge({ tone, label, icon }: { tone: Tone; label: string; icon?: IconName }) {
  const s = semantic[tone];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      {icon ? <Icon name={icon} size={13} stroke={s.fg} width={2.4} /> : null}
      <T variant="badge" style={{ color: s.fg }}>
        {label}
      </T>
    </View>
  );
}

/** Grade letter tile: A green … F coral, from the school's grade_bands. */
export function GradeBadge({ grade, size = 34 }: { grade: string | null; size?: number }) {
  const tone: Tone =
    grade === 'A'
      ? 'safe'
      : grade === 'B'
        ? 'info'
        : grade === 'C'
          ? 'warning'
          : grade === 'D'
            ? 'caution'
            : grade
              ? 'danger'
              : 'neutral';
  const s = semantic[tone];
  return (
    <View
      style={[
        styles.gradeTile,
        { width: size, height: size, borderRadius: size * 0.3, backgroundColor: s.bg },
      ]}>
      <T variant="statValue" style={{ color: s.fg, fontSize: size * 0.42 }}>
        {grade ?? '–'}
      </T>
    </View>
  );
}

/** Gradient initials, keyed by avatar_seed so a student looks the same everywhere. */
export function Avatar({ name, seed, size = 36 }: { name: string; seed: number; size?: number }) {
  const g = avatarGradients[seed % avatarGradients.length];
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
  return (
    <LinearGradient
      colors={[g[0], g[1]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.avatar, { width: size, height: size }]}>
      <T variant="badge" style={{ color: '#fff', fontSize: size * 0.32 }}>
        {initials}
      </T>
    </LinearGradient>
  );
}

/** One selectable pill. Colour is the tone when active, neutral otherwise. */
export function Chip({
  label,
  active,
  tone = 'info',
  onPress,
  disabled,
}: {
  label: string;
  active: boolean;
  tone?: Tone;
  onPress: () => void;
  disabled?: boolean;
}) {
  const s = semantic[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: s.bg, borderColor: s.solid },
        disabled && styles.off,
      ]}>
      <T variant="badge" style={{ color: active ? s.fg : color.inkSoft }}>
        {label}
      </T>
    </Pressable>
  );
}

export function ChipRow({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.chipRow, style]}>{children}</View>;
}

/** Labelled text input for forms — the login Field without the leading icon. */
export function Input({
  label,
  hint,
  error,
  style,
  ...rest
}: TextInputProps & { label?: string; hint?: string; error?: string | null }) {
  return (
    <View style={label ? styles.inputWrap : undefined}>
      {label ? (
        <T variant="listSub" style={styles.inputLabel}>
          {label}
        </T>
      ) : null}
      <TextInput
        placeholderTextColor={color.inkFaint}
        {...rest}
        style={[
          styles.input,
          rest.multiline && styles.inputMulti,
          error && styles.inputError,
          style,
        ]}
      />
      {error ? (
        <T variant="faint" style={styles.error}>
          {error}
        </T>
      ) : hint ? (
        <T variant="faint" style={styles.hint}>
          {hint}
        </T>
      ) : null}
    </View>
  );
}

/** Tap-to-pick date, Android native dialog. Value is YYYY-MM-DD. */
export function DateInput({
  label,
  value,
  onChange,
  minimum,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  minimum?: string;
}) {
  function open() {
    DateTimePickerAndroid.open({
      value: new Date(`${value}T00:00:00`),
      mode: 'date',
      minimumDate: minimum ? new Date(`${minimum}T00:00:00`) : undefined,
      onChange: (event, date) => {
        if (event.type !== 'set' || !date) return;
        const pad = (n: number) => String(n).padStart(2, '0');
        onChange(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
      },
    });
  }
  return (
    <View style={styles.inputWrap}>
      <T variant="listSub" style={styles.inputLabel}>
        {label}
      </T>
      <Pressable onPress={open} style={[styles.input, styles.dateInput]}>
        <T variant="body">
          {new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </T>
        <Icon name="calendar" size={18} stroke={color.inkFaint} />
      </Pressable>
    </View>
  );
}

export function FormLabel({ children }: { children: ReactNode }) {
  return (
    <T variant="listSub" style={styles.inputLabel}>
      {children}
    </T>
  );
}

/** A tappable list row: leading slot, title/sub, trailing slot or chevron. */
export function Row({
  leading,
  title,
  sub,
  trailing,
  onPress,
  first,
}: {
  leading?: ReactNode;
  title: string;
  sub?: string | null;
  trailing?: ReactNode;
  onPress?: () => void;
  first?: boolean;
}) {
  const body = (
    <View style={[styles.row, !first && styles.divider]}>
      {leading}
      <View style={styles.rowText}>
        <T variant="listTitle" numberOfLines={1}>
          {title}
        </T>
        {sub ? (
          <T variant="listSub" numberOfLines={2}>
            {sub}
          </T>
        ) : null}
      </View>
      {trailing ?? (onPress ? <Icon name="chevron" size={18} stroke={color.inkFaint} /> : null)}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

export function IconTile({ name, tone, size = 38 }: { name: IconName; tone: Tone; size?: number }) {
  const s = semantic[tone];
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: size * 0.31, backgroundColor: s.bg },
      ]}>
      <Icon name={name} size={size * 0.5} stroke={s.fg} />
    </View>
  );
}

export function Empty({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.empty}>
      <Icon name={icon} size={26} stroke={color.inkFaint} />
      <T variant="listSub" style={styles.emptyText}>
        {text}
      </T>
    </View>
  );
}

/** Small round "+" used in section headers. */
export function AddButton({ onPress, label = 'Add' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.add}>
      <Icon name="plus" size={15} stroke={color.navy} width={2.4} />
      <T variant="badge" style={{ color: color.navy }}>
        {label}
      </T>
    </Pressable>
  );
}

/**
 * Frame for a full-screen flow pushed on top of the tabs: back chevron, title,
 * optional subtitle and right slot, then whatever body the screen needs.
 */
export function Flow({
  title,
  sub,
  right,
  children,
  footer,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.flow} edges={['top', 'left', 'right']}>
      <View style={styles.flowHeader}>
        <Pressable hitSlop={12} onPress={() => router.back()} accessibilityLabel="Back">
          <Icon name="chevronLeft" size={22} stroke={color.inkSoft} />
        </Pressable>
        <View style={styles.flowText}>
          <T variant="overlayTitle" numberOfLines={1}>
            {title}
          </T>
          {sub ? (
            <T variant="listSub" numberOfLines={1}>
              {sub}
            </T>
          ) : null}
        </View>
        {right}
      </View>
      {children}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

export function Segmented<V extends string>({
  value,
  options,
  onChange,
}: {
  value: V;
  options: { value: V; label: string }[];
  onChange: (v: V) => void;
}) {
  return (
    <View style={styles.segment}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.segmentItem, active && styles.segmentActive]}>
            <T variant="badge" style={{ color: active ? color.navy : color.inkSoft }}>
              {o.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  gradeTile: { alignItems: 'center', justifyContent: 'center' },
  avatar: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    borderWidth: 1.5,
    borderColor: color.line,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  off: { opacity: 0.45 },
  inputWrap: { marginBottom: space.md },
  inputLabel: { marginBottom: 5, color: color.inkSoft, fontFamily: font.bodyMedium },
  input: {
    backgroundColor: color.surface,
    borderWidth: 1.5,
    borderColor: color.line,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: font.body,
    fontSize: 13.5,
    color: color.ink,
  },
  inputMulti: { minHeight: 84, textAlignVertical: 'top' },
  inputError: { borderColor: color.coral },
  dateInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  error: { color: color.coralText, marginTop: 4 },
  hint: { marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderTopColor: color.line },
  rowText: { flex: 1 },
  tile: { alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl },
  emptyText: { textAlign: 'center', maxWidth: 260 },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: color.navyTint,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  flow: { flex: 1, backgroundColor: color.bg },
  flowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.screen,
    paddingVertical: space.md,
  },
  flowText: { flex: 1 },
  footer: {
    paddingHorizontal: space.screen,
    paddingTop: space.md,
    paddingBottom: space.xl,
    backgroundColor: color.bg,
    borderTopWidth: 1,
    borderTopColor: color.line,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: color.track,
    borderRadius: radius.pill,
    padding: 3,
    marginBottom: space.md,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  segmentActive: { backgroundColor: color.surface, ...shadow.card },
});
