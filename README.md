# Mathlers

Mathlers is a Next.js mathematics learning platform for students and admins. It includes student practice flows, competition enrollment, results tracking, an admin question bank, curriculum management, practice-book creation, analytics pages, and role-protected dashboards.

## Tech Stack

- Next.js 16 App Router
- React 19
- NextAuth credentials auth
- MongoDB with Mongoose
- Tailwind CSS
- Zod validation
- UploadThing and XLSX support for content workflows

## Current Features

- Student dashboard, profile, practice, competitions, progress, certificates, notifications, and results pages.
- Admin dashboard, student management, schools, learning overview, question bank, subjects and topics, practice sets, competitions, analytics, notifications, results, and settings pages.
- Question bank with solo question creation, bulk CSV/JSON/XLSX import, math notation support, subtopics, grade filtering, and validation against subject/grade/chapter/topic links.
- Curriculum management for subjects, grade availability, topics, chapters, and subtopics.
- Practice books built from selected question-bank questions across multiple subject and grade sections.
- Route protection through Next.js `proxy.ts` for `/admin/*` and `/student/*`.

## Setup

Install dependencies:

```bash
npm install
```

Create local environment values:

```bash
copy .env.example .env.local
```

Required values:

```env
MONGODB_URI=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Mathlers
```

Generate a strong auth secret when preparing a real environment:

```bash
openssl rand -base64 32
```

## Development

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Development bypass login is available outside production through the login screen for admin/student testing.

## Verification

Run type checking:

```bash
npm exec tsc -- --noEmit
```

Run a production build:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

Note: lint may still surface older codebase cleanup items. TypeScript and production build are the primary checks currently used for release confidence.

## Project Structure

```text
app/                  App Router pages and API routes
components/           Shared UI, forms, layout, and math rendering
lib/                  Auth, database, validation, and utility code
models/               Mongoose models
services/             Client-facing service wrappers
stores/               Zustand stores
types/                Shared TypeScript declarations
proxy.ts              Route protection for admin and student areas
next.config.ts        Next.js configuration
```

## Content Workflows

Admins manage curriculum from `/admin/content`:

- Create subjects and assign available student grades.
- Create topics under a grade, chapter, and one or more subjects.
- Add optional subtopics for finer question-bank classification.

Admins manage questions from `/admin/questions`:

- Create one question at a time.
- Import up to 250 rows per bulk upload.
- Required row fields are `subject`, `grade`, `chapter`, `topic`, `question`, `optionA`, `optionB`, `optionC`, `optionD`, `correctAnswer`, and `explanation`.
- Optional row fields include `subtopic`, `difficulty`, `marks`, `estimatedTime`, and `status`.

Admins manage practice books from `/admin/practice`:

- Create books with multiple sections.
- Select section subject and student grade.
- Import matching active questions from the question bank.
- Publish or unpublish books for student practice.

## Auth And Roles

The active roles are:

- `student`
- `admin`
- `super_admin`
- `coordinator`

Admin pages accept `admin` and `super_admin`. Student pages require `student`. Route-level checks live in `proxy.ts`, and API routes still perform their own role checks.

## Known Gaps

- Automated tests are not configured yet.
- Some documentation files outside this README are still placeholders.
- The coordinator role exists in the user model but does not yet have a dedicated portal.
- Some older admin pages still use stricter `admin` checks and can be widened to `super_admin` for consistency.
