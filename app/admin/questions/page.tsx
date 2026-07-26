import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import QuestionModel from '@/models/Question';
import SubjectModel from '@/models/Subject';
import GlassCard from '@/components/ui/GlassCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { Search, Filter, Plus, Edit, Trash2 } from 'lucide-react';

export default async function QuestionsPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  await connectDB();

  const questions = await QuestionModel.find()
    .populate('subject')
    .populate('grade')
    .limit(50);

  const subjects = await SubjectModel.find({ isActive: true });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-600">Manage all questions in the database</p>
        </div>
        <PrimaryButton>
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </PrimaryButton>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
            />
          </div>
          <select className="px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary outline-none">
            <option value="">All Subjects</option>
            {subjects.map((subject: any) => (
              <option key={subject._id.toString()} value={subject._id.toString()}>
                {subject.name}
              </option>
            ))}
          </select>
          <select className="px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary outline-none">
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <PrimaryButton variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </PrimaryButton>
        </div>
      </GlassCard>

      {/* Questions Table */}
      <GlassCard className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Question</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Subject</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Grade</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Difficulty</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Type</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q: any) => (
                <tr key={q._id.toString()} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-900 max-w-md truncate">{q.question}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-brand-lighter text-brand-primary rounded-full text-sm">
                      {q.subject?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{q.grade?.name || 'N/A'}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600 capitalize">{String(q.type)}</td>
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

        {questions.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 mb-2">No questions found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or add a new question</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
