import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { color, shadow } from '@/theme';
import { Icon, type IconName } from '@/ui/icon';
import { BrandMark, T } from '@/ui/primitives';

/**
 * Role select. The prototype's version is decorative — its shell selector never
 * matches, so choosing Parent still opens the teacher app. Here the choice is
 * the route, so it cannot drift.
 */
export default function RoleSelect() {
  return (
    <SafeAreaView style={styles.screen}>
      <BrandMark size={64} />
      <T variant="screenTitle" style={styles.title}>
        ClassConnect
      </T>
      <T variant="body" style={styles.sub}>
        Connecting classrooms and homes. Choose how you&apos;d like to sign in.
      </T>

      <RoleButton
        href="/sign-in/staff"
        icon="user"
        tint={color.navyTint}
        iconColor={color.navy}
        title="School Staff Login"
        sub="Teachers and administrators"
      />
      <RoleButton
        href="/sign-in/parent"
        icon="pin"
        tint={color.emeraldSoft}
        iconColor={color.emeraldText}
        title="Parent Login"
        sub="View your child's academic & attendance reports"
      />

      <T variant="faint" style={styles.foot}>
        Accounts are created by your school. There is no public sign-up.
      </T>
    </SafeAreaView>
  );
}

function RoleButton({
  href,
  icon,
  tint,
  iconColor,
  title,
  sub,
}: {
  href: '/sign-in/staff' | '/sign-in/parent';
  icon: IconName;
  tint: string;
  iconColor: string;
  title: string;
  sub: string;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.role, pressed && styles.rolePressed]}>
        <View style={[styles.roleIcon, { backgroundColor: tint }]}>
          <Icon name={icon} size={22} stroke={iconColor} />
        </View>
        <View style={styles.roleText}>
          <T variant="cardTitle">{title}</T>
          <T variant="listSub" style={styles.roleSub}>
            {sub}
          </T>
        </View>
        <Icon name="chevron" size={18} stroke={color.inkFaint} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 32,
  },
  title: { marginTop: 18, textAlign: 'center' },
  sub: {
    color: color.inkSoft,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 36,
    maxWidth: 280,
  },
  role: {
    width: '100%',
    maxWidth: 320,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: color.surface,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 14,
    ...shadow.card,
  },
  rolePressed: { backgroundColor: color.navyTint },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleText: { flex: 1 },
  roleSub: { marginTop: 2 },
  foot: { marginTop: 22, textAlign: 'center', maxWidth: 300 },
});
