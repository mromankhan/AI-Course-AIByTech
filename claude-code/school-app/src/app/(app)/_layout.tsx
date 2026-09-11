import { Stack } from 'expo-router';

import { useSession } from '@/lib/session';
import { color } from '@/theme';

/**
 * Role routing. `user_role` comes off the JWT, so it cannot be spoofed by the
 * client and matches exactly what RLS will enforce on every query.
 *
 * The tab groups are per role. The flow screens below them (mark attendance,
 * test form, results entry, feedback form, class detail) are shared by teacher
 * and admin — an admin can do anything a class teacher can, for any class.
 */
export default function AppLayout() {
  const { claims } = useSession();
  const role = claims?.user_role;
  const staff = role === 'teacher' || role === 'admin';

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg } }}>
      <Stack.Protected guard={role === 'teacher'}>
        <Stack.Screen name="teacher" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'admin'}>
        <Stack.Screen name="admin" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'parent'}>
        <Stack.Screen name="parent" />
      </Stack.Protected>

      <Stack.Protected guard={staff}>
        <Stack.Screen name="attendance" />
        <Stack.Screen name="test-form" />
        <Stack.Screen name="results" />
        <Stack.Screen name="feedback-form" />
        <Stack.Screen name="class" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'admin'}>
        <Stack.Screen name="person-form" />
        <Stack.Screen name="student-form" />
        <Stack.Screen name="student" />
      </Stack.Protected>
    </Stack>
  );
}
