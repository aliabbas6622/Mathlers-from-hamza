import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import SchoolModel from '@/models/School';
import UserModel from '@/models/User';
import DeveloperConsole from '@/app/admin/developer/DeveloperConsole';

export default async function SchoolPeoplePage() {
  const session = await auth();
  if (!session) redirect('/sign-in');
  await connectDB();
  const operator = await UserModel.findById(session.user.id).select('school');
  const school = operator?.school ? await SchoolModel.findOne({ _id: operator.school, isActive: true }).select('name') : null;
  if (!school) redirect('/school');
  return <DeveloperConsole schools={[{ id: school._id.toString(), name: school.name }]} allowedRoles={['teacher', 'student']} title="School people" description="Provision teacher and student accounts for your school. Credentials are returned once for secure distribution." showPlatformControls={false} />;
}
