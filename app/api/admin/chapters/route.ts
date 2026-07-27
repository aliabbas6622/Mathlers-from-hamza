import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import ChapterModel from '@/models/Chapter';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const grade = searchParams.get('grade');
    const subject = searchParams.get('subject');

    const query: Record<string, string> = {};
    if (grade) query.grade = grade;
    if (subject) query.subject = subject;

    const chapters = await ChapterModel.find(query).populate('grade', 'name').populate('subject', 'name');

    return NextResponse.json({
      success: true,
      data: chapters
    });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
}
