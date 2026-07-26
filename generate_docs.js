const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'docs');

if (fs.existsSync(rootDir)) {
  fs.rmSync(rootDir, { recursive: true, force: true });
}

const dirs = [
  '',
  'DESIGN',
  'STUDENT',
  'ADMIN',
  'DEVELOPMENT',
  'ROADMAP'
];

dirs.forEach(d => {
  const p = path.join(rootDir, d);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
});

const files = {
  '01_PROJECT_OVERVIEW.md': `# 01 Project Overview\n\n## Vision & Mission\nMathlers exists to make math feel like boxing, gaming, and competition instead of memorization.\n\n## Product Scope\n- Student Journey\n- Admin Journey\n- Platform Goals\n- Problem Statement & Solution\n`,
  '02_PRODUCT_REQUIREMENTS.md': `# 02 Product Requirements\n\n## Product Philosophy\nMath should feel like:\n🥊 Boxing\n🎮 Gaming\n🏆 Competition\ninstead of\n📚 Memorization\n\n## Core Principles\n- Learning\n- Competition\n- Motivation\n- Simplicity\n- Performance\n\n## UX Philosophy\nStudents should never feel lost. Every page should guide them naturally.\n\n## Design Philosophy\nPremium SaaS, Gaming, Glassmorphism, Minimal, Modern, Professional.\n`,
  '03_SYSTEM_ARCHITECTURE.md': `# 03 System Architecture\n\n## High-Level Architecture\n- Frontend Architecture (Next.js)\n- Backend Architecture (API Routes & Server Actions)\n- Folder Structure & Module Structure\n- Routing & Middleware\n- Authentication Flow\n- Services & State Management\n- Error Handling & Logging\n- Security & File Storage\n- Deployment & Scalability Strategy\n`,
  '04_DATABASE_SCHEMA.md': `# 04 Database Schema\n\n## ER Diagram & Models\n- Student, Admin, School Models\n- Subject, Grade, Chapter, Topic Models\n- Question, Practice Set, Test Models\n- Competition, Round, Enrollment, Attempt, Result Models\n- Notification, Certificate, Badge, Analytics Models\n- Relationships, Indexing Strategy, Validation Rules\n`,
  '05_API_SPECIFICATION.md': `# 05 API Specification\n\n## Endpoints\n- Authentication APIs\n- Student & Profile APIs\n- Practice, Question, Competition APIs\n- Enrollment, Result, Leaderboard APIs\n- Certificate, Notification, Analytics APIs\n- Admin & Settings APIs\n\n## Rules\n- Request/Response Examples\n- Error & Status Codes\n- Authorization Rules\n`,
  'DESIGN/06_BRAND_GUIDELINES.md': `# 06 Brand Guidelines\n\n## Brand Personality\nModern, Confident, Competitive, Inspiring, Student Friendly. Never childish, never boring.\n\n## Colors\n- Primary: Deep Red\n- Secondary: White\n- Background: Very Light Gray\n- Cards: Glass White\n- Danger: Red, Success: Green, Warning: Orange, Info: Blue\n\n## Typography\n- Headings: Bold\n- Body: Medium\n- Buttons: Semibold\n\n## Icons\nOnly Lucide Icons. Same stroke width. No mixed icon packs.\n`,
  'DESIGN/07_DESIGN_SYSTEM.md': `# 07 Design System\n\n## Layout & Spacing\n- 8-point Grid System\n- Containers, Margins, Padding\n- Sidebar Width, Navbar Height, Page Width\n\n## Visual Elements\n- Glassmorphism (Opacity, Blur)\n- Radius & Shadows\n- Hover Effects\n- Typography Scale\n- Button Sizes & Card Sizes\n`,
  'DESIGN/08_COMPONENT_LIBRARY.md': `# 08 Component Library\n\n## Components\n- Buttons (Properties, Variants, States, Sizes, Icons, Usage)\n- Cards, Tables, Forms, Charts\n- Badges, Dialogs, Toasts\n- Player Card Component, Competition Card, Analytics Cards\n- Skeletons & Loading Components\n- Alerts, Pagination, Tabs, Accordions, Chips, QR Components\n`,
  'DESIGN/09_LAYOUT_GUIDELINES.md': `# 09 Layout Guidelines\n\n## Public Website\nNavbar -> Hero -> Features -> Statistics -> Testimonials -> FAQ -> Footer\n\n## Student\nTop Navbar -> Sidebar -> Page Header -> Cards -> Content -> Footer\n\n## Admin\nTop Navbar -> Sidebar -> Toolbar -> Statistics -> Table -> Pagination\n\n## Other\n- Empty States, Error Pages, Loading Pages\n`,
  'DESIGN/10_PAGE_TEMPLATES.md': `# 10 Page Templates\n\n## Standard Templates\n- Dashboard Template\n- CRUD Template\n- Analytics Template\n- Form Template\n- Wizard Template\n- Table Template\n- Detail View Template\n- Settings Template\n- Profile Template\n- Competition Template\n`,
  'DESIGN/11_ANIMATIONS.md': `# 11 Animations\n\n## Motion Behavior\n- Page Transitions\n- Hover Effects, Card Animations, Button States\n- Sidebar, Navbar, Modal, Drawer, Toast Animations\n- Loading & Skeleton Animation, Chart Animation\n- Micro-interactions & Performance Guidelines\n`,
  'DESIGN/12_RESPONSIVE_GUIDELINES.md': `# 12 Responsive Guidelines\n\n## Screen Sizes\n- Desktop, Laptop, Tablet, Mobile Layouts & Breakpoints\n\n## Adaptive Elements\n- Navigation Changes (Sidebar Collapse, Bottom Navigation Rules)\n- Tables & Forms on Mobile\n- Dashboard Responsiveness\n- Touch Targets & Performance Optimization\n`,
  'DESIGN/13_UI_DEVELOPMENT_RULES.md': `# 13 UI Development Rules\n\n## 100+ Rules\n- Never create a page without a page title.\n- Always include breadcrumbs.\n- Every management page needs search.\n- Every table needs pagination.\n- Every form validates.\n- Every delete action requires confirmation.\n- Every page has loading skeletons.\n- Every page has empty states.\n- Every dashboard starts with KPI cards.\n- Every chart has legends.\n- Every button uses approved variants.\n- Only use design tokens. Never hardcode colors.\n- Never duplicate components.\n- Never use inconsistent spacing. Always use the 8-point spacing system.\n- Follow accessibility. Maintain responsiveness.\n`,
  'STUDENT/14_STUDENT_FLOW.md': `# 14 Student Flow\n\n## Journey\nLanding -> Register -> Login -> Dashboard -> Practice -> Competition -> Result -> Achievements -> Leaderboard\n`,
  'STUDENT/15_STUDENT_UI_GUIDE.md': `# 15 Student UI Guide\n\n## Pages\nDashboard, Profile, Player Card, Practice Arena, Practice Session, Practice Result, Daily Challenge, Weekly Challenge, Competition List, Competition Detail, Competition Lobby, Competition Attempt, Competition Result, Leaderboards, Achievements, Certificates, Notifications, Settings.\n`,
  'STUDENT/16_PRACTICE_SYSTEM.md': `# 16 Practice System\n\n## Hierarchy\nSubject -> Grade -> Chapter -> Topic -> Practice Set -> Attempt -> Result\n`,
  'STUDENT/17_COMPETITION_SYSTEM.md': `# 17 Competition System\n\n## Flow\nCompetition -> Enrollment -> Rulebook -> QR Pass -> Lobby -> Competition -> Result -> Qualification -> Next Round\n`,
  'STUDENT/18_PLAYER_CARD_SYSTEM.md': `# 18 Player Card System\n\n## Identity\nQR, Rank, Points, Download, Verification, Sharing.\n`,
  'STUDENT/19_REWARD_SYSTEM.md': `# 19 Reward System\n\n## Mechanics\nPoints, Badges, Achievements, Streaks, Leaderboard Progression.\n`,
  'STUDENT/20_STUDENT_ANALYTICS.md': `# 20 Student Analytics\n\n## Metrics\nPerformance charts, subject proficiency, history, engagement metrics.\n`,
  'ADMIN/21_ADMIN_FLOW.md': `# 21 Admin Flow\n\n## Journey\nLogin -> Dashboard -> Question Bank -> Practice Set -> Competition -> Results -> Analytics\n`,
  'ADMIN/22_ADMIN_UI_GUIDE.md': `# 22 Admin UI Guide\n\n## Pages\nDashboard, Student Management, School Management, Learning Management, Question Bank, Practice Sets, Tests, Competition Management, Round Builder, Enrollment, Live Control, Certificates, Analytics, Notifications, Settings.\n`,
  'ADMIN/23_LEARNING_MANAGEMENT.md': `# 23 Learning Management\n\n## Structure\nSubjects, Grades, Chapters, Topics.\n`,
  'ADMIN/24_QUESTION_BANK.md': `# 24 Question Bank\n\n## Management\nCRUD for Questions, bulk import/export, tagging, difficulty mapping.\n`,
  'ADMIN/25_PRACTICE_SET_SYSTEM.md': `# 25 Practice Set System\n\n## Configurations\nDynamic generation, fixed sets, parameters.\n`,
  'ADMIN/26_TEST_MANAGEMENT.md': `# 26 Test Management\n\n## Setup\nStandardized tests, mocks, grading logic.\n`,
  'ADMIN/27_COMPETITION_MANAGEMENT.md': `# 27 Competition Management\n\n## Creation\nRulebooks, Round Builder, Live Competition Control, Enrollment Management.\n`,
  'ADMIN/28_ANALYTICS_SYSTEM.md': `# 28 Analytics System\n\n## Data\nEvery graph, chart, statistic. Question analytics, Student analytics, Competition analytics, Platform analytics.\n`,
  'ADMIN/29_SETTINGS_AND_PERMISSIONS.md': `# 29 Settings and Permissions\n\n## Config\nRoles (Admin, School Admin), permissions map, global settings.\n`,
  'DEVELOPMENT/30_CODING_STANDARDS.md': `# 30 Coding Standards\n\n## Best Practices\nTypeScript strictness, ESLint, Prettier, naming conventions.\n`,
  'DEVELOPMENT/31_FOLDER_STRUCTURE.md': `# 31 Folder Structure\n\n## Architecture\nClear breakdown of src/ and docs/ organization.\n`,
  'DEVELOPMENT/32_REUSABLE_COMPONENT_RULES.md': `# 32 Reusable Component Rules\n\n## Component Dev\nProps definitions, no business logic in dumb components, styling via tokens.\n`,
  'DEVELOPMENT/33_SECURITY_GUIDELINES.md': `# 33 Security Guidelines\n\n## Protocols\nData validation, rate limiting, auth security, SSR protections.\n`,
  'DEVELOPMENT/34_PERFORMANCE_GUIDELINES.md': `# 34 Performance Guidelines\n\n## Optimization\nImage optimization, lazy loading, caching strategies, Next.js best practices.\n`,
  'DEVELOPMENT/35_TESTING_GUIDELINES.md': `# 35 Testing Guidelines\n\n## QA\nUnit tests, e2e tests, component tests.\n`,
  'ROADMAP/36_PHASE_1.md': `# 36 Phase 1\n\n## Foundation\nProject Setup, Auth, Landing Page, Base UI Components, Error Pages, Initial Testing.\n`,
  'ROADMAP/37_PHASE_2.md': `# 37 Phase 2\n\n## Student Platform\nDashboard, Profile, Practice Module, Challenges, Competitions, Results, Leaderboards, Certificates, Student Analytics.\n`,
  'ROADMAP/38_PHASE_3.md': `# 38 Phase 3\n\n## Admin Platform\nAdmin Dashboard, Management Modules, Rulebooks, Round Builder, Live Control, Advanced Analytics, Roles & Permissions.\n`,
  '39_AI_DEVELOPMENT_RULES.md': `# 39 AI Development Rules\n\n## Instruction Manual for AI Agents\n- Read all documentation before writing code.\n- Never skip required fields.\n- Never invent page layouts.\n- Always use reusable components.\n- Keep consistent navigation.\n- Maintain the red-and-white glassmorphism theme.\n- Follow the defined student and admin flows.\n- Use modular architecture.\n- Build production-ready pages only.\n- If adding a new page, first determine its template, then reuse existing components instead of creating new ones.\n`
};

for (const [file, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(rootDir, file), content);
}

console.log("39 files generated.");
