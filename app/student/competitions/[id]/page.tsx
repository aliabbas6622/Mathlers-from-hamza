import React from 'react';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel, { CompetitionCategory, CompetitionStatus, IChampionshipRound, ISection } from '@/models/Competition';
import EnrollmentModel from '@/models/Enrollment';
import Link from 'next/link';
import { ChevronLeft, Calendar, Users, Trophy, Book, Award, Clock, Layers } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import EnrollButton from './EnrollButton';
import { isValidObjectId } from '@/lib/utils/isValidObjectId';

export default async function StudentCompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }

  await connectDB();
  
  const { id } = await params;
  if (!isValidObjectId(id)) {
    redirect('/student/competitions');
  }
  const competition = await CompetitionModel.findById(id);

  if (!competition) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Competition not found</h2>
        <Link href="/student/competitions" className="text-brand-primary hover:underline">
          Back to Competitions
        </Link>
      </div>
    );
  }

  const hasValidId = isValidObjectId(session.user.id);
  const enrollment = hasValidId 
    ? await EnrollmentModel.findOne({ competition: id, student: session.user.id }) 
    : null;

  const visibleStatuses = [
    CompetitionStatus.REGISTRATION_OPEN,
    CompetitionStatus.REGISTRATION_CLOSED,
    CompetitionStatus.IN_PROGRESS,
    CompetitionStatus.PAUSED,
    CompetitionStatus.COMPLETED,
  ];
  if (!enrollment && !visibleStatuses.includes(competition.status)) {
    redirect('/student/competitions');
  }
  
  const isEnrolled = !!enrollment;
  const isFull = (competition.analytics?.totalRegistrations || 0) >= (competition.eligibility?.maxParticipants || 500);
  const registrationOpen = competition.status === 'registration_open';
  const categoryIcon: Record<string, string> = { public: '🌍', grade: '🏫', championship: '🥊' };
  const now = new Date();
  const activeRound = competition.category === CompetitionCategory.CHAMPIONSHIP
    ? competition.rounds.find((round) => new Date(round.schedule.startDate) <= now && now < new Date(round.schedule.endDate))
    : undefined;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back link */}
      <Link href="/student/competitions" className="inline-flex items-center text-sm text-gray-500 hover:text-brand-primary transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Competitions
      </Link>

      <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-brand-dark to-brand-primary rounded-2xl overflow-hidden flex items-center justify-center">
        <Trophy className="w-24 h-24 text-white opacity-20 absolute" />
        <div className="relative z-10 text-center px-4">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold mb-3">
            {categoryIcon[competition.category || 'public']} {String(competition.category || 'public').toUpperCase()}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{competition.name}</h1>
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
            String(competition.status) === 'in_progress' ? 'bg-green-500 text-white' :
            String(competition.status) === 'registration_open' ? 'bg-blue-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {String(competition.status).replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Book className="w-5 h-5 text-brand-primary" />
              About This Competition
            </h2>
            <p className="text-gray-600 whitespace-pre-line leading-relaxed">
              {competition.description}
            </p>
          </GlassCard>

          {/* Sections Breakdown */}
          <GlassCard className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-primary" />
              Sections & Structure
            </h2>
            <div className="space-y-4">
              {competition.category === CompetitionCategory.CHAMPIONSHIP ? competition.rounds?.map((round: IChampionshipRound, idx: number) => (
                <div key={round.roundNumber} className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-lighter font-bold text-brand-primary">{idx + 1}</div><div><h3 className="font-bold text-gray-900">{round.name}</h3><p className="text-sm text-gray-500">{round.sections.length} section(s) · {round.sections.reduce((total, section) => total + section.settings.duration, 0)} mins</p></div></div>
                  <div className="text-sm font-semibold text-gray-700">{new Date(round.schedule.startDate).toLocaleDateString()} — {new Date(round.schedule.endDate).toLocaleDateString()}{activeRound?.roundNumber === round.roundNumber && <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">Live now</span>}</div>
                </div>
              )) : competition.sections?.map((section: ISection, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-xl border border-gray-100 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 shrink-0 bg-brand-lighter rounded-lg flex items-center justify-center text-brand-primary font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{section.name}</h3>
                      {section.description && (
                        <p className="text-sm text-gray-500">{section.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-left sm:text-right bg-white p-3 rounded-lg border border-gray-100 w-full sm:w-auto">
                    <p className="text-xs text-gray-500 mb-1">Duration & Marks</p>
                    <p className="font-semibold text-gray-900">{section.settings?.totalMarks || 100} Marks</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 sm:justify-end">
                      <Clock className="w-3 h-3" />
                      {section.settings?.duration || 30} mins
                    </p>
                  </div>
                </div>
              ))}
              {((competition.category === CompetitionCategory.CHAMPIONSHIP && !competition.rounds?.length) || (competition.category !== CompetitionCategory.CHAMPIONSHIP && !competition.sections?.length)) && (
                <p className="text-gray-500 text-center py-4">No sections configured yet.</p>
              )}
            </div>
          </GlassCard>

          {/* Rulebook */}
          <GlassCard className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-primary" />
              Official Rulebook
            </h2>
            <p className="text-gray-600 whitespace-pre-line leading-relaxed font-mono text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
              {typeof competition.rulebook === 'object' ? competition.rulebook?.content : competition.rulebook}
            </p>
          </GlassCard>

          <GlassCard className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Prizes</h2>
            <p className="text-gray-600 whitespace-pre-line leading-relaxed">
              {competition.prizeDetails || 'Prize details will be announced soon.'}
            </p>
          </GlassCard>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3">Quick Info</h3>
            
            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-500 mb-1">Registration Ends</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-primary" />
                  {competition.registration?.endDate ? new Date(competition.registration.endDate).toLocaleDateString() : 'TBA'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Competition Starts</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  {competition.schedule?.competitionStartDate ? new Date(competition.schedule.competitionStartDate).toLocaleDateString() : 'TBA'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Participants</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500" />
                  {competition.analytics?.totalRegistrations || 0} / {competition.eligibility?.maxParticipants || 'Unlimited'}
                </p>
              </div>

              {competition.eligibility?.grades && competition.eligibility.grades.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Eligible Grades</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {competition.eligibility.grades.map((grade: string) => (
                      <span key={grade} className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                        {grade}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <EnrollButton 
                competitionId={competition._id.toString()} 
                isEnrolled={isEnrolled}
                enrollmentStatus={enrollment?.status}
                isFull={isFull}
                registrationOpen={registrationOpen}
                status={activeRound && competition.status === CompetitionStatus.IN_PROGRESS ? CompetitionStatus.IN_PROGRESS : competition.status}
                requiresRulebookAcceptance={competition.rulebook?.acceptanceRequired === true}
                requiresAccessCode={competition.registration?.type === 'access_code'}
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
