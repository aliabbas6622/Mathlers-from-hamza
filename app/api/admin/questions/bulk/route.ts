import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import QuestionModel from '@/models/Question';
import {
  MAX_BULK_UPLOAD_BYTES,
  parseBulkUploadPayload,
  parseQuestionPayload,
  questionDuplicateFilter,
  questionDuplicateKey,
  questionError,
  readJsonPayload,
  type QuestionPayload,
} from '@/lib/questions/payload';
import { validateQuestionLinks } from '@/lib/questions/validateLinks';

type RowError = { row: number; error: string; code: string };
type PendingQuestion = { row: number; data: QuestionPayload };

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json(questionError('Unauthorized', 'UNAUTHORIZED'), { status: 401 });
    }

    const body = await readJsonPayload(request, MAX_BULK_UPLOAD_BYTES);
    if (!body.ok) return NextResponse.json(questionError(body.error, body.code), { status: body.status });

    const upload = parseBulkUploadPayload(body.data);
    if (!upload.ok) return NextResponse.json(questionError(upload.error, 'INVALID_UPLOAD'), { status: 400 });

    await connectDB();

    const errors: RowError[] = [];
    const pending: PendingQuestion[] = [];
    const seen = new Set<string>();
    const linkChecks = new Map<string, Promise<string | null>>();

    for (let index = 0; index < upload.data.questions.length; index += 1) {
      const row = index + 2;
      const parsed = parseQuestionPayload(upload.data.questions[index]);
      if (!parsed.ok) {
        errors.push({ row, error: parsed.error, code: 'INVALID_ROW' });
        continue;
      }

      const linkKey = [parsed.data.subject, parsed.data.grade, parsed.data.chapter, parsed.data.topic, parsed.data.subtopic || ''].join(':');
      const linkError = await (linkChecks.get(linkKey) || (() => {
        const check = validateQuestionLinks(parsed.data);
        linkChecks.set(linkKey, check);
        return check;
      })());
      if (linkError) {
        errors.push({ row, error: linkError, code: 'INVALID_REFERENCE' });
        continue;
      }

      const key = questionDuplicateKey(parsed.data);
      if (seen.has(key)) {
        errors.push({ row, error: 'Duplicate question in this upload', code: 'DUPLICATE_IN_UPLOAD' });
        continue;
      }

      seen.add(key);
      pending.push({ row, data: parsed.data });
    }

    if (pending.length) {
      const existing = await QuestionModel.find({ $or: pending.map(({ data }) => questionDuplicateFilter(data)) })
        .select('subject grade chapter topic subtopic question')
        .lean();
      const existingKeys = new Set(existing.map((question) => questionDuplicateKey({
        subject: question.subject.toString(),
        grade: question.grade.toString(),
        chapter: question.chapter.toString(),
        topic: question.topic.toString(),
        subtopic: question.subtopic?.toString(),
        question: question.question,
      })));

      for (let index = pending.length - 1; index >= 0; index -= 1) {
        if (existingKeys.has(questionDuplicateKey(pending[index].data))) {
          errors.push({ row: pending[index].row, error: 'An identical question already exists', code: 'DUPLICATE_EXISTS' });
          pending.splice(index, 1);
        }
      }
    }

    if (!pending.length) {
      return NextResponse.json({
        success: true,
        mode: 'partial',
        inserted: 0,
        failed: errors.length,
        errors: errors.sort((a, b) => a.row - b.row),
        message: 'No questions were uploaded; review the row errors',
      });
    }

    try {
      const inserted = await QuestionModel.insertMany(pending.map(({ data }) => ({
        ...data,
        createdBy: session.user.id,
      })), { ordered: false });

      return NextResponse.json({
        success: true,
        mode: 'partial',
        inserted: inserted.length,
        failed: errors.length,
        errors: errors.sort((a, b) => a.row - b.row),
        message: `${inserted.length} questions uploaded`,
      });
    } catch (error: unknown) {
      const writeErrors = (error as { writeErrors?: Array<{ index?: number; errmsg?: string; message?: string }> }).writeErrors || [];
      for (const writeError of writeErrors) {
        const pendingRow = writeError.index === undefined ? undefined : pending[writeError.index];
        errors.push({
          row: pendingRow?.row || 0,
          error: writeError.errmsg || writeError.message || 'Database rejected this question',
          code: 'DATABASE_REJECTED',
        });
      }

      if (writeErrors.length) {
        const inserted = Math.max(0, pending.length - writeErrors.length);
        return NextResponse.json({
          success: true,
          mode: 'partial',
          inserted,
          failed: errors.length,
          errors: errors.sort((a, b) => a.row - b.row),
          message: `${inserted} questions uploaded; some rows were rejected`,
        });
      }

      console.error('Error bulk uploading questions:', error);
      return NextResponse.json(questionError('Unable to save the upload', 'UPLOAD_FAILED'), { status: 500 });
    }
  } catch (error) {
    console.error('Error bulk uploading questions:', error);
    return NextResponse.json(questionError('Failed to upload questions', 'INTERNAL_ERROR'), { status: 500 });
  }
}
