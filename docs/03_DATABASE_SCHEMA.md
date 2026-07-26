# 03 Database Schema

## Core Collections (Mongoose Models)

### Users
- `_id`: ObjectId
- `name`: String
- `email`: String (Unique)
- `passwordHash`: String
- `role`: Enum ['STUDENT', 'ADMIN', 'SCHOOL_ADMIN']
- `school`: String
- `grade`: String
- `createdAt`: Date
- `updatedAt`: Date

### Questions
- `_id`: ObjectId
- `topic`: String
- `difficulty`: Enum ['EASY', 'MEDIUM', 'HARD']
- `content`: String (Markdown/MathJax)
- `options`: Array of Strings (for MCQ)
- `correctAnswer`: String
- `explanation`: String

### Practice Sets / Competitions
- `_id`: ObjectId
- `title`: String
- `description`: String
- `type`: Enum ['PRACTICE', 'COMPETITION']
- `questions`: Array of ObjectIds (Ref: Questions)
- `startTime`: Date (for competitions)
- `endTime`: Date (for competitions)
- `isActive`: Boolean

### Submissions
- `_id`: ObjectId
- `userId`: ObjectId (Ref: Users)
- `competitionId`: ObjectId (Ref: Practice Sets)
- `answers`: Array of Objects `{ questionId, selectedAnswer }`
- `score`: Number
- `submittedAt`: Date
