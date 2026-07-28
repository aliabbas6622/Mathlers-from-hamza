import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import PracticeSetModel, { IPracticeSet } from '@/models/PracticeSet';

import GlassCard from '@/components/ui/GlassCard';

import { BookOpen, Target, Clock, Filter } from 'lucide-react';
import SubjectModel from '@/models/Subject';
import Link from 'next/link';

type ListItem = { _id: { toString(): string }; name: string };

type PracticeSetItem = {
  _id: { toString(): string };
  name: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed' | 'all';
  type?: string;
  subject?: { name?: string };
  grade?: { name?: string };
  questions?: unknown[];
  timeLimit?: number;
};

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; difficulty?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }

  await connectDB();

  const now = new Date();

  const [practiceSets, subjects] = await Promise.all([
    PracticeSetModel.find({
      isPublished: true,
      $or: [
        { 'availability.startDate': { $exists: false } },
        { 'availability.startDate': { $lte: now } },
      ],
      $and: [
        { $or: [{ 'availability.endDate': { $exists: false } }, { 'availability.endDate': { $gte: now } }] },
      ],
      ...(resolvedSearchParams.subject ? { subject: resolvedSearchParams.subject } : {}),
      ...(resolvedSearchParams.difficulty && resolvedSearchParams.difficulty !== 'all'
        ? { difficulty: resolvedSearchParams.difficulty as IPracticeSet['difficulty'] }
        : {}),
    })
      .populate('subject', 'name')
      .populate('grade', 'name')
      .select('name description difficulty type subject grade questions timeLimit')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    SubjectModel.find({ isActive: true }).select('name').sort({ order: 1 }).lean(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Arena</h1>
        <p className="text-gray-600">Select a practice book to start improving your skills.</p>
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Available Practice Books</h2>
          
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Filter:</span>
            <div className="flex gap-2">
              <Link href={`/student/practice?difficulty=${resolvedSearchParams.difficulty || ''}`}>
                <span className={`text-sm px-3 py-1.5 rounded-lg border cursor-pointer ${!resolvedSearchParams.subject ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                  All Subjects
                </span>
              </Link>
              {(subjects as ListItem[]).map((sub) => (
                <Link key={sub._id.toString()} href={`/student/practice?subject=${sub._id}&difficulty=${resolvedSearchParams.difficulty || ''}`}>
                  <span className={`text-sm px-3 py-1.5 rounded-lg border cursor-pointer ${resolvedSearchParams.subject === sub._id.toString() ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                    {sub.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(practiceSets as PracticeSetItem[]).map((set) => (
            <GlassCard key={set._id.toString()} className="p-6 hover:scale-105 transition-transform flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{set.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{set.description || 'No description provided.'}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                  set.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  set.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  set.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {set.difficulty || 'mixed'}
                </span>
              </div>

              <div className="flex gap-2 mb-4">
                {set.subject && (
                  <span className="text-xs bg-brand-lighter text-brand-primary px-2 py-1 rounded-full">
                    {set.subject.name}
                  </span>
                )}
                {set.grade && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {set.grade.name}
                  </span>
                )}
                {set.type && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full capitalize">
                    {set.type.replace(/_/g, ' ')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 mt-auto">
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{set.questions?.length || 0} Questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{Math.round((set.timeLimit || 1800) / 60)} min</span>
                </div>
              </div>

              <a href={`/student/practice/${set._id}`} className="inline-flex w-full justify-center rounded-xl border border-transparent bg-brand-primary px-6 py-3 font-semibold text-white transition-colors hover:border-brand-dark hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2">Start Practice</a>
            </GlassCard>
          ))}
        </div>

        {practiceSets.length === 0 && (
          <div className="text-center py-16 text-gray-500 border border-dashed border-gray-300 rounded-xl mt-4">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium text-gray-900 mb-1">No practice books found</p>
            <p className="text-sm">Check back later or adjust your filters.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
