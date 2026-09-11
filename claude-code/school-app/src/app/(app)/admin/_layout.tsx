import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { color, font } from '@/theme';
import { Icon, type IconName } from '@/ui/icon';

function tab(name: IconName) {
  function TabIcon({ color: c }: { color: ColorValue }) {
    return <Icon name={name} size={22} stroke={String(c)} />;
  }
  return TabIcon;
}

export default function AdminTabs() {
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
      <Tabs.Screen name="classes" options={{ title: 'Classes', tabBarIcon: tab('book') }} />
      <Tabs.Screen name="students" options={{ title: 'Students', tabBarIcon: tab('graduation') }} />
      <Tabs.Screen name="people" options={{ title: 'People', tabBarIcon: tab('users') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tab('user') }} />
      {/* Reached from Home, not from the bar. */}
      <Tabs.Screen name="setup" options={{ href: null }} />
      <Tabs.Screen name="class-form" options={{ href: null }} />
    </Tabs>
  );
}
