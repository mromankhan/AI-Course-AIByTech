import { useClassRoster, useCurrentSession, useMyClass } from '@/data/queries';
import { Roster } from '@/features/roster/roster';
import { Screen, SectionTitle } from '@/ui/screen';

/**
 * The class roster. Classes the teacher does not teach are not fetched at all —
 * RLS filters them server-side, which is why the prototype's padlocked rows for
 * other sections have no equivalent here: there is nothing to lock.
 */
export default function Classes() {
  const session = useCurrentSession();
  const { klass } = useMyClass();
  const roster = useClassRoster(klass?.id, session.data?.id);

  return (
    <Screen
      eyebrow={session.data ? `Session ${session.data.label}` : ''}
      title={klass ? `${klass.grade} — Section ${klass.section}` : 'My Class'}>
      <SectionTitle>Students ({roster.data?.length ?? 0})</SectionTitle>
      <Roster classId={klass?.id} sessionId={session.data?.id} />
    </Screen>
  );
}
