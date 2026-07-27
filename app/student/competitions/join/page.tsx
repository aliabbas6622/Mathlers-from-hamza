import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import JoinWithCodeSection from '../JoinWithCodeSection';

export default async function JoinPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="py-6">
      <JoinWithCodeSection studentName={session.user.name || 'Student'} />
    </div>
  );
}
