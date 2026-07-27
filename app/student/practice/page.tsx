import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import connectDB from '@/lib/db/mongodb';
import PracticeSetModel from '@/models/PracticeSet';
import SubjectModel from '@/models/Subject';
import GlassCard from '@/components/ui/GlassCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { BookOpen, Zap, Target, Clock } from 'lucide-react';

type ListItem = { _id: { toString(): string }; name: string };
type PracticeSetItem = ListItem & {
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
    redirect('/login');
  }

  await connectDB();

  const now = new Date();
  const [practiceSets, subjects] = await Promise.all([
    PracticeSetModel.find({
      isPublished: true,
      'availability.startDate': { $lte: now },
      'availability.endDate': { $gte: now },
    })
      .populate('subject', 'name')
      .populate('grade', 'name')
      .select('name description difficulty subject grade questions timeLimit')
      .limit(20)
      .lean(),
    SubjectModel.find({ isActive: true }).select('name').sort({ order: 1 }).lean(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Arena</h1>
        <p className="text-gray-600">Choose your practice mode and start improving</p>
      </div>

      {/* Practice Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6 hover:scale-105 transition-transform cursor-pointer">
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-lighter rounded-full mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-brand-primary" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Topic Practice</h3>
            <p className="text-sm text-gray-600">Master specific topics</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:scale-105 transition-transform cursor-pointer">
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-lighter rounded-full mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-8 h-8 text-brand-primary" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Daily Challenge</h3>
            <p className="text-sm text-gray-600">New problems every day</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:scale-105 transition-transform cursor-pointer">
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-lighter rounded-full mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-8 h-8 text-brand-primary" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Speed Practice</h3>
            <p className="text-sm text-gray-600">Test your speed</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:scale-105 transition-transform cursor-pointer">
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-lighter rounded-full mx-auto mb-4 flex items-center justify-center">
              <Target className="w-8 h-8 text-brand-primary" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Mixed Challenge</h3>
            <p className="text-sm text-gray-600">Random topic mix</p>
          </div>
        </GlassCard>
      </div>

      {/* Step Navigation */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Browse by Topic</h2>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl">
            <span className="font-semibold">Subject</span>
          </div>
          <div className="text-gray-400">→</div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl">
            <span>Grade</span>
          </div>
          <div className="text-gray-400">→</div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl">
            <span>Chapter</span>
          </div>
          <div className="text-gray-400">→</div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl">
            <span>Topic</span>
          </div>
          <div className="text-gray-400">→</div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl">
            <span>Practice Set</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(subjects as ListItem[]).map((subject) => (
            <Link key={subject._id.toString()} href={`/student/practice/subject/${subject._id}`}>
              <GlassCard className="p-4 text-center hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-brand-lighter rounded-full mx-auto mb-3 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-brand-primary" />
                </div>
                <p className="font-semibold text-gray-900 text-sm">{subject.name}</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      </GlassCard>

      {/* Available Practice Sets */}
      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Available Practice Sets</h2>
          <PrimaryButton variant="secondary" size="sm">View All</PrimaryButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(practiceSets as PracticeSetItem[]).map((set) => (
            <GlassCard key={set._id.toString()} className="p-6 hover:scale-105 transition-transform">
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

              <Link href={`/student/practice/${set._id}`}>
                <PrimaryButton className="w-full">Start Practice</PrimaryButton>
              </Link>
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
