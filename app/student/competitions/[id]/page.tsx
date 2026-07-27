import React from 'react';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel from '@/models/Competition';
import EnrollmentModel from '@/models/Enrollment';
import Link from 'next/link';
import { ChevronLeft, Calendar, Users, Trophy, Book, Award, Clock } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import EnrollButton from './EnrollButton';
import { isValidObjectId } from '@/lib/utils/isValidObjectId';

export default async function StudentCompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  await connectDB();
  
  const { id } = await params;
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
  
  const isEnrolled = !!enrollment;
  const isFull = (competition.analytics?.registrations || 0) >= competition.registration.maxParticipants;
  const registrationOpen = competition.status === 'registration_open';

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
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{competition.name}</h1>
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
            String(competition.status) === 'in_progress' ? 'bg-green-500 text-white' :
            String(competition.status) === 'registration_open' ? 'bg-blue-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {String(competition.status).replace('_', ' ').toUpperCase()}
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

          <GlassCard className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-primary" />
              Rounds & Structure
            </h2>
            <div className="space-y-4">
              {competition.rounds?.map((round: any, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-xl border border-gray-100 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 shrink-0 bg-brand-lighter rounded-lg flex items-center justify-center text-brand-primary font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{round.name}</h3>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(round.startDate).toLocaleDateString()} - {new Date(round.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right bg-white p-3 rounded-lg border border-gray-100 w-full sm:w-auto">
                    <p className="text-xs text-gray-500 mb-1">Format</p>
                    <p className="font-semibold text-gray-900">{round.type.toUpperCase()}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 sm:justify-end">
                      <Clock className="w-3 h-3" />
                      {round.timer} mins
                    </p>
                  </div>
                </div>
              ))}
              {(!competition.rounds || competition.rounds.length === 0) && (
                <p className="text-gray-500 text-center py-4">No rounds configured yet.</p>
              )}
            </div>
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
                  {new Date(competition.registration.endDate).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Competition Starts</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  {new Date(competition.competition.startDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Participants</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500" />
                  {competition.analytics?.registrations || 0} / {competition.registration.maxParticipants}
                </p>
              </div>

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
            </div>

            <div className="mt-8">
              <EnrollButton 
                competitionId={competition._id.toString()} 
                isEnrolled={isEnrolled}
                isFull={isFull}
                registrationOpen={registrationOpen}
              />
            </div>
            
            {competition.rulebook && (
              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <a 
                  href={competition.rulebook.startsWith('http') ? competition.rulebook : '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-brand-primary hover:underline font-medium"
                >
                  View Official Rulebook
                </a>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
