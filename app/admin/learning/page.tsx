import connectDB from '@/lib/db/mongodb';
import PracticeSetModel from '@/models/PracticeSet';
import { BookOpen, Clock3, FileQuestion, Layers3 } from 'lucide-react';

export default async function LearningPage() {
  await connectDB();

  const practiceSets = await PracticeSetModel.find()
    .populate('subject', 'name')
    .populate('grade', 'name')
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();
  const published = practiceSets.filter((set) => set.isPublished).length;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="border-b border-gray-200 pb-7">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Practice library</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-950">Learning</h1>
        <p className="mt-2 text-gray-600">Review the practice books currently available to Mathlers students.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<Layers3 />} label="Practice books" value={practiceSets.length} />
        <Metric icon={<BookOpen />} label="Published" value={published} />
        <Metric icon={<FileQuestion />} label="Questions included" value={practiceSets.reduce((total, set) => total + set.questions.length, 0)} />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4"><h2 className="font-bold text-gray-950">Recent practice books</h2></div>
        {practiceSets.map((set) => {
          const subject = set.subject as unknown as { name?: string } | null;
          const grade = set.grade as unknown as { name?: string } | null;
          return <div key={set._id.toString()} className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-semibold text-gray-950">{set.name}</p><p className="mt-1 text-sm text-gray-600">{subject?.name || 'Subject'} · {grade?.name || 'Grade'} · {set.questions.length} questions</p></div>
            <div className="flex items-center gap-3 text-sm"><span className="flex items-center gap-1 text-gray-500"><Clock3 className="h-4 w-4" /> {Math.round(set.timeLimit / 60)} min</span><span className={`rounded-full px-2.5 py-1 font-semibold ${set.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{set.isPublished ? 'Published' : 'Draft'}</span></div>
          </div>;
        })}
        {!practiceSets.length && <p className="px-5 py-16 text-center text-sm text-gray-500">No practice books have been created yet.</p>}
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5"><span className="text-brand-primary">{icon}</span><div><p className="text-2xl font-bold text-gray-950">{value}</p><p className="text-sm text-gray-600">{label}</p></div></div>;
}
