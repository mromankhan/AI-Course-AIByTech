import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { startOutboxSync } from '@/lib/outbox';
import { SessionProvider, useSession } from '@/lib/session';
import { color } from '@/theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Classroom connectivity is unreliable; keep showing the last good data
      // rather than spinners, and let pull-to-refresh be the explicit refetch.
      staleTime: 60_000,
      retry: 1,
    },
  },
});

function Root() {
  const { session } = useSession();
  const queryClient = useQueryClient();

  // Queued attendance drains itself the moment the device is back online, with
  // no screen open and no user action. Marks made in a dead spot land later.
  useEffect(() => {
    const stop = startOutboxSync((result) => {
      if (result.sent > 0) queryClient.invalidateQueries();
    });
    return stop;
  }, [queryClient]);

  const [fontsReady] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const ready = fontsReady && session !== undefined;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg } }}>
      {/* Guards live in the group layouts, so a signed-out deep link still lands on sign-in. */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <StatusBar style="dark" />
          <Root />
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
