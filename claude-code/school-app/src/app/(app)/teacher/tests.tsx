import { useCurrentSession, useMyClass } from '@/data/queries';
import { TestList } from '@/features/tests/test-list';
import { Screen } from '@/ui/screen';

export default function TeacherTests() {
  const session = useCurrentSession();
  const { klass } = useMyClass();

  return (
    <Screen
      eyebrow={klass ? `${klass.grade} — Section ${klass.section}` : ''}
      title="Tests & Results">
      <TestList classId={klass?.id} sessionId={session.data?.id} />
    </Screen>
  );
}
