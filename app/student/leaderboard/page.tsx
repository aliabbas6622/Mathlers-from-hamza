import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import UserModel, { UserRole } from '@/models/User';
import LeaderboardClient from './LeaderboardClient';

export default async function LeaderboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  await connectDB();

  // Fetch the logged-in user
  const currentUser = await UserModel.findById(session.user.id).lean();
  const hasSchool = !!currentUser?.school;

  // 1. Fetch National Data
  const topNational = await UserModel.find({ isActive: true, role: UserRole.STUDENT })
    .sort({ points: -1 })
    .limit(20)
    .lean();

  const nationalLeaderboard = topNational.map((student: any) => ({
    id: student._id.toString(),
    name: student.fullName,
    playerId: student.playerId,
    score: student.points || 0,
  }));

  let userNationalRank = null;
  if (currentUser && currentUser.role === UserRole.STUDENT) {
    const studentsWithHigherPoints = await UserModel.countDocuments({
      isActive: true,
      role: UserRole.STUDENT,
      points: { $gt: currentUser.points || 0 },
    });
    userNationalRank = studentsWithHigherPoints + 1;
  }

  // 2. Fetch School Data
  let schoolLeaderboard: any[] = [];
  let userSchoolRank = null;

  if (hasSchool) {
    const topSchool = await UserModel.find({ 
      isActive: true, 
      role: UserRole.STUDENT,
      school: currentUser.school
    })
      .sort({ points: -1 })
      .limit(20)
      .lean();

    schoolLeaderboard = topSchool.map((student: any) => ({
      id: student._id.toString(),
      name: student.fullName,
      playerId: student.playerId,
      score: student.points || 0,
    }));

    if (currentUser && currentUser.role === UserRole.STUDENT) {
      const schoolStudentsWithHigherPoints = await UserModel.countDocuments({
        isActive: true,
        role: UserRole.STUDENT,
        school: currentUser.school,
        points: { $gt: currentUser.points || 0 },
      });
      userSchoolRank = schoolStudentsWithHigherPoints + 1;
    }
  }

  // Serialize current user to pass to client
  const safeCurrentUser = currentUser ? {
    id: currentUser._id.toString(),
    points: currentUser.points || 0,
  } : null;

  return (
    <LeaderboardClient
      nationalLeaderboard={nationalLeaderboard}
      schoolLeaderboard={schoolLeaderboard}
      userNationalRank={userNationalRank}
      userSchoolRank={userSchoolRank}
      currentUser={safeCurrentUser}
      hasSchool={hasSchool}
    />
  );
}
