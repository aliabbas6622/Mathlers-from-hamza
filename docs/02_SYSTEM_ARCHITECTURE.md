# 02 System Architecture

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Vanilla CSS structure, Tailwind classes)
- **Database:** MongoDB (using Mongoose)
- **Authentication:** NextAuth.js
- **State Management:** Zustand
- **Form Handling & Validation:** React Hook Form + Zod
- **Icons:** Lucide React
- **Animations:** Framer Motion

## Architectural Flow
1. **Client Layer:** Next.js React components (Server and Client components). Client-side state managed by Zustand.
2. **API/Server Layer:** Next.js Server Actions and API Routes (`/api/*`). Handles business logic and database interactions securely.
3. **Data Layer:** MongoDB accessed via Mongoose models.

## Folder Structure
- `/app`: Next.js App Router pages and layouts.
- `/components`: Reusable UI components (buttons, cards, modals).
- `/lib`: Utility functions, database connection, Auth config.
- `/models`: Mongoose database schemas.
- `/hooks`: Custom React hooks.
- `/stores`: Zustand state stores.
- `/types`: TypeScript type definitions.
- `/styles`: Global CSS (`globals.css`).
