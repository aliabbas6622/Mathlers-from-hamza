import React from 'react';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel, { CompetitionStatus } from '@/models/Competition';
import Link from 'next/link';
import { ChevronRight, Settings, Users, Calendar, Trophy, FileText, CheckCircle } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default async function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  await connectDB();
  
  const { id } = await params;
  const competition = await CompetitionModel.findById(id);

  if (!competition) {
    return <div className="p-8 text-center text-gray-500">Competition not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500">
        <Link href="/admin" className="hover:text-brand-primary transition-colors">Admin</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link href="/admin/competitions" className="hover:text-brand-primary transition-colors">Competitions</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">{competition.name}</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{competition.name}</h1>
          <p className="text-gray-600">{competition.description}</p>
        </div>
        <div className="flex gap-4">
          <PrimaryButton variant="secondary">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </PrimaryButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Status"
          value={competition.status.toUpperCase().replace('_', ' ')}
          icon={<CheckCircle className="w-6 h-6 text-brand-primary" />}
          trend={
            competition.status === CompetitionStatus.IN_PROGRESS || 
            competition.status === CompetitionStatus.REGISTRATION_OPEN 
              ? '+Active' 
              : ''
          }
        />
        <StatCard
          label="Registrations"
          value={String(competition.analytics?.registrations || 0)}
          icon={<Users className="w-6 h-6 text-blue-500" />}
        />
        <StatCard
          label="Total Rounds"
          value={String(competition.rounds?.length || 0)}
          icon={<Trophy className="w-6 h-6 text-yellow-500" />}
        />
        <StatCard
          label="Days to Start"
          value={
            competition.competition?.startDate && new Date(competition.competition.startDate) > new Date()
              ? String(Math.ceil((new Date(competition.competition.startDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))
              : 'Started'
          }
          icon={<Calendar className="w-6 h-6 text-purple-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Rounds</h2>
            <div className="space-y-4">
              {competition.rounds?.map((round: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-lighter rounded-lg flex items-center justify-center text-brand-primary font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{round.name}</h3>
                      <p className="text-sm text-gray-500">{new Date(round.startDate).toLocaleDateString()} - {new Date(round.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{round.type.toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{round.timer} mins</p>
                  </div>
                </div>
              ))}
              {(!competition.rounds || competition.rounds.length === 0) && (
                <p className="text-gray-500 text-center py-4">No rounds configured.</p>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Organizer</p>
                <p className="font-medium text-gray-900">{competition.organizer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium text-gray-900">{competition.contact}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Max Participants</p>
                <p className="font-medium text-gray-900">{competition.registration?.maxParticipants || 'Unlimited'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Grades</p>
                <p className="font-medium text-gray-900">{competition.eligibility?.grades?.join(', ') || 'All'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Prize Details</p>
                <p className="font-medium text-gray-900">{competition.prizeDetails}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
