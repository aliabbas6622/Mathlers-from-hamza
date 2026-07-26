# 04 API Specification

## Authentication (`/api/auth/*`)
Handled by NextAuth.
- `POST /api/auth/callback/credentials`: Login
- `POST /api/auth/register`: Custom endpoint for student registration

## Users
- `GET /api/users`: List users (Admin)
- `GET /api/users/[id]`: Get user details
- `PUT /api/users/[id]`: Update user profile

## Questions
- `GET /api/questions`: Fetch question bank (supports filters)
- `POST /api/questions`: Create a new question (Admin)
- `PUT /api/questions/[id]`: Update question (Admin)
- `DELETE /api/questions/[id]`: Delete question (Admin)

## Competitions & Practice
- `GET /api/competitions`: List active competitions
- `GET /api/competitions/[id]`: Get competition details and questions
- `POST /api/competitions`: Create new competition (Admin)

## Submissions
- `POST /api/submissions`: Submit answers for a competition/practice set
- `GET /api/submissions/[userId]`: Get user's past submissions and scores

## Server Actions
Prefer Next.js Server Actions over API routes for form submissions and mutations within the App Router to reduce client-side JavaScript.
