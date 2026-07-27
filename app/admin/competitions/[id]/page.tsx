import React from 'react';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel from '@/models/Competition';
import Link from 'next/link';
import { ChevronRight, Settings, Users, Calendar, Trophy, CheckCircle, Clock, Layers } from 'lucide-react';
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

  const categoryLabel: Record<string, string> = {
    public: '🌍 Public',
    grade: '🏫 Grade',
    championship: '🥊 Championship',
  };

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
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-gray-900">{competition.name}</h1>
            <span className="px-3 py-1 bg-brand-lighter text-brand-primary rounded-full text-xs font-semibold">
              {categoryLabel[String(competition.category)] || competition.category}
            </span>
          </div>
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
          value={String(competition.status).replace(/_/g, ' ').toUpperCase()}
          icon={<CheckCircle className="w-6 h-6 text-brand-primary" />}
        />
        <StatCard
          label="Registrations"
          value={String(competition.analytics?.totalRegistrations || 0)}
          icon={<Users className="w-6 h-6 text-blue-500" />}
        />
        <StatCard
          label="Sections"
          value={String(competition.sections?.length || 0)}
          icon={<Layers className="w-6 h-6 text-yellow-500" />}
        />
        <StatCard
          label="Days to Start"
          value={
            competition.schedule?.competitionStartDate && new Date(competition.schedule.competitionStartDate) > new Date()
              ? String(Math.ceil((new Date(competition.schedule.competitionStartDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))
              : 'Started'
          }
          icon={<Calendar className="w-6 h-6 text-purple-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Sections</h2>
            <div className="space-y-4">
              {competition.sections?.map((section: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-lighter rounded-lg flex items-center justify-center text-brand-primary font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{section.name}</h3>
                      <p className="text-sm text-gray-500">{section.questions?.length || 0} questions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{section.settings?.totalMarks} marks</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" /> {section.settings?.duration} mins
                    </p>
                  </div>
                </div>
              ))}
              {(!competition.sections || competition.sections.length === 0) && (
                <p className="text-gray-500 text-center py-4">No sections configured.</p>
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
                <p className="text-sm text-gray-500">Difficulty</p>
                <p className="font-medium text-gray-900 capitalize">{competition.difficultyLevel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Max Participants</p>
                <p className="font-medium text-gray-900">{competition.eligibility?.maxParticipants || 'Unlimited'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Eligible Grades</p>
                <p className="font-medium text-gray-900">{competition.eligibility?.grades?.join(', ') || 'All'}</p>
              </div>
              {competition.registration?.accessCode && (
                <div>
                  <p className="text-sm text-gray-500">Access Code</p>
                  <p className="font-mono font-bold text-brand-primary bg-brand-lighter px-3 py-1.5 rounded-lg inline-block">
                    {competition.registration.accessCode}
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
