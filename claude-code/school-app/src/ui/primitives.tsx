import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  type TextProps,
  TextInput,
  type TextInputProps,
  View,
  type ViewProps,
} from 'react-native';

import { color, radius, shadow, space, type as typeScale } from '@/theme';
import { Icon, type IconName } from '@/ui/icon';

/** Text with a token style applied. Never style text ad hoc at the call site. */
export function T({
  variant = 'listTitle',
  style,
  ...rest
}: TextProps & { variant?: keyof typeof typeScale }) {
  return <Text {...rest} style={[typeScale[variant], style]} />;
}

export function Card({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[styles.card, style]} />;
}

export function Button({
  label,
  loading,
  disabled,
  style,
  ...rest
}: PressableProps & { label: string; loading?: boolean }) {
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={off}
      {...rest}
      style={(state) => [
        styles.button,
        state.pressed && styles.buttonPressed,
        off && styles.buttonOff,
        typeof style === 'function' ? style(state) : style,
      ]}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

/** The prototype's .login-field: bordered row with a leading icon. */
export function Field({ icon, style, ...rest }: TextInputProps & { icon: IconName }) {
  return (
    <View style={styles.field}>
      <Icon name={icon} size={19} stroke={color.inkFaint} />
      <TextInput
        placeholderTextColor={color.inkFaint}
        {...rest}
        style={[styles.fieldInput, style]}
      />
    </View>
  );
}

/** The brand mark: navy→emerald gradient tile with the book glyph. */
export function BrandMark({ size = 64 }: { size?: number }) {
  return (
    <LinearGradient
      colors={[color.navy, color.emerald]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.brandMark, { width: size, height: size, borderRadius: size * 0.31 }]}>
      <Icon name="book" size={size * 0.5} stroke="#fff" width={1.7} />
    </LinearGradient>
  );
}

export function Banner({ tone, children }: { tone: 'danger' | 'info'; children: ReactNode }) {
  const s =
    tone === 'danger'
      ? { bg: color.coralSoft, fg: color.coralText }
      : { bg: color.blueSoft, fg: color.blueText };
  return (
    <View style={[styles.banner, { backgroundColor: s.bg }]}>
      <Text style={[typeScale.listSub, { color: s.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    padding: space.card,
    ...shadow.card,
  },
  button: {
    width: '100%',
    backgroundColor: color.navy,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...shadow.raised,
  },
  buttonPressed: { backgroundColor: color.navyDeep },
  buttonOff: { opacity: 0.55 },
  buttonLabel: { fontFamily: 'Manrope_700Bold', fontSize: 14, color: '#fff' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: color.surface,
    borderWidth: 1.5,
    borderColor: color.line,
    borderRadius: 13,
    paddingHorizontal: 14,
    marginBottom: space.md,
  },
  fieldInput: {
    flex: 1,
    paddingVertical: 13,
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    color: color.ink,
  },
  brandMark: { alignItems: 'center', justifyContent: 'center', ...shadow.raised },
  banner: {
    borderRadius: radius.chip,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: space.md,
  },
});
