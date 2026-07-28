import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import UserModel, { UserRole } from '@/models/User';

export default async function TeacherPage() {
  const session = await auth();
  if (!session) redirect('/sign-in');
  await connectDB();
  const teacher = await UserModel.findById(session.user.id).select('school schoolName');
  if (!teacher?.school) return <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">Your teacher account is not assigned to a school yet. Contact your school administrator.</div>;
  const students = await UserModel.find({ school: teacher.school, role: UserRole.STUDENT, isActive: true }).select('fullName grade points accuracy').sort({ grade: 1, fullName: 1 }).lean();
  return <div className="space-y-8"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">{teacher.schoolName || 'School workspace'}</p><h1 className="mt-1 text-3xl font-bold text-slate-950">Your students</h1><p className="mt-2 text-slate-600">View the learners assigned to your school and their current practice progress.</p></div><section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="grid grid-cols-[minmax(160px,1fr)_100px_100px_100px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500"><span>Student</span><span>Grade</span><span>Points</span><span>Accuracy</span></div>{students.map((student) => <div key={student._id.toString()} className="grid grid-cols-[minmax(160px,1fr)_100px_100px_100px] gap-4 border-b border-slate-100 px-5 py-4 last:border-0"><span className="font-semibold text-slate-950">{student.fullName}</span><span>{student.grade || '—'}</span><span>{student.points}</span><span>{student.accuracy}%</span></div>)}{!students.length && <p className="px-5 py-12 text-center text-sm text-slate-500">No students have been provisioned for this school yet.</p>}</section></div>;
}
