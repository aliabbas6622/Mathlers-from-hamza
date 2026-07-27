# Improved Folder Structure Plan for Mathlers

## Current Issues
1. Mixed component types in `/components` (layout, layouts, ui, forms)
2. No dedicated hooks directory
3. No dedicated stores directory (Zustand)
4. No services layer for API calls
5. No constants directory
6. API routes not well organized by feature
7. No shared utilities for common operations
8. No types directory organization (all in one file)

## Proposed New Structure

```
/workspace
├── app/
│   ├── (auth)/                    # Auth-related pages (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (public)/                  # Public pages (landing)
│   │   └── landing/
│   ├── (dashboard)/               # Protected dashboard routes
│   │   ├── student/
│   │   │   ├── dashboard/
│   │   │   ├── practice/
│   │   │   ├── competitions/
│   │   │   ├── leaderboard/
│   │   │   ├── results/
│   │   │   ├── certificates/
│   │   │   ├── analytics/
│   │   │   ├── progress/
│   │   │   ├── profile/
│   │   │   ├── player-card/
│   │   │   └── notifications/
│   │   └── admin/
│   │       ├── dashboard/
│   │       ├── students/
│   │       ├── questions/
│   │       ├── competitions/
│   │       └── results/
│   ├── api/                       # API routes (reorganized)
│   │   ├── auth/
│   │   ├── users/
│   │   ├── practice/
│   │   ├── competitions/
│   │   ├── results/
│   │   ├── certificates/
│   │   ├── leaderboard/
│   │   ├── analytics/
│   │   └── public/
│   ├── globals.css
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page (redirects)
│
├── components/
│   ├── ui/                        # Base UI components (shadcn-style)
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Loading/
│   │   ├── EmptyState/
│   │   ├── Toast/
│   │   └── index.ts               # Barrel export
│   ├── forms/                     # Form components
│   │   ├── LoginForm/
│   │   ├── RegisterForm/
│   │   ├── QuestionForm/
│   │   └── index.ts
│   ├── layout/                    # Layout components
│   │   ├── Sidebar/
│   │   │   ├── AdminSidebar/
│   │   │   └── StudentSidebar/
│   │   ├── Header/
│   │   ├── Footer/
│   │   └── index.ts
│   ├── shared/                    # Shared components across features
│   │   ├── PlayerCard/
│   │   ├── StatCard/
│   │   ├── CompetitionCard/
│   │   ├── QuestionCard/
│   │   └── index.ts
│   └── index.ts                   # Main barrel export
│
├── hooks/                         # Custom React hooks
│   ├── useAuth.ts
│   ├── useUser.ts
│   ├── usePractice.ts
│   ├── useCompetition.ts
│   ├── useToast.ts
│   └── index.ts
│
├── stores/                        # Zustand state management
│   ├── authStore.ts
│   ├── userStore.ts
│   ├── practiceStore.ts
│   ├── competitionStore.ts
│   ├── toastStore.ts
│   └── index.ts
│
├── services/                      # API service layer
│   ├── api.ts                     # Base API client
│   ├── authService.ts
│   ├── userService.ts
│   ├── practiceService.ts
│   ├── competitionService.ts
│   ├── resultService.ts
│   ├── certificateService.ts
│   ├── leaderboardService.ts
│   ├── analyticsService.ts
│   └── index.ts
│
├── lib/
│   ├── auth/                      # Auth configuration
│   │   ├── auth.ts
│   │   └── auth.config.ts
│   ├── db/                        # Database connection
│   │   └── mongodb.ts
│   ├── utils/                     # Utility functions
│   │   ├── cn.ts                  # Class name utility
│   │   ├── formatters.ts          # Date, number formatters
│   │   ├── validators.ts          # Validation helpers
│   │   ├── permissions.ts         # Role-based permissions
│   │   └── index.ts
│   └── constants/                 # Application constants
│       ├── roles.ts
│       ├── badges.ts
│       ├── levels.ts
│       └── index.ts
│
├── models/                        # Mongoose models
│   ├── User.ts
│   ├── Question.ts
│   ├── PracticeSet.ts
│   ├── Competition.ts
│   ├── Result.ts
│   ├── Certificate.ts
│   ├── Achievement.ts
│   ├── Badge.ts
│   ├── Notification.ts
│   ├── Announcement.ts
│   ├── Enrollment.ts
│   ├── Grade.ts
│   ├── Subject.ts
│   ├── Topic.ts
│   ├── Chapter.ts
│   ├── Test.ts
│   ├── School.ts
│   └── index.ts                   # Barrel export
│
├── types/                         # TypeScript types
│   ├── models/                    # Model types
│   │   ├── user.ts
│   │   ├── question.ts
│   │   ├── competition.ts
│   │   └── index.ts
│   ├── api/                       # API types
│   │   ├── requests.ts
│   │   ├── responses.ts
│   │   └── index.ts
│   ├── common.ts                  # Common/shared types
│   └── index.ts                   # Main barrel export
│
├── config/                        # Configuration files
│   ├── site.ts                    # Site configuration
│   ├── navigation.ts              # Navigation menus
│   └── index.ts
│
├── middleware.ts                  # Next.js middleware
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Migration Steps

### Phase 1: Create New Directory Structure
1. Create new directories: hooks, stores, services, config
2. Reorganize app routes with route groups
3. Reorganize components with proper categorization
4. Split types into organized subdirectories
5. Add barrel exports (index.ts) for clean imports

### Phase 2: Move and Refactor Files
1. Move auth pages to (auth) group
2. Move dashboard pages to (dashboard) group
3. Reorganize API routes by feature
4. Split components into feature-based folders
5. Create service layer for API calls
6. Create custom hooks
7. Set up Zustand stores

### Phase 3: Update Imports
1. Update all import paths
2. Add path aliases in tsconfig.json
3. Test all functionality

## Benefits
- ✅ Clear separation of concerns
- ✅ Easier to find files
- ✅ Better scalability
- ✅ Cleaner imports with barrel exports
- ✅ Feature-based organization
- ✅ Better for team collaboration
- ✅ Follows Next.js best practices
