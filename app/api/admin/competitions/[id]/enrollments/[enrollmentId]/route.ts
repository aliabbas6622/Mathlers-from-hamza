import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth, isSuperAdmin } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel from '@/models/Competition';
import EnrollmentModel, { EnrollmentStatus } from '@/models/Enrollment';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; enrollmentId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isSuperAdmin(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, enrollmentId } = await params;
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(enrollmentId)) return NextResponse.json({ error: 'Invalid enrollment' }, { status: 400 });

  const body = await request.json() as { status?: unknown };
  if (body.status !== EnrollmentStatus.APPROVED && body.status !== EnrollmentStatus.REJECTED) {
    return NextResponse.json({ error: 'Choose approve or reject.' }, { status: 400 });
  }

  await connectDB();
  const enrollment = await EnrollmentModel.findOneAndUpdate(
    { _id: enrollmentId, competition: id, status: EnrollmentStatus.PENDING },
    { $set: { status: body.status } },
    { new: true },
  );
  if (!enrollment) return NextResponse.json({ error: 'This pending enrollment is no longer available.' }, { status: 409 });

  if (body.status === EnrollmentStatus.REJECTED) {
    await CompetitionModel.updateOne({ _id: id, 'analytics.totalRegistrations': { $gt: 0 } }, { $inc: { 'analytics.totalRegistrations': -1 } });
  }

  return NextResponse.json({ ok: true, status: enrollment.status });
}
