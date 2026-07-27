import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import SubjectModel from '@/models/Subject';
import GradeModel from '@/models/Grade';

const isAdmin = async () => {
  const session = await auth();
  return session && ['admin', 'super_admin'].includes(session.user.role);
};

export async function GET() {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const subjects = await SubjectModel.find().populate('grades', 'name code').sort({ order: 1, name: 1 });
    return NextResponse.json({ success: true, data: subjects });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load subjects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const body = await request.json() as { name?: string; code?: string; grades?: string[]; description?: string; color?: string; order?: number; isActive?: boolean };
    if (!body.name?.trim() || !body.code?.trim()) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }
    const grades = [...new Set((body.grades || []).filter(Boolean))];
    if (grades.length && await GradeModel.countDocuments({ _id: { $in: grades } }) !== grades.length) {
      return NextResponse.json({ error: 'One or more grades are invalid' }, { status: 400 });
    }

    const subject = await SubjectModel.create({
      name: body.name.trim(),
      code: body.code.trim().toUpperCase(),
      grades,
      description: body.description?.trim(),
      color: body.color || '#C1121F',
      order: Number(body.order) || 0,
      isActive: body.isActive ?? true,
    });
    return NextResponse.json({ success: true, data: subject }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create subject' }, { status: 400 });
  }
}
