import { redirect } from 'next/navigation';
import { auth } from '@mathlers/lib/auth';
import connectDB from '@mathlers/lib/db';
import UserModel, { UserRole } from '@mathlers/models/User';

export default async function SchoolStudentsPage() {
  const session = await auth();
  if (!session) redirect('/sign-in');
  await connectDB();
  const operator = await UserModel.findById(session.user.id).select('school');
  if (!operator?.school) redirect('/school');
  const students = await UserModel.find({ school: operator.school, role: UserRole.STUDENT, isActive: true }).select('fullName email grade playerId').sort({ grade: 1, fullName: 1 }).lean();
  return <div><h1 className="text-3xl font-bold text-slate-950">Students</h1><div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="grid grid-cols-[minmax(160px,1fr)_minmax(180px,1fr)_90px_120px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500"><span>Student</span><span>Email</span><span>Grade</span><span>Player ID</span></div>{students.map((student) => <div key={student._id.toString()} className="grid grid-cols-[minmax(160px,1fr)_minmax(180px,1fr)_90px_120px] gap-4 border-b border-slate-100 px-5 py-4 last:border-0"><span className="font-semibold text-slate-950">{student.fullName}</span><span>{student.email}</span><span>{student.grade || '—'}</span><span className="font-mono text-xs">{student.playerId}</span></div>)}{!students.length && <p className="p-10 text-center text-sm text-slate-500">No students have been provisioned yet.</p>}</div></div>;
}
