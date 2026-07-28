import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import PracticeSetModel from '@/models/PracticeSet';
import GlassCard from '@/components/ui/GlassCard';
import { BookOpen, Target, Clock } from 'lucide-react';

type PracticeSetItem = {
  _id: { toString(): string };
  name: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  subject?: { name?: string };
  grade?: { name?: string };
  questions?: unknown[];
  timeLimit?: number;
};

export default async function PracticePage() {
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }

  await connectDB();

  const now = new Date();
  const practiceSets = await PracticeSetModel.find({
      isPublished: true,
      'availability.startDate': { $lte: now },
      'availability.endDate': { $gte: now },
    })
      .populate('subject', 'name')
      .populate('grade', 'name')
      .select('name description difficulty subject grade questions timeLimit')
      .limit(20)
      .lean();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Arena</h1>
        <p className="text-gray-600">Choose your practice mode and start improving</p>
      </div>

      {/* Available Practice Sets */}
      <GlassCard className="p-6">
        <h2 className="mb-6 text-xl font-bold text-gray-900">Available Practice Sets</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(practiceSets as PracticeSetItem[]).map((set) => (
            <GlassCard key={set._id.toString()} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{set.name}</h3>
                  <p className="text-sm text-gray-600">{set.description}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  set.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  set.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {set.difficulty}
                </span>
              </div>

              <div className="flex gap-2 mb-4">
                <span className="text-xs bg-brand-lighter text-brand-primary px-2 py-1 rounded-full">
                  {set.subject?.name || 'General'}
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {set.grade?.name || 'All Grades'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span>{set.questions?.length || 0} Questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{set.timeLimit || 30} min</span>
                </div>
              </div>

              <a href={`/student/practice/${set._id}`} className="inline-flex w-full justify-center rounded-xl border border-transparent bg-brand-primary px-6 py-3 font-semibold text-white transition-colors hover:border-brand-dark hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2">Start Practice</a>
            </GlassCard>
          ))}
        </div>

        {practiceSets.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No practice sets available yet.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
