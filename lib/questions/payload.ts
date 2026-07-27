import { z } from 'zod';

export const MAX_QUESTION_REQUEST_BYTES = 128 * 1024;
export const MAX_BULK_UPLOAD_BYTES = 1024 * 1024;
export const MAX_BULK_QUESTIONS = 250;

export type QuestionPayload = z.infer<typeof questionSchema>;
export type QuestionUpdatePayload = z.infer<typeof questionUpdateSchema>;

type JsonReadResult =
  | { ok: true; data: unknown }
  | { ok: false; status: 400 | 413; error: string; code: 'INVALID_JSON' | 'PAYLOAD_TOO_LARGE' };

const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : String(val).trim()),
  z.string().max(max).optional()
);
const optionalNumber = (max: number, integer = false) => z.preprocess(
  (value) => value === '' || value === null || value === undefined ? undefined : Number(value),
  integer
    ? z.number().int().positive().max(max).optional()
    : z.number().finite().positive().max(max).optional(),
);

const optionsSchema = z.object({
  A: text(5_000),
  B: text(5_000),
  C: text(5_000),
  D: text(5_000),
});

const questionFields = z.object({
  subject: text(100),
  grade: optionalText(100),
  chapter: optionalText(100),
  topic: optionalText(100),
  subtopic: optionalText(100),
  question: text(12_000),
  options: optionsSchema,
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  explanation: text(12_000),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  marks: optionalNumber(1_000),
  estimatedTime: optionalNumber(14_400, true),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
});

const questionSchema = questionFields.extend({
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  marks: optionalNumber(1_000).default(1),
  estimatedTime: optionalNumber(14_400, true).default(60),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
});

const questionUpdateSchema = questionFields.partial().extend({
  subtopic: z.string().trim().max(100).optional(),
});

const bulkUploadSchema = z.object({
  questions: z.array(z.unknown()).min(1, 'At least one question is required').max(
    MAX_BULK_QUESTIONS,
    `A bulk upload can contain at most ${MAX_BULK_QUESTIONS} questions`,
  ),
});

const normalizeKey = (value: string) => value.replace(/^\uFEFF/, '').toLowerCase().replace(/[^a-z0-9]/g, '');

const asRecord = (value: unknown): Record<string, unknown> => (
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
);

const indexedRecord = (value: unknown) => Object.fromEntries(
  Object.entries(asRecord(value)).map(([key, item]) => [normalizeKey(key), item]),
);

const getValue = (record: Record<string, unknown>, aliases: string[]) => {
  for (const alias of aliases) {
    const value = record[normalizeKey(alias)];
    if (value !== undefined) return value;
  }
  return undefined;
};

const asText = (value: unknown) => (
  typeof value === 'string' || typeof value === 'number' ? String(value) : undefined
);

const assignText = (target: Record<string, unknown>, key: string, value: unknown) => {
  const textValue = asText(value);
  if (textValue !== undefined) target[key] = textValue;
};

export function normalizeQuestionPayload(value: unknown): Record<string, unknown> {
  const row = indexedRecord(value);
  const nestedOptions = indexedRecord(getValue(row, ['options', 'answers']));
  const normalized: Record<string, unknown> = {};

  assignText(normalized, 'subject', getValue(row, ['subject', 'subjectId']));
  assignText(normalized, 'grade', getValue(row, ['grade', 'gradeId']));
  assignText(normalized, 'chapter', getValue(row, ['chapter', 'chapterId']));
  assignText(normalized, 'topic', getValue(row, ['topic', 'topicId']));
  assignText(normalized, 'subtopic', getValue(row, ['subtopic', 'subtopicId']));
  assignText(normalized, 'question', getValue(row, ['question', 'questionText', 'prompt']));
  assignText(normalized, 'explanation', getValue(row, ['explanation', 'solution', 'answerExplanation']));
  assignText(normalized, 'correctAnswer', getValue(row, ['correctAnswer', 'correctOption', 'answer']));
  assignText(normalized, 'difficulty', getValue(row, ['difficulty', 'level']));
  assignText(normalized, 'marks', getValue(row, ['marks', 'mark', 'points']));
  assignText(normalized, 'estimatedTime', getValue(row, ['estimatedTime', 'time', 'timeSeconds', 'seconds']));
  assignText(normalized, 'status', getValue(row, ['status']));

  const options: Record<string, unknown> = {};
  for (const option of ['A', 'B', 'C', 'D'] as const) {
    const optionValue = getValue(nestedOptions, [option]) ?? getValue(row, [
      option,
      `option${option}`,
      `answer${option}`,
      `choice${option}`,
    ]);
    assignText(options, option, optionValue);
  }
  if (Object.keys(options).length) normalized.options = options;

  if (typeof normalized.correctAnswer === 'string') normalized.correctAnswer = normalized.correctAnswer.trim().toUpperCase();
  if (typeof normalized.difficulty === 'string') normalized.difficulty = normalized.difficulty.trim().toLowerCase();
  if (typeof normalized.status === 'string') normalized.status = normalized.status.trim().toLowerCase();

  return normalized;
}

const zodError = (error: z.ZodError) => {
  const issue = error.issues[0];
  const field = issue.path.length ? `${issue.path.join('.')}: ` : '';
  return `${field}${issue.message}`;
};

export function parseQuestionPayload(value: unknown) {
  const parsed = questionSchema.safeParse(normalizeQuestionPayload(value));
  return parsed.success
    ? { ok: true as const, data: parsed.data }
    : { ok: false as const, error: zodError(parsed.error) };
}

export function parseQuestionUpdatePayload(value: unknown) {
  const parsed = questionUpdateSchema.safeParse(normalizeQuestionPayload(value));
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  if (!Object.keys(parsed.data).length) return { ok: false as const, error: 'Provide at least one field to update' };
  return { ok: true as const, data: parsed.data };
}

export function parseBulkUploadPayload(value: unknown) {
  const parsed = bulkUploadSchema.safeParse(value);
  return parsed.success
    ? { ok: true as const, data: parsed.data }
    : { ok: false as const, error: zodError(parsed.error) };
}

export async function readJsonPayload(request: Request, maxBytes: number): Promise<JsonReadResult> {
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return { ok: false, status: 413, code: 'PAYLOAD_TOO_LARGE', error: `Request body must be at most ${maxBytes} bytes` };
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return { ok: false, status: 400, code: 'INVALID_JSON', error: 'Unable to read request body' };
  }

  if (new TextEncoder().encode(body).byteLength > maxBytes) {
    return { ok: false, status: 413, code: 'PAYLOAD_TOO_LARGE', error: `Request body must be at most ${maxBytes} bytes` };
  }

  try {
    return { ok: true, data: JSON.parse(body) };
  } catch {
    return { ok: false, status: 400, code: 'INVALID_JSON', error: 'Request body must be valid JSON' };
  }
}

export const questionError = (error: string, code: string) => ({ success: false, error, code });

export const questionDuplicateKey = ({ subject, grade, chapter, topic, subtopic, question }: Pick<
  QuestionPayload,
  'subject' | 'grade' | 'chapter' | 'topic' | 'subtopic' | 'question'
>) => [subject, grade, chapter, topic, subtopic || '', question.trim().replace(/\s+/g, ' ')].join(':');

export const questionDuplicateFilter = ({ subject, grade, chapter, topic, subtopic, question }: Partial<QuestionPayload> & { subject: string; question: string }) => ({
  subject,
  ...(grade ? { grade } : {}),
  ...(chapter ? { chapter } : {}),
  ...(topic ? { topic } : {}),
  subtopic: subtopic || null,
  question,
});

export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
