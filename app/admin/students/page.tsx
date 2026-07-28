import { auth, isAdmin, isSuperAdmin } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import UserModel, { UserRole } from '@/models/User';
import GlassCard from '@/components/ui/GlassCard';
import { Users } from 'lucide-react';

type StudentRow = {
  _id: { toString(): string };
  fullName?: string;
  email?: string;
  playerId?: string;
  role?: string;
  isActive?: boolean;
  isSuspended?: boolean;
};

export default async function StudentsPage() {
  const session = await auth();
  
  if (!session || !isAdmin(session.user.role)) {
    redirect('/sign-in');
  }

  await connectDB();

  const operator = await UserModel.findById(session.user.id).select('school');
  const studentScope = isSuperAdmin(session.user.role) ? {} : { school: operator?.school };
  const students = await UserModel.find({ ...studentScope, role: UserRole.STUDENT, isActive: true })
    .select('fullName email playerId role isActive isSuspended')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean<StudentRow[]>();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Review active student accounts{isSuperAdmin(session.user.role) ? '.' : ' at your school.'}</p>
        </div>
      </div>

      {/* Students Table */}
      <GlassCard className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Student</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Player ID</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Role</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id.toString()} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-lighter rounded-full flex items-center justify-center text-brand-primary font-bold">
                        {student.fullName?.charAt(0) || 'U'}
                      </div>
                      <p className="font-medium text-gray-900">{student.fullName}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{student.email}</td>
                  <td className="py-4 px-4 text-gray-600">{student.playerId}</td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm capitalize">
                      {student.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      student.isActive && !student.isSuspended ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {student.isActive && !student.isSuspended ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {students.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 mb-2">No students found</p>
            <p className="text-sm text-gray-500">Add your first student to get started</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
