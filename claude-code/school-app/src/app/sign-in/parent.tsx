import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/lib/session';
import { color } from '@/theme';
import { Banner, BrandMark, Button, Field, T } from '@/ui/primitives';

import { BackButton } from './staff';

/**
 * Phone + PIN, exactly as the school hands it out at admission. The synthetic
 * email that Supabase Auth actually receives is derived in lib/phone.ts and is
 * never shown here.
 */
export default function ParentSignIn() {
  const { signInParent } = useSession();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const { error: err } = await signInParent(phone, pin);
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
            Parent Login
          </T>
          <T variant="listSub" style={[styles.center, styles.sub]}>
            View your child&apos;s academic &amp; attendance reports
          </T>

          {error ? <Banner tone="danger">{error}</Banner> : null}

          <Field
            icon="phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="0300 1234567"
            keyboardType="phone-pad"
            inputMode="tel"
            autoComplete="tel"
            returnKeyType="next"
          />
          <Field
            icon="lock"
            value={pin}
            onChangeText={setPin}
            placeholder="Access code"
            secureTextEntry
            keyboardType="number-pad"
            inputMode="numeric"
            returnKeyType="go"
            onSubmitEditing={submit}
          />

          <Button label="Log In" onPress={submit} loading={busy} style={styles.submit} />

          <T variant="faint" style={[styles.center, styles.foot]}>
            Your access code was shared by the school at admission.
          </T>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  fill: { flex: 1 },
  body: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 26, paddingBottom: 60 },
  logo: { alignItems: 'center', marginBottom: 16 },
  center: { textAlign: 'center' },
  sub: { marginTop: 5, marginBottom: 26 },
  submit: { marginTop: 8 },
  foot: { marginTop: 18 },
});
