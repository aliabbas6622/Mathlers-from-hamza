import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import TopicModel from '@/models/Topic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const chapter = searchParams.get('chapter');

    const query: any = {};
    if (chapter) query.chapter = chapter;

    const topics = await TopicModel.find(query).populate('chapter', 'name');

    return NextResponse.json({
      success: true,
      data: topics
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}
