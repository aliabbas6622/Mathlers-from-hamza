# Mathlers

Mathlers is a national mathematics competition platform with provisioned student accounts, school operations, championship rounds, and a developer-controlled administration portal.

## Tech Stack

- Next.js 16 App Router
- React 19
- Clerk authentication
- MongoDB with Mongoose
- Tailwind CSS
- Zod validation
- UploadThing and XLSX support for content workflows

## Current Features

- Student dashboard, profile, practice, competitions, progress, certificates, notifications, and results pages.
- Separate developer, school-admin, and teacher workspaces.
- Developer-controlled schools and batch account provisioning, with immediate Excel-compatible credential exports. Student credentials are never stored in Mathlers after export.
- Competition enrollment, access codes, rulebook acceptance, manual review, capacity controls, and multi-round championship qualification.
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
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
SUPER_ADMIN_EMAILS=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Mathlers
```

For the first developer, create a user in Clerk with a verified email, then run the one-time local bootstrap command using that same email:

```powershell
$env:SUPER_ADMIN_EMAIL='developer@example.com'
$env:SUPER_ADMIN_NAME='Platform Developer'
node scripts/bootstrap-super-admin.js
```

For Vercel, add the same verified Clerk email to `SUPER_ADMIN_EMAILS` in Production environment variables. On its first verified sign-in, Mathlers safely creates the developer profile and routes it to `/admin/developer`. The developer can then create schools and provision school admins, teachers, and students. Public registration intentionally redirects to `/request-access`.

## Development

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Use Clerk's development instance for local testing. There is no credentials-login bypass.

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

Prepare the competition indexes after taking a verified MongoDB backup:

```bash
npm run db:prepare-competition-indexes
```

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
- `teacher`
- `admin`
- `super_admin`

`super_admin` is the developer role and operates the platform-wide `/admin` portal. `admin` is scoped to one school and manages only that school’s teachers and students. `teacher` belongs to a school and has a read-only teaching workspace. `student` has no public sign-up path and can sign in only after a developer or school admin provisions an account. Route-level checks live in `proxy.ts`, while APIs enforce authorization independently.

## Known Gaps

- Automated end-to-end tests are not configured yet.
- Before launch, configure Clerk’s production instance, use production MongoDB credentials, run the index preparation command after a backup, configure shared CDN/WAF rate limits, and resolve the current dependency audit advisories before deploying.
