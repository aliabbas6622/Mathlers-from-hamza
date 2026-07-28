import { redirect } from 'next/navigation';
import { auth, isAdmin, isSuperAdmin } from '@mathlers/lib/auth';
import connectDB from '@mathlers/lib/db';
import SchoolModel from '@mathlers/models/School';
import UserModel from '@mathlers/models/User';
import DeveloperConsole from '../developer/DeveloperConsole';

export default async function PeoplePage() {
  const session = await auth();
  if (!session || !isAdmin(session.user.role)) redirect('/sign-in');
  if (isSuperAdmin(session.user.role)) redirect('/admin/developer');
  await connectDB();
  const operator = await UserModel.findById(session.user.id).select('school');
  if (!operator?.school) redirect('/admin/dashboard');
  const school = await SchoolModel.findOne({ _id: operator.school, isActive: true }).select('name');
  if (!school) redirect('/admin/dashboard');
  return <DeveloperConsole schools={[{ id: school._id.toString(), name: school.name }]} allowedRoles={['teacher', 'student']} title="School people" description="Provision teacher and student accounts for your school. Credentials are returned once for secure distribution." showPlatformControls={false} />;
}
