import ChapterModel from '@/models/Chapter';
import GradeModel from '@/models/Grade';
import mongoose from 'mongoose';
import SubjectModel from '@/models/Subject';
import TopicModel from '@/models/Topic';

type QuestionLinks = { subject?: string; grade?: string; chapter?: string; topic?: string; subtopic?: string };

export async function validateQuestionLinks({ subject, grade, chapter, topic, subtopic }: QuestionLinks) {
  if (!subject) return 'Subject is required';

  const ids = [subject, grade, chapter, topic, subtopic].filter((id): id is string => Boolean(id));
  if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
    return 'Invalid subject, grade, chapter, topic, or subtopic reference';
  }

  const [subjectDoc, gradeDoc, chapterDoc, topicDoc] = await Promise.all([
    SubjectModel.findById(subject),
    grade ? GradeModel.findById(grade) : null,
    chapter ? ChapterModel.findById(chapter) : null,
    topic ? TopicModel.findById(topic) : null,
  ]);

  if (!subjectDoc) return 'Invalid subject reference';
  if (grade && !gradeDoc) return 'Invalid grade reference';
  if (chapter && !chapterDoc) return 'Invalid chapter reference';
  if (topic && !topicDoc) return 'Invalid topic reference';

  return null;
}
