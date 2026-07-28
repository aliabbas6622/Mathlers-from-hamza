import mongoose from 'mongoose';
import { ChapterModel, GradeModel, SubjectModel, TopicModel } from '@mathlers/models';

type QuestionLinks = { subject?: string; grade?: string; chapter?: string; topic?: string; subtopic?: string };

export async function validateQuestionLinks({ subject, grade, chapter, topic, subtopic }: QuestionLinks) {
  if (!subject || !grade || !chapter || !topic) return 'Subject, grade, chapter, and topic are required';
  const ids = [subject, grade, chapter, topic, subtopic].filter((id): id is string => Boolean(id));
  if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
    return 'Invalid subject, grade, chapter, topic, or subtopic reference';
  }

  const [subjectDoc, gradeDoc, chapterDoc, topicDoc] = await Promise.all([
    SubjectModel.findById(subject), GradeModel.findById(grade), ChapterModel.findById(chapter), TopicModel.findById(topic),
  ]);
  if (!subjectDoc || !gradeDoc || !chapterDoc || !topicDoc) return 'Invalid subject, grade, chapter, or topic reference';
  const subjectGrades = subjectDoc.grades || [];
  if (subjectGrades.length && !subjectGrades.some((item) => item.toString() === grade)) return 'The subject is not available for the selected grade';
  if (chapterDoc.grade.toString() !== grade || chapterDoc.subject.toString() !== subject) return 'The chapter does not belong to the selected subject and grade';

  const linkedSubjects = [topicDoc.subject, ...(topicDoc.subjects || [])].filter(Boolean).map((item) => item.toString());
  if (!linkedSubjects.includes(subject)) return 'The topic is not linked to the selected subject';
  if (topicDoc.chapter.toString() !== chapter) return 'The topic does not belong to the selected chapter';
  const subtopics = topicDoc.subtopics || [];
  if (subtopics.length && !subtopic) return 'Select a subtopic for this topic';
  if (subtopic && !subtopics.some((item) => item._id?.toString() === subtopic)) return 'The subtopic does not belong to the selected topic';
  return null;
}
