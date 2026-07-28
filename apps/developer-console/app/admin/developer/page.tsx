import { redirect } from 'next/navigation';
import { clerkClient } from '@clerk/nextjs/server';
import { auth, isSuperAdmin } from '@mathlers/lib/auth';
import connectDB from '@mathlers/lib/db';
import SchoolModel from '@mathlers/models/School';
import UserModel from '@mathlers/models/User';
import DeveloperConsole from './DeveloperConsole';

export default async function DeveloperPage() {
  const session = await auth();
  if (!session || !isSuperAdmin(session.user.role)) redirect('/');
  await connectDB();
  const clerk = await clerkClient();
  const [schools, clerkUsers] = await Promise.all([
    SchoolModel.find({ isActive: true }).select('name').sort({ name: 1 }).lean(),
    clerk.users.getUserList({ limit: 100 }),
  ]);
  const existingUsers = await UserModel.find({
    clerkId: { $in: clerkUsers.data.map((user) => user.id) },
  }).select('clerkId').lean();
  const existingClerkIds = new Set(existingUsers.map((user) => user.clerkId).filter(Boolean));
  const applicants = clerkUsers.data
    .filter((user) => !existingClerkIds.has(user.id) && user.publicMetadata.mathlersRole !== 'super_admin')
    .map((user) => ({
      id: user.id,
      fullName: user.fullName || user.username || 'Applicant',
      email: user.primaryEmailAddress?.emailAddress || '',
    }))
    .filter((user) => user.email);

  return (
    <DeveloperConsole
      schools={schools.map((school) => ({ id: school._id.toString(), name: school.name }))}
      applicants={applicants}
    />
  );
}
