import { Stack } from 'expo-router';

import { useSession } from '@/lib/session';
import { color } from '@/theme';

/**
 * Role routing. `user_role` comes off the JWT, so it cannot be spoofed by the
 * client and matches exactly what RLS will enforce on every query.
 */
export default function AppLayout() {
  const { claims } = useSession();
  const role = claims?.user_role;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg } }}>
      <Stack.Protected guard={role === 'teacher' || role === 'admin'}>
        <Stack.Screen name="teacher" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'parent'}>
        <Stack.Screen name="parent" />
      </Stack.Protected>
    </Stack>
  );
}
