import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel from '@/models/Competition';
import EnrollmentModel from '@/models/Enrollment';
import StudentCompetitionCenter from './StudentCompetitionCenter';
import { isValidObjectId } from '@/lib/utils/isValidObjectId';

export default async function CompetitionsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  await connectDB();

  // Fetch all active, upcoming, or draft competitions
  const rawCompetitions = await CompetitionModel.find().sort({ 'schedule.competitionStartDate': 1 });

  const competitions = JSON.parse(JSON.stringify(rawCompetitions));

  const hasValidId = isValidObjectId(session.user.id);
  const rawEnrollments = hasValidId 
    ? await EnrollmentModel.find({ student: session.user.id }) 
    : [];

  const enrollments = JSON.parse(JSON.stringify(rawEnrollments));

  const enrollmentMap: Record<string, any> = {};
  const enrolledCompIds: string[] = [];

  enrollments.forEach((e: any) => {
    const compId = e.competition.toString();
    enrollmentMap[compId] = e;
    enrolledCompIds.push(compId);
  });

  const enrolledCompetitions = competitions.filter((c: any) => enrolledCompIds.includes(c._id.toString()));

  return (
    <StudentCompetitionCenter
      competitions={competitions}
      enrolledCompetitions={enrolledCompetitions}
      enrollmentMap={enrollmentMap}
      studentName={session.user.name || 'Student'}
    />
  );
}
