import { useCurrentSession, useMyClass } from '@/data/queries';
import { FeedbackList } from '@/features/feedback/feedback-list';
import { Screen } from '@/ui/screen';

export default function TeacherFeedback() {
  const session = useCurrentSession();
  const { klass } = useMyClass();

  return (
    <Screen
      eyebrow={klass ? `${klass.grade} — Section ${klass.section}` : ''}
      title="Weekly Feedback">
      <FeedbackList classId={klass?.id} sessionId={session.data?.id} />
    </Screen>
  );
}
