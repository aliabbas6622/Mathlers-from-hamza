import { NextResponse } from 'next/server';
import connectDB from '@mathlers/lib/db';
import SubjectModel from '@mathlers/models/Subject';
import '@mathlers/models/Grade';

export async function GET() {
  try {
    await connectDB();

    const subjects = await SubjectModel.find({ isActive: true }).select('name code grades').populate('grades', 'name code');

    return NextResponse.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}
