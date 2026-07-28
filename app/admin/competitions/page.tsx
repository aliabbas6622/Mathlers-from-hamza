import { auth, isAdmin } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel from '@/models/Competition';
import GlassCard from '@/components/ui/GlassCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { Plus, Edit, Trophy } from 'lucide-react';
import Link from 'next/link';

type CompetitionRow = {
  _id: { toString(): string };
  name: string;
  description?: string;
  category?: string;
  status?: string;
  schedule?: { competitionStartDate?: Date };
  competition?: { startDate?: Date };
  analytics?: { totalRegistrations?: number; registrations?: number };
  eligibility?: { maxParticipants?: number };
  registration?: { maxParticipants?: number };
  sections?: unknown[];
  rounds?: unknown[];
};

export default async function CompetitionsPage() {
  const session = await auth();
  
  if (!session || !isAdmin(session.user.role)) {
    redirect('/sign-in');
  }

  await connectDB();

  const competitions = await CompetitionModel.find()
    .select('name description category status schedule competition analytics eligibility registration sections rounds createdAt')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean<CompetitionRow[]>();

  const categoryIcon: Record<string, string> = { public: '🌍', grade: '🏫', championship: '🥊' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competitions</h1>
          <p className="text-gray-600">Manage all public, grade, and championship competitions</p>
        </div>
        <Link href="/admin/competitions/create">
          <PrimaryButton>
            <Plus className="w-4 h-4 mr-2" />
            Create Competition
          </PrimaryButton>
        </Link>
      </div>

      {/* Competitions Table */}
      <GlassCard className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Competition</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Start Date</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Registrations</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Sections</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {competitions.map((comp) => {
                const startDate = comp.schedule?.competitionStartDate || comp.competition?.startDate;
                const totalRegs = comp.analytics?.totalRegistrations ?? comp.analytics?.registrations ?? 0;
                const maxParts = comp.eligibility?.maxParticipants || comp.registration?.maxParticipants || '∞';
                const sectionCount = comp.sections?.length ?? comp.rounds?.length ?? 0;
                const cat = String(comp.category || 'public');

                return (
                  <tr key={comp._id.toString()} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <Link href={`/admin/competitions/${comp._id.toString()}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-lighter rounded-lg flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-brand-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 hover:text-brand-primary transition-colors">{comp.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{comp.description}</p>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-gray-700 text-sm font-medium">
                      {categoryIcon[cat]} {cat.toUpperCase()}
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-sm">
                      {startDate ? new Date(startDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-sm">{totalRegs} / {maxParts}</td>
                    <td className="py-4 px-4 text-gray-600 text-sm">{sectionCount} Sections</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        String(comp.status) === 'in_progress' ? 'bg-green-100 text-green-700' :
                        String(comp.status) === 'registration_open' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {String(comp.status).replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <Link href={`/admin/competitions/${comp._id.toString()}/results`} title="View Leaderboard & Results">
                          <button className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg transition-colors flex items-center gap-1 font-semibold text-xs">
                            <Trophy className="w-4 h-4" /> Leaderboard
                          </button>
                        </Link>
                        <Link href={`/admin/competitions/${comp._id.toString()}/edit`} title="Edit Competition">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {competitions.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 mb-2">No competitions found</p>
            <p className="text-sm text-gray-500">Create your first competition to get started</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
