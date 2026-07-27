import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel from '@/models/Competition';
import GlassCard from '@/components/ui/GlassCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { Search, Filter, Plus, Edit, Trash2, Trophy } from 'lucide-react';

import Link from 'next/link';

export default async function CompetitionsPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  await connectDB();

  const competitions = await CompetitionModel.find().limit(20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competitions</h1>
          <p className="text-gray-600">Manage all competitions and events</p>
        </div>
        <Link href="/admin/competitions/create">
          <PrimaryButton>
            <Plus className="w-4 h-4 mr-2" />
            Create Competition
          </PrimaryButton>
        </Link>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search competitions..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
            />
          </div>
          <select className="px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary outline-none">
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <PrimaryButton variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </PrimaryButton>
        </div>
      </GlassCard>

      {/* Competitions Table */}
      <GlassCard className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Competition</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Start Date</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Participants</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Rounds</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {competitions.map((comp: any) => (
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
                  <td className="py-4 px-4 text-gray-600">
                    {comp.competition?.startDate ? new Date(comp.competition.startDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-4 text-gray-600">{comp.analytics?.registrations || 0} / {comp.registration?.maxParticipants || 0}</td>
                  <td className="py-4 px-4 text-gray-600">{comp.rounds?.length || 0}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      String(comp.status) === 'active' ? 'bg-green-100 text-green-700' :
                      String(comp.status) === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {String(comp.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/competitions/${comp._id.toString()}`}>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                      </Link>
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
