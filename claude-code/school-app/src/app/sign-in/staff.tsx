import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/lib/session';
import { color, space } from '@/theme';
import { Icon } from '@/ui/icon';
import { Banner, BrandMark, Button, Field, T } from '@/ui/primitives';

/** Teachers and admins sign in with the email their school provisioned. */
export default function StaffSignIn() {
  const { signInStaff } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const { error: err } = await signInStaff(email, password);
    // On success the root layout swaps the navigator; nothing to push here.
    if (err) {
      setError(err);
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <BackButton />
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <BrandMark size={54} />
          </View>
          <T variant="loginTitle" style={styles.center}>
            School Staff Login
          </T>
          <T variant="listSub" style={[styles.center, styles.sub]}>
            Sign in to manage your class
          </T>

          {error ? <Banner tone="danger">{error}</Banner> : null}

          <Field
            icon="mail"
            value={email}
            onChangeText={setEmail}
            placeholder="name@school.edu"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            inputMode="email"
            returnKeyType="next"
          />
          <Field
            icon="lock"
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            returnKeyType="go"
            onSubmitEditing={submit}
          />

          <Button label="Log In" onPress={submit} loading={busy} style={styles.submit} />

          <T variant="faint" style={[styles.center, styles.foot]}>
            No account? Your school administrator creates staff logins.
          </T>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function BackButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={12}
      onPress={() => router.back()}
      style={styles.back}>
      <Icon name="chevronLeft" size={22} stroke={color.inkSoft} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  fill: { flex: 1 },
  back: { paddingHorizontal: space.screen, paddingVertical: space.md, alignSelf: 'flex-start' },
  body: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 26, paddingBottom: 60 },
  logo: { alignItems: 'center', marginBottom: 16 },
  center: { textAlign: 'center' },
  sub: { marginTop: 5, marginBottom: 26 },
  submit: { marginTop: 8 },
  foot: { marginTop: 18 },
});
