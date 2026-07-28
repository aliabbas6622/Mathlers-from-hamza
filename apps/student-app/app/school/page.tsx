import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@mathlers/lib/auth';
import connectDB from '@mathlers/lib/db';
import SchoolModel from '@mathlers/models/School';
import UserModel, { UserRole } from '@mathlers/models/User';

export default async function SchoolPage() {
  const session = await auth();
  if (!session) redirect('/sign-in');
  await connectDB();
  const operator = await UserModel.findById(session.user.id).select('school');
  const school = operator?.school ? await SchoolModel.findById(operator.school).select('name') : null;
  if (!school) return <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">Your administrator account has not been assigned to a school yet. Contact a Mathlers developer.</div>;
  const [students, teachers] = await Promise.all([UserModel.countDocuments({ school: school._id, role: UserRole.STUDENT, isActive: true }), UserModel.countDocuments({ school: school._id, role: UserRole.TEACHER, isActive: true })]);
  return <div className="space-y-8"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">{school.name}</p><h1 className="mt-1 text-3xl font-bold text-slate-950">School workspace</h1><p className="mt-2 text-slate-600">Manage your teachers and student access without access to other schools or platform controls.</p></div><div className="grid gap-4 sm:grid-cols-2"><Metric label="Active students" value={students} /><Metric label="Teachers" value={teachers} /></div><Link href="/school/people" className="inline-flex rounded-lg border border-transparent bg-brand-primary px-4 py-2.5 font-semibold text-white hover:border-brand-dark hover:bg-brand-dark">Provision people</Link></div>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-2xl font-bold text-slate-950">{value}</p><p className="mt-1 text-sm text-slate-600">{label}</p></div>; }
