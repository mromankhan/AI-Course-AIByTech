import { Tabs } from 'expo-router';

import { color, font } from '@/theme';
import type { ColorValue } from 'react-native';

import { Icon, type IconName } from '@/ui/icon';

function tab(name: IconName) {
  return ({ color: c }: { color: ColorValue }) => <Icon name={name} size={22} stroke={String(c)} />;
}

export default function TeacherTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.navy,
        tabBarInactiveTintColor: color.inkFaint,
        tabBarStyle: { backgroundColor: color.surface, borderTopColor: color.line },
        tabBarLabelStyle: { fontFamily: font.bodyMedium, fontSize: 10 },
        sceneStyle: { backgroundColor: color.bg },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tab('home') }} />
      <Tabs.Screen name="classes" options={{ title: 'Classes', tabBarIcon: tab('users') }} />
      <Tabs.Screen name="tests" options={{ title: 'Tests', tabBarIcon: tab('chart') }} />
      <Tabs.Screen name="feedback" options={{ title: 'Feedback', tabBarIcon: tab('message') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tab('user') }} />
      {/* Full-screen flows launched from the tabs, hidden from the bar. */}
      <Tabs.Screen name="attendance" options={{ href: null }} />
    </Tabs>
  );
}
