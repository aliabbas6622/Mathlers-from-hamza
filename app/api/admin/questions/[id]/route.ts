import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import QuestionModel from '@/models/Question';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const question = await QuestionModel.findById(params.id)
      .populate('subject', 'name code')
      .populate('grade', 'name level')
      .populate('chapter', 'name')
      .populate('topic', 'name')
      .populate('createdBy', 'name email');

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const existingQuestion = await QuestionModel.findById(params.id);
    
    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (subject) existingQuestion.subject = subject;
    if (grade) existingQuestion.grade = grade;
    if (chapter) existingQuestion.chapter = chapter;
    if (topic) existingQuestion.topic = topic;
    if (question) existingQuestion.question = question;
    if (options) existingQuestion.options = options;
    if (correctAnswer) existingQuestion.correctAnswer = correctAnswer;
    if (explanation) existingQuestion.explanation = explanation;
    if (difficulty) existingQuestion.difficulty = difficulty;
    if (marks !== undefined) existingQuestion.marks = marks;
    if (estimatedTime !== undefined) existingQuestion.estimatedTime = estimatedTime;
    if (status) existingQuestion.status = status;

    await existingQuestion.save();

    const updatedQuestion = await QuestionModel.findById(existingQuestion._id)
      .populate('subject', 'name')
      .populate('grade', 'name level')
      .populate('chapter', 'name')
      .populate('topic', 'name');

    return NextResponse.json({
      success: true,
      data: updatedQuestion,
      message: 'Question updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update question' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const question = await QuestionModel.findById(params.id);
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting status to archived
    question.status = 'archived';
    await question.save();

    return NextResponse.json({
      success: true,
      message: 'Question archived successfully'
    });
  } catch (error: any) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete question' },
      { status: 500 }
    );
  }
}
