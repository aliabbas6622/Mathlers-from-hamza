import { redirect } from 'next/navigation';
import { auth, isSuperAdmin } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import SchoolModel from '@/models/School';
import DeveloperConsole from './DeveloperConsole';

export default async function DeveloperPage() {
  const session = await auth();
  if (!session || !isSuperAdmin(session.user.role)) redirect('/admin/dashboard');
  await connectDB();
  const schools = await SchoolModel.find({ isActive: true }).select('name').sort({ name: 1 }).lean();
  return <DeveloperConsole schools={schools.map((school) => ({ id: school._id.toString(), name: school.name }))} />;
}
