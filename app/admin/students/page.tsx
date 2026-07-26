import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import UserModel from '@/models/User';
import GlassCard from '@/components/ui/GlassCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { Search, Filter, Plus, Edit, Trash2, Users, Mail } from 'lucide-react';

export default async function StudentsPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  await connectDB();

  const students = await UserModel.find({ isActive: true }).limit(50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage all registered students</p>
        </div>
        <PrimaryButton>
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </PrimaryButton>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
            />
          </div>
          <select className="px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary outline-none">
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
          <select className="px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary outline-none">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <PrimaryButton variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </PrimaryButton>
        </div>
      </GlassCard>

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
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student: any) => (
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
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
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
