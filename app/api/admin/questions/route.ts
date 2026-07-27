import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import QuestionModel from '@/models/Question';
import SubjectModel from '@/models/Subject';
import GradeModel from '@/models/Grade';
import ChapterModel from '@/models/Chapter';
import TopicModel from '@/models/Topic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const subject = searchParams.get('subject') || '';
    const grade = searchParams.get('grade') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const status = searchParams.get('status') || '';

    const query: any = {};

    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { explanation: { $regex: search, $options: 'i' } }
      ];
    }

    if (subject) query.subject = subject;
    if (grade) query.grade = grade;
    if (difficulty) query.difficulty = difficulty;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const questions = await QuestionModel.find(query)
      .populate('subject', 'name')
      .populate('grade', 'name level')
      .populate('chapter', 'name')
      .populate('topic', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await QuestionModel.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      subject,
      grade,
      chapter,
      topic,
      question,
      options,
      correctAnswer,
      explanation,
      difficulty,
      marks,
      estimatedTime,
      status
    } = body;

    // Validation
    if (!subject || !grade || !chapter || !topic) {
      return NextResponse.json(
        { error: 'Subject, grade, chapter, and topic are required' },
        { status: 400 }
      );
    }

    if (!question || !options || !correctAnswer || !explanation) {
      return NextResponse.json(
        { error: 'Question, options, correct answer, and explanation are required' },
        { status: 400 }
      );
    }

    // Validate options structure
    if (!options.A || !options.B || !options.C || !options.D) {
      return NextResponse.json(
        { error: 'All four options (A, B, C, D) are required' },
        { status: 400 }
      );
    }

    if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      return NextResponse.json(
        { error: 'Correct answer must be A, B, C, or D' },
        { status: 400 }
      );
    }

    // Verify references exist
    const [subjectDoc, gradeDoc, chapterDoc, topicDoc] = await Promise.all([
      SubjectModel.findById(subject),
      GradeModel.findById(grade),
      ChapterModel.findById(chapter),
      TopicModel.findById(topic)
    ]);

    if (!subjectDoc || !gradeDoc || !chapterDoc || !topicDoc) {
      return NextResponse.json(
        { error: 'Invalid subject, grade, chapter, or topic reference' },
        { status: 400 }
      );
    }

    const newQuestion = await QuestionModel.create({
      subject,
      grade,
      chapter,
      topic,
      question,
      options,
      correctAnswer,
      explanation,
      difficulty: difficulty || 'medium',
      marks: marks || 1,
      estimatedTime: estimatedTime || 60,
      status: status || 'active',
      createdBy: session.user.id,
      analytics: {
        totalAttempts: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        correctPercentage: 0,
        incorrectPercentage: 0,
        averageTime: 0,
        fastestCorrectAnswer: 0,
        slowestCorrectAnswer: 0,
        skipCount: 0,
        numberOfTimesUsed: 0,
        lastUsedDate: new Date(),
        usageInPractice: 0,
        usageInTests: 0,
        usageInCompetitions: 0,
        mostSelectedWrongOption: null,
        difficultyIndex: 0,
        successRateByGrade: new Map(),
        successRateBySchool: new Map()
      }
    });

    const populatedQuestion = await QuestionModel.findById(newQuestion._id)
      .populate('subject', 'name')
      .populate('grade', 'name level')
      .populate('chapter', 'name')
      .populate('topic', 'name');

    return NextResponse.json({
      success: true,
      data: populatedQuestion,
      message: 'Question created successfully'
    });
  } catch (error: any) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create question' },
      { status: 500 }
    );
  }
}
