<div align="center">

# 🚀 JobOps

### **AI-Powered Recruitment & Career Management Automation Platform**

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](https://opensource.org/licenses/ISC)

**A full-stack MERN application delivering end-to-end recruitment automation — from secure multi-provider authentication and AI-driven resume analysis to user-supplied AI API key management and automated email workflows.**

[Getting Started](#-getting-started) · [Features](#-key-features--completion-status) · [Architecture](#-system-architecture) · [Testing](#-testing-suite) · [Contributing](#-contributing)

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Key Features & Completion Status](#-key-features--completion-status)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Testing Suite](#-testing-suite)
- [API Route Map](#-api-route-map)
- [Database Schema Highlights](#-database-schema-highlights)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔭 Overview

**JobOps** is a production-grade recruitment and career management platform engineered with a modern MERN architecture. It unifies secure authentication, intelligent resume parsing, job tracking, AI-assisted career guidance, and unrestricted access via a bring-your-own-key (BYOK) model — all within a cleanly separated monorepo.

There is no paywall and no subscription tiers. Every user gets full, unrestricted access to job search. Searches run against a shared default AI model key; once that key's rate limit is reached, the user can add their own AI model API key to keep searching, instead of hitting a paid upgrade wall.

The platform serves two distinct personas through role-based dashboards:

| Persona | Capabilities |
|---------|-------------|
| **User** | Resume upload & AI analysis, job search & save, AI chatbot, AI API key management, email automation, account lifecycle management |
| **Admin** | Platform analytics, user management, API key usage oversight, feedback triage, AI monitoring, system settings |

## ✨ Recent Updates

The project has recently been hardened around the core job-search experience with production-ready reliability improvements:

- Added robust resume upload validation for PDF and DOCX files, including size limits and empty/corrupt-file handling.
- Introduced structured resume-text extraction and safer AI-response parsing so malformed or incomplete model output is handled gracefully.
- Removed the subscription paywall entirely — search is unrestricted for every user, with a BYOK (bring-your-own-key) flow for continuing past the shared default key's rate limit.
- Added clearer rate-limit/error responses so the frontend can surface "add your own API key to continue" and AI-service issues directly to users.
- Expanded the email automation workflow with recurring job-match emails tied to the user's saved resume context, available to every user regardless of tier.
- Added regression tests covering resume-processing helpers and the main analysis path.

### Verification Status

- Backend tests: passing via `npm test -- --runInBand`
- Frontend build: passing via `npm run build`

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT  (React 19 + Vite 8)                    │
│                                                                         │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌────────────────────┐    │
│  │  Auth UI │  │ Dashboard │  │ Admin     │  │ API Key Mgmt       │    │
│  │  Login   │  │ Resume    │  │ Overview  │  │ ApiKeySettings     │    │
│  │  Register│  │ JobCart   │  │ Users     │  │ AddKeyModal        │    │
│  │  OTP     │  │ Analytics │  │ AI Keys   │  │ KeyLimitBanner     │    │
│  │  OAuth   │  │ Settings  │  │ Feedback  │  │ UsageBanner        │    │
│  └──────────┘  └───────────┘  └───────────┘  └────────────────────┘    │
│                                                                         │
│  Context API: ApiKeyContext ──────────── Hooks: useBfcacheHandler,     │
│                                         useKeyLimitPrompt, useAdminData│
└──────────────────────────┬──────────────────────────────────────────────┘
                           │  Axios (HTTP + Cookies)
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS 5 SERVER  (Node.js + TypeScript)             │
│                                                                          │
│  ┌──────────────── Middleware Layer ────────────────────────────────┐    │
│  │  authMiddleware ─ adminMiddleware ─ apiKeyLimitMiddleware        │    │
│  │  uploadMiddleware ─ nocache (bfcache security)                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌──── Routes ─────┐    ┌───── Controllers ──────┐    ┌── Services ──┐  │
│  │ /api/auth       │───▶│ authController          │    │ apiKey       │  │
│  │ /api/user       │    │ aiController            │    │ Service      │  │
│  │ /api/jobresult  │───▶│ aiChatController        │    │ accountDel.  │  │
│  │ /api/ai         │    │ adminController         │    │ Service      │  │
│  │ /api/admin      │───▶│ apiKeyController        │    │ aiKeyRouter  │  │
│  │ /api/api-keys   │    │ emailAutomation         │    │ userService  │  │
│  │ /api/feedback   │───▶│   Controller            │    └──────────────┘  │
│  │ /api/email-auto │    └─────────────────────────┘    ┌── Scheduler ──┐ │
│  │ /api/account    │                                   │ emailAutomation│ │
│  │ /logout         │                                   │   Scheduler    │ │
│  └─────────────────┘                                   └────────────────┘ │
│                                                                          │
│  ┌─── Config ──────────────────────────┐    ┌─── Utils ───────────────┐  │
│  │ passport.ts (Local Strategy)        │    │ generateOTP.ts          │  │
│  │ passportGithub.ts (GitHub OAuth)    │    │ sendEmail.ts            │  │
│  │ mDB.ts (MongoDB Connection)        │    │ dateUtils.ts            │  │
│  │ prisma.ts (Prisma Client)          │    │ encryptKey.ts           │  │
│  │ aiProviderConfig.ts                │    └─────────────────────────┘  │
│  └─────────────────────────────────────┘                                 │
└──────────┬────────────────────────┬──────────────────────────────────────┘
           │                        │
           ▼                        ▼
┌─────────────────────┐  ┌─────────────────────────────────────────────┐
│   MongoDB            │  │   MySQL (via Prisma ORM)                    │
│   (Mongoose)         │  │                                             │
│                      │  │   Users ─ Profiles ─ Resumes ─ SavedJobs   │
│   • AI Results       │  │   OTPs ─ Feedback ─ ApiKeys                │
│   • Chat QA Seeds    │  │   UsageTracking ─ Workflows                 │
│   • Analytics Logs   │  │   AdminSettings ─ AccountRecoveryRequests   │
│   • Notifications    │  │   AdminNotifications                        │
│   • Saved Jobs Cache │  │                                             │
│   • Resume Metadata  │  │                                             │
└─────────────────────┘  └─────────────────────────────────────────────┘
           │                        │
           └───────────┬────────────┘
                       ▼
          ┌───────────────────────────────────┐
          │       Third-Party Services        │
          │                                   │
          │  • User-supplied AI model keys    │
          │  • Nodemailer (SMTP)              │
          │  • GitHub OAuth Provider          │
          │  • Gemini AI (default/shared key) │
          └───────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.x | Component-based UI library |
| **TypeScript** | 6.x | Static type safety |
| **Vite** | 8.x | Lightning-fast dev server & build tool |
| **Tailwind CSS** | 4.x | Utility-first styling framework |
| **React Router DOM** | 7.x | Client-side routing & navigation |
| **Framer Motion** | 12.x | Animation & transition library |
| **Lucide React** | 1.x | Icon system |
| **Axios** | 1.x | HTTP client with cookie support |
| **Context API** | — | Global state management (`ApiKeyContext`) |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | LTS | Server runtime |
| **Express** | 5.x | Web framework with async middleware |
| **TypeScript** | 6.x | Type-safe server code |
| **Passport.js** | 0.7 | Authentication framework (Local + GitHub strategies) |
| **JWT** | 9.x | Stateless token-based session management |
| **bcrypt** | 6.x | Password hashing (salted) |
| **pdf-parse** | 2.x | Resume PDF text extraction |
| **Multer** | 2.x | Multipart file upload middleware |
| **Nodemailer** | 8.x | SMTP email dispatch |
| **cookie-parser** | 1.x | Signed/HttpOnly cookie parsing |

### Databases & ORM

| Technology | Purpose |
|------------|---------|
| **MySQL** | Primary relational store (users, API keys, feedback, admin settings) |
| **Prisma ORM** | Type-safe database client with migrations & schema introspection |
| **MongoDB** | Document store (AI results, chat seeds, analytics logs, notifications) |
| **Mongoose** | MongoDB ODM for schema validation |

### Third-Party Integrations

| Service | Purpose |
|---------|---------|
| **GitHub OAuth** | Social sign-in via `passport-github2` |
| **Gemini AI** | Default shared AI provider for resume analytics, with user-supplied API key fallback |
| **Nodemailer** | Automated email notification pipelines |

### Testing & CI/CD

| Tool | Purpose |
|------|---------|
| **Playwright** | Cross-browser E2E testing (Chromium, Firefox, WebKit) |
| **Jest + ts-jest** | Unit & integration testing with TypeScript support |
| **Supertest** | HTTP assertion library for API route testing |
| **GitHub Actions** | CI pipeline for automated Playwright test runs |

---

## ✅ Key Features & Completion Status

### 1. Authentication & Security Guardrails

| Feature | Status |
|---------|--------|
| Local sign-up/login with bcrypt-hashed passwords | 🟢 Complete |
| GitHub OAuth integration via Passport.js | 🟢 Complete |
| Multi-factor OTP verification (email delivery) | 🟢 Complete |
| JWT tokens stored in HttpOnly secure cookies | 🟢 Complete |
| Input validation checkboxes on registration | 🟢 Complete |
| `nocache` middleware to block bfcache back-button exploits | 🟢 Complete |
| `useBfcacheHandler` hook for client-side session validation | 🟢 Complete |
| Account deletion with grace period & admin-moderated recovery | 🟢 Complete |
| Automated permanent deletion background job (6-hour cycle) | 🟢 Complete |

### 2. Resume Parser & AI Extraction Engine

| Feature | Status |
|---------|--------|
| PDF and DOCX resume upload via `uploadMiddleware` (Multer) | 🟢 Complete |
| Safe document text extraction with validation and file-size guardrails | 🟢 Complete |
| AI-powered resume analysis & career analytics with structured JSON output | 🟢 Complete |
| Graceful handling for empty, malformed, timeout, and rate-limit AI responses | 🟢 Complete |
| Authenticated resume analysis tied to the logged-in user | 🟢 Complete |
| Usage tracking with plan-based rate limits | 🟢 Complete |

### 3. Smart Job Cart & Tracking

| Feature | Status |
|---------|--------|
| Job search with paginated results | 🟢 Complete |
| Save/unsave jobs to personalized `JobCart` | 🟢 Complete |
| Saved jobs aggregation with apply-link tracking | 🟢 Complete |
| Plan-based saved job limits (`maxSavedJobs`) | 🟢 Complete |

### 4. Interactive AI Chatbot

| Feature | Status |
|---------|--------|
| Local chat utility powered by `aiChatController` | 🟢 Complete |
| Seeded knowledge base via `seedChatQA.ts` | 🟢 Complete |
| Bulk answer population script (`populateChatAnswers.ts`) | 🟢 Complete |
| Floating chatbot UI component (`AIChatbot.tsx`) | 🟢 Complete |

### 5. Bring-Your-Own-Key (BYOK) AI Access — No Paywall

| Feature | Status |
|---------|--------|
| No subscription tiers, no paywall — full search access is free for every user | 🟢 Complete |
| Searches run against a shared default AI model key until its rate limit is reached | 🟢 Complete |
| Users can add their own AI model API key to keep searching past the shared key's limit | 🟢 Complete |
| Support for multiple user-added keys with automatic fallback to the next key on exhaustion | 🟢 Complete |
| Server-side validation of a submitted API key before accepting it | 🟢 Complete |
| Encrypted storage of user-submitted API keys | 🟢 Complete |
| `apiKeyLimitMiddleware` route protection (checks default-key quota, not a plan tier) | 🟢 Complete |
| `AddKeyModal` interception when the shared key's quota is exhausted | 🟢 Complete |
| `ApiKeyContext` for global key/usage state | 🟢 Complete |
| Per-key usage tracking (not per-subscription-tier) | 🟢 Complete |
| `SearchUsageVisualizer` for real-time quota display | 🟢 Complete |

### 6. Robust Administrative Suite

| Feature | Status |
|---------|--------|
| `AdminOverview` — Platform-wide KPI dashboard | 🟢 Complete |
| `AdminUsers` — User management & account controls | 🟢 Complete |
| `AdminAPIKeys` — Shared-key quota status & user-key usage analytics | 🟢 Complete |
| `AdminFeedback` — Feedback triage with reply system | 🟢 Complete |
| `AdminAIMonitor` — AI provider health & usage stats | 🟢 Complete |
| `AdminSettings` — System configuration panel | 🟢 Complete |
| `AdminRecoveryRequests` — Account recovery dispatch | 🟢 Complete |
| Admin notification system with read/unread state | 🟢 Complete |

### 7. Automated Notification Scheduler

| Feature | Status |
|---------|--------|
| Background `emailAutomationScheduler` worker | 🟢 Complete |
| Configurable frequency, search time, and max results per user | 🟢 Complete |
| User-level opt-in toggle (`emailAutomationEnabled`) | 🟢 Complete |
| Recurring email job-match automation, available to every user | 🟢 Complete |
| Resume-text-aware email content personalization | 🟢 Complete |
| Usage-aware automation checks to avoid exceeding search limits | 🟢 Complete |

---

## 📁 Project Structure

```
jobOps/
├── .github/
│   └── workflows/
│       └── playwright.yml              # CI pipeline for E2E tests
│
├── backend/
│   ├── config/
│   │   ├── mDB.ts                      # MongoDB connection manager
│   │   ├── passport.ts                 # Local authentication strategy
│   │   ├── passportGithub.ts           # GitHub OAuth strategy
│   │   ├── prisma.ts                   # Prisma client singleton
│   │   └── aiProviderConfig.ts         # Default shared key & provider configuration
│   │
│   ├── controller/
│   │   ├── authController.ts           # Sign-up, login, OTP, OAuth, password reset
│   │   ├── aiController.ts             # Resume parsing & AI analysis engine
│   │   ├── aiChatController.ts         # Chatbot conversation handler
│   │   ├── adminController.ts          # Admin CRUD & analytics endpoints
│   │   ├── apiKeyController.ts         # Add/remove/validate user AI API keys
│   │   └── emailAutomationController.ts# Email workflow configuration
│   │
│   ├── middleware/
│   │   ├── authMiddleware.ts           # JWT cookie verification guard
│   │   ├── adminMiddleware.ts          # Admin role enforcement
│   │   ├── apiKeyLimitMiddleware.ts    # Shared-key quota check & user-key fallback
│   │   ├── uploadMiddleware.ts         # Multer file upload handler
│   │   └── nocache.ts                  # bfcache prevention headers
│   │
│   ├── models/                         # Mongoose schemas (MongoDB)
│   │   ├── AIResult.ts
│   │   ├── Analytics.ts
│   │   ├── ChatQA.ts
│   │   ├── Log.ts
│   │   ├── Notification.ts
│   │   ├── ResumeModel.ts
│   │   ├── SavedJob.ts
│   │   └── User.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma               # 12 relational models (MySQL)
│   │   ├── prisma.config.ts
│   │   └── migrations/                 # 8 versioned migration sets
│   │
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── aiRoutes.ts
│   │   ├── chatRoutes.ts
│   │   ├── adminRoutes.ts
│   │   ├── apiKeyRoutes.ts
│   │   ├── feedbackRoutes.ts
│   │   ├── emailAutomationRoutes.ts
│   │   ├── accountDeletionRoutes.ts
│   │   ├── userRoutes.ts
│   │   └── logoutRoute.ts
│   │
│   ├── scheduler/
│   │   └── emailAutomationScheduler.ts # Background email worker
│   │
│   ├── scripts/
│   │   ├── seedChatQA.ts               # AI chatbot knowledge base seeder
│   │   ├── populateChatAnswers.ts      # Bulk QA population script
│   │   └── makeAdmin.ts               # Admin role assignment utility
│   │
│   ├── services/
│   │   ├── apiKeyService.ts            # Key validation, encryption, fallback logic
│   │   ├── accountDeletionService.ts   # Soft delete & permanent purge
│   │   └── userService.ts             # User lookup utilities
│   │
│   ├── tests/
│   │   ├── unit/                       # Jest unit tests
│   │   │   ├── authPasswordChange.test.ts
│   │   │   ├── authPasswordReset.test.ts
│   │   │   ├── emailAutomationController.test.ts
│   │   │   ├── saveJob.test.ts
│   │   │   └── apiKeyService.test.ts
│   │   ├── integration/               # Integration test suite
│   │   └── api/                       # API endpoint tests
│   │
│   ├── types/                         # TypeScript declarations
│   ├── utils/                         # Shared utilities
│   ├── server.ts                      # Application entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── DashboardLayout.tsx     # User dashboard shell
│   │   │   │   └── AdminLayout.tsx         # Admin panel shell
│   │   │   │
│   │   │   ├── ui/
│   │   │   │   ├── AIChatbot.tsx           # Floating chat widget
│   │   │   │   ├── AdminCharts.tsx         # Data visualization components
│   │   │   │   ├── Button.tsx             # Reusable button primitive
│   │   │   │   └── index.tsx              # UI component barrel export
│   │   │   │
│   │   │   ├── AddKeyModal.tsx             # Prompts for a user API key when the shared key is exhausted
│   │   │   ├── SearchUsageVisualizer.tsx   # Quota progress display
│   │   │   ├── FeedbackForm.tsx           # User feedback submission
│   │   │   ├── SetPasswordModal.tsx       # OAuth users password setup
│   │   │   ├── DeleteAccountSection.tsx   # Account deletion flow
│   │   │   ├── ApiKeySettings.tsx         # Add/remove/view saved AI API keys
│   │   │   └── UsageBanner.tsx            # Usage limit warning banner
│   │   │
│   │   ├── componenets/                   # Auth-flow components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── VerifyOTP.tsx
│   │   │   └── Nav.tsx
│   │   │
│   │   ├── contexts/
│   │   │   └── ApiKeyContext.tsx           # Global API key & usage state
│   │   │
│   │   ├── hooks/
│   │   │   ├── useBfcacheHandler.ts       # Back-button security hook
│   │   │   ├── useKeyLimitPrompt.ts       # Add-key modal trigger logic
│   │   │   └── useAdminData.ts            # Admin dashboard data fetcher
│   │   │
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.tsx          # User home dashboard
│   │   │   │   ├── ResumePage.tsx         # Resume upload & AI analysis
│   │   │   │   ├── JobsPage.tsx           # Job search interface
│   │   │   │   ├── JobCart.tsx            # Saved job cart manager
│   │   │   │   ├── SavedJobsPage.tsx      # Persistent saved jobs
│   │   │   │   ├── AnalyticsPage.tsx      # User analytics dashboard
│   │   │   │   ├── ApplicationsPage.tsx   # Application tracking
│   │   │   │   ├── SettingsPage.tsx       # User preferences, config & API key management
│   │   │   │   ├── FeedbackPage.tsx       # Feedback center
│   │   │   │   └── HelpCenterPage.tsx     # Support & documentation
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── AdminOverview.tsx       # System-wide KPI dashboard
│   │   │   │   ├── AdminUsers.tsx         # User management console
│   │   │   │   ├── AdminAPIKeys.tsx       # Shared-key & user-key usage analytics
│   │   │   │   ├── AdminFeedback.tsx      # Feedback management
│   │   │   │   ├── AdminAIMonitor.tsx     # AI service health monitor
│   │   │   │   ├── AdminAnalytics.tsx     # Platform analytics
│   │   │   │   └── AdminSettings.tsx      # System settings panel
│   │   │   │
│   │   │   ├── HomePage.tsx
│   │   │   ├── PrivacyPolicy.tsx
│   │   │   ├── TermsOfService.tsx
│   │   │   ├── OAuthCallback.tsx
│   │   │   ├── RecoverAccountPage.tsx
│   │   │   └── LogoutPage.tsx
│   │   │
│   │   ├── data/                         # Mock & seed data
│   │   ├── types/                        # Frontend type definitions
│   │   ├── utils/                        # Client utilities & axios instance
│   │   ├── App.tsx                       # Root component & router
│   │   ├── App.css
│   │   ├── index.css                     # Global styles
│   │   └── main.tsx                      # Vite entry point
│   │
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config / postcss
│   ├── package.json
│   └── tsconfig.json
│
├── tests/                               # Playwright E2E specs
│   ├── example1.spec.ts
│   ├── sunbeciptionE2E.spec.ts
│   └── fixture/
│
├── playwright.config.ts                 # Playwright test configuration
├── package.json                         # Root workspace & scripts
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| **Node.js** | ≥ 18.x LTS |
| **npm** | ≥ 9.x |
| **MySQL** | ≥ 8.0 |
| **MongoDB** | ≥ 6.0 |

### 1. Clone the Repository

```bash
git clone https://github.com/bharathi07-art/JobOps.git
cd JobOps
```

### 2. Install Dependencies

```bash
# Root (Playwright)
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure Environment Variables

Create `backend/.env` from the template below (see [Environment Variables](#-environment-variables)):

```bash
cp backend/.env.example backend/.env
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 4. Set Up the Database

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed the AI chatbot knowledge base
npm run seed-chat

# (Optional) Populate bulk chat answers
npm run populate-chat-answers
```

### 5. Start the Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm start

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

> **Access the app:** Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Environment Variables

### `backend/.env`

```env
# ─── Server ───────────────────────────────────
PORT=5000

# ─── Database (MySQL via Prisma) ──────────────
DATABASE_URL="mysql://user:password@localhost:3306/jobops"

# ─── Database (MongoDB) ──────────────────────
MONGO_URI="mongodb://localhost:27017/jobops"

# ─── Authentication ──────────────────────────
JWT_SECRET="your-jwt-secret-key"
SESSION_SECRET="your-session-secret"

# ─── GitHub OAuth ─────────────────────────────
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GITHUB_CALLBACK_URL="http://localhost:5000/api/auth/github/callback"

# ─── Email (Nodemailer SMTP) ─────────────────
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# ─── AI Provider ─────────────────────────────
# Default shared key used for every user until its quota is exhausted.
# Users can then add their own key via Settings to keep searching —
# no payment or plan upgrade required.
GEMINI_API_KEY="your-default-shared-gemini-api-key"

# ─── API Key Encryption ──────────────────────
# Used to encrypt user-submitted API keys at rest.
API_KEY_ENCRYPTION_SECRET="your-encryption-secret"
```

### `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🧪 Testing Suite

JobOps employs a multi-layer testing strategy spanning E2E browser automation, unit tests, and API integration tests.

### Playwright — End-to-End Testing

Playwright runs full lifecycle tests across **Chromium**, **Firefox**, and **WebKit**.

```bash
# Run all E2E tests headlessly
npx playwright test

# Launch the interactive Playwright UI
npx playwright test --ui

# Run tests for a specific browser
npx playwright test --project=chromium

# View the HTML test report
npx playwright show-report
```

**CI Integration:** Playwright tests run automatically on every push/PR to `main` via [GitHub Actions](/.github/workflows/playwright.yml).

### Jest — Unit & Integration Testing

```bash
cd backend

# Run all unit tests
npm test

# Run tests in watch mode
npx jest --watch

# Run with coverage report
npx jest --coverage

# Run a specific test file
npx jest tests/unit/apiKeyService.test.ts
```

**Available Test Suites:**

| Test File | Coverage Area |
|-----------|--------------|
| `authPasswordChange.test.ts` | Password change flow validation |
| `authPasswordReset.test.ts` | Password reset & email verification |
| `emailAutomationController.test.ts` | Email scheduler logic |
| `saveJob.test.ts` | Job save/unsave operations |
| `apiKeyService.test.ts` | API key validation, encryption & fallback logic |

---

## 🗺 API Route Map

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | Public | User registration with OTP |
| `POST` | `/api/auth/login` | Public | Local login (JWT cookie) |
| `GET`  | `/api/auth/github` | Public | GitHub OAuth initiation |
| `GET`  | `/api/auth/github/callback` | Public | GitHub OAuth callback |
| `GET`  | `/api/user/profile` | 🔒 User | Fetch user profile |
| `POST` | `/api/jobresult/analyze` | 🔒 User | Resume upload & AI analysis |
| `GET`  | `/api/ai/chat` | 🔒 User | AI chatbot query |
| `POST` | `/api/api-keys` | 🔒 User | Add & validate a new AI model API key |
| `GET`  | `/api/api-keys` | 🔒 User | List the user's saved API keys & usage status |
| `DELETE` | `/api/api-keys/:id` | 🔒 User | Remove a saved API key |
| `GET`  | `/api/email-automation/config` | 🔒 User | Get email automation settings |
| `PUT`  | `/api/email-automation/config` | 🔒 User | Update email automation |
| `POST` | `/api/account/delete` | 🔒 User | Schedule account deletion |
| `POST` | `/api/account/recover` | 🔒 User | Request account recovery |
| `GET`  | `/api/admin/overview` | 🔒 Admin | Platform analytics dashboard |
| `GET`  | `/api/admin/users` | 🔒 Admin | User management list |
| `GET`  | `/api/feedback` | 🔒 User | Feedback list |
| `POST` | `/api/feedback` | 🔒 User | Submit feedback |
| `GET`  | `/logout` | 🔒 User | Session termination |

---

## 🗄 Database Schema Highlights

The Prisma schema defines relational models across the MySQL database — `plansubscription` and `subscriptionhistory` have been removed along with the subscription paywall, and a new `apikey` model stores user-submitted AI provider keys:

```
┌──────────────┐     ┌───────────────────┐     ┌──────────────────┐
│    user       │────▶│   profile          │     │  adminsettings   │
│              │     └───────────────────┘     └──────────────────┘
│  id          │
│  name        │────▶┌───────────────────┐     ┌──────────────────────┐
│  email       │     │   resume           │     │  adminnotification   │
│  password    │     └───────────────────┘     └──────────────────────┘
│  isAdmin     │────▶┌───────────────────┐     ┌──────────────────────┐
│  githubID    │     │   savedjob         │     │  accountrecovery     │
│  emailAuto.* │     └───────────────────┘     │  request             │
│  deletion.*  │                               └──────────────────────┘
└──────────────┘────▶┌───────────────────┐
       │             │   otp              │
       │             └───────────────────┘
       │
       ├────────────▶┌───────────────────┐
       │             │  apikey            │
       │             └───────────────────┘
       │
       ├────────────▶┌───────────────────┐
       │             │  usagetracking     │
       │             └───────────────────┘
       │
       ├────────────▶┌───────────────────┐
       │             │  feedback          │
       │             └───────────────────┘
       │
       └────────────▶┌───────────────────┐
                     │  workflow          │
                     └───────────────────┘
```

---

## ⚙️ CI/CD Pipeline

The project includes a GitHub Actions workflow for automated E2E testing:

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
```

**Pipeline stages:**
1. ✅ Checkout repository
2. ✅ Setup Node.js (LTS)
3. ✅ Install dependencies (`npm ci`)
4. ✅ Install Playwright browsers
5. ✅ Execute test suite
6. ✅ Upload HTML report as artifact (30-day retention)

---

## 🛠 Skills & Technologies

- **Docker**: Containerization of both frontend and backend services for consistent development and production environments.
- **Kubernetes**: Orchestration for scaling deployments, managing pods, services, and ingress configurations.
- **GitHub Actions**: CI/CD pipeline automating linting, testing (Jest, Playwright), building Docker images, and deploying to Kubernetes clusters.
- **GitHub Packages / Docker Hub**: Registry for storing built Docker images.
- **Infrastructure as Code**: Helm charts and Kubernetes manifests for declarative deployment.
- **Monitoring & Logging**: Integrated with Prometheus and Grafana for performance metrics, and Loki for log aggregation.
- **Security Scanning**: Trivy scans Docker images for vulnerabilities during CI.
- **Continuous Deployment**: Automated rollout to staging and production environments upon successful pipeline execution.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes with conventional commits (`git commit -m 'feat: add amazing feature'`)
4. **Push** to your branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request against `main`

### Development Guidelines

- Write TypeScript — no `any` escape hatches
- Add unit tests for new controllers and services
- Run `npx playwright test` before submitting PRs
- Follow the existing modular directory structure

---

## 📄 License

This project is licensed under the **ISC License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with precision by [@bharathi07-art](https://github.com/bharathi07-art)**

## 📈 Project Stage

- **Current Stage:** MVP (Minimum Viable Product) – core recruitment automation, AI resume analysis, BYOK API key management, and email automation are functional.
- **Stability:** Backend unit tests and Playwright E2E tests are passing. CI pipeline validates on every push.
- **Next Goals:** Containerize services with Docker, deploy to Kubernetes, add advanced analytics dashboards, and improve AI model integration.


⭐ Star this repository if you found it useful!

</div>