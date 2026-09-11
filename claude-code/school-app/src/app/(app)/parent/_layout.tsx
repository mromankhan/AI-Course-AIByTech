import { Tabs } from 'expo-router';

import { ChildProvider } from '@/features/parent/child';
import { color, font } from '@/theme';
import type { ColorValue } from 'react-native';

import { Icon, type IconName } from '@/ui/icon';

function tab(name: IconName) {
  function TabIcon({ color: c }: { color: ColorValue }) {
    return <Icon name={name} size={22} stroke={String(c)} />;
  }
  return TabIcon;
}

export default function ParentTabs() {
  return (
    <ChildProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: color.navy,
          tabBarInactiveTintColor: color.inkFaint,
          tabBarStyle: {
            backgroundColor: color.surface,
            borderTopColor: color.line,
          },
          tabBarLabelStyle: { fontFamily: font.bodyMedium, fontSize: 10 },
          sceneStyle: { backgroundColor: color.bg },
        }}>
        <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tab('home') }} />
        <Tabs.Screen
          name="attendance"
          options={{ title: 'Attendance', tabBarIcon: tab('calendarCheck') }}
        />
        <Tabs.Screen name="results" options={{ title: 'Results', tabBarIcon: tab('chart') }} />
        <Tabs.Screen name="feedback" options={{ title: 'Feedback', tabBarIcon: tab('message') }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tab('user') }} />
      </Tabs>
    </ChildProvider>
  );
}
