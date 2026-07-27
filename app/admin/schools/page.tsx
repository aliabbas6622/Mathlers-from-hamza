import connectDB from '@/lib/db/mongodb';
import SchoolModel from '@/models/School';
import { Building2, MapPin, Users } from 'lucide-react';

export default async function SchoolsPage() {
  await connectDB();
  const schools = await SchoolModel.find().sort({ totalStudents: -1, name: 1 }).limit(50).lean();
  const activeSchools = schools.filter((school) => school.isActive).length;
  const students = schools.reduce((total, school) => total + school.totalStudents, 0);

  return <div className="mx-auto max-w-7xl space-y-8">
    <div className="border-b border-gray-200 pb-7"><p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Partner network</p><h1 className="mt-1 text-3xl font-bold text-gray-950">Schools</h1><p className="mt-2 text-gray-600">Monitor school participation and enrolled Mathlers students.</p></div>
    <div className="grid gap-4 sm:grid-cols-3"><Metric icon={<Building2 />} label="Schools" value={schools.length} /><Metric icon={<Users />} label="Students" value={students} /><Metric icon={<Building2 />} label="Active schools" value={activeSchools} /></div>
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="grid grid-cols-[minmax(180px,1.4fr)_minmax(130px,1fr)_100px_100px] gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500"><span>School</span><span>Location</span><span>Students</span><span>Status</span></div>
      {schools.map((school) => <div key={school._id.toString()} className="grid grid-cols-[minmax(180px,1.4fr)_minmax(130px,1fr)_100px_100px] items-center gap-4 border-b border-gray-100 px-5 py-4 last:border-0"><div><p className="font-semibold text-gray-950">{school.name}</p><p className="mt-1 text-sm text-gray-500">{school.coordinatorName || 'No coordinator assigned'}</p></div><span className="flex items-center gap-1.5 text-sm text-gray-600"><MapPin className="h-4 w-4" />{school.city}</span><span className="font-semibold text-gray-800">{school.totalStudents}</span><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${school.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{school.isActive ? 'Active' : 'Inactive'}</span></div>)}
      {!schools.length && <p className="px-5 py-16 text-center text-sm text-gray-500">No schools have been added yet.</p>}
    </div>
  </div>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5"><span className="text-brand-primary">{icon}</span><div><p className="text-2xl font-bold text-gray-950">{value}</p><p className="text-sm text-gray-600">{label}</p></div></div>;
}
