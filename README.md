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

**A full-stack MERN application delivering end-to-end recruitment automation — from secure multi-provider authentication and AI-driven resume analysis to tiered subscription management and automated email workflows.**

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

**JobOps** is a production-grade recruitment and career management platform engineered with a modern MERN architecture. It unifies secure authentication, intelligent resume parsing, job tracking, AI-assisted career guidance, and a fully tiered subscription paywall — all within a cleanly separated monorepo.

The platform serves two distinct personas through role-based dashboards:

| Persona | Capabilities |
|---------|-------------|
| **User** | Resume upload & AI analysis, job search & save, AI chatbot, subscription management, email automation, account lifecycle management |
| **Admin** | Platform analytics, user management, subscription oversight, feedback triage, AI monitoring, revenue tracking, system settings |

## ✨ Recent Updates

The project has recently been hardened around the core job-search experience with production-ready reliability improvements:

- Added robust resume upload validation for PDF and DOCX files, including size limits and empty/corrupt-file handling.
- Introduced structured resume-text extraction and safer AI-response parsing so malformed or incomplete model output is handled gracefully.
- Enforced subscription limits server-side for Free and Paid users, including Free weekly/monthly caps and Paid daily caps.
- Added clearer upgrade/error responses so the frontend can surface limit-exceeded and AI-service issues directly to users.
- Expanded the email automation workflow for paid users with recurring job-match emails tied to the user’s saved resume context.
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
│  │  Auth UI │  │ Dashboard │  │ Admin     │  │ Subscription Mgmt  │    │
│  │  Login   │  │ Resume    │  │ Overview  │  │ PricingPage        │    │
│  │  Register│  │ JobCart   │  │ Users     │  │ UpgradeModal       │    │
│  │  OTP     │  │ Analytics │  │ Revenue   │  │ PayPal Integration │    │
│  │  OAuth   │  │ Settings  │  │ Feedback  │  │ UsageBanner        │    │
│  └──────────┘  └───────────┘  └───────────┘  └────────────────────┘    │
│                                                                         │
│  Context API: SubscriptionContext ──── Hooks: useBfcacheHandler,       │
│                                         useUpgradePrompt, useAdminData │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │  Axios (HTTP + Cookies)
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS 5 SERVER  (Node.js + TypeScript)             │
│                                                                          │
│  ┌──────────────── Middleware Layer ────────────────────────────────┐    │
│  │  authMiddleware ─ adminMiddleware ─ proPlanMiddleware            │    │
│  │  freePlanMiddleware ─ subscriptionMiddleware ─ uploadMiddleware  │    │
│  │  nocache (bfcache security)                                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌──── Routes ─────┐    ┌───── Controllers ──────┐    ┌── Services ──┐  │
│  │ /api/auth       │───▶│ authController          │    │ subscription │  │
│  │ /api/user       │    │ aiController            │    │ Service      │  │
│  │ /api/jobresult  │───▶│ aiChatController        │    │ accountDel.  │  │
│  │ /api/ai         │    │ adminController         │    │ Service      │  │
│  │ /api/admin      │───▶│ paymentController       │    │ paypalClient │  │
│  │ /api/subscription│   │ subscriptionController  │    │ userService  │  │
│  │ /api/payment    │───▶│ emailAutomation         │    └──────────────┘  │
│  │ /api/feedback   │    │   Controller            │                      │
│  │ /api/email-auto │    └─────────────────────────┘    ┌── Scheduler ──┐ │
│  │ /api/account    │                                   │ emailAutomation│ │
│  │ /logout         │                                   │   Scheduler    │ │
│  └─────────────────┘                                   └────────────────┘ │
│                                                                          │
│  ┌─── Config ──────────────────────────┐    ┌─── Utils ───────────────┐  │
│  │ passport.ts (Local Strategy)        │    │ generateOTP.ts          │  │
│  │ passportGithub.ts (GitHub OAuth)    │    │ sendEmail.ts            │  │
│  │ mDB.ts (MongoDB Connection)        │    │ dateUtils.ts            │  │
│  │ prisma.ts (Prisma Client)          │    └─────────────────────────┘  │
│  │ subscriptionConfig.ts              │                                  │
│  └─────────────────────────────────────┘                                 │
└──────────┬────────────────────────┬──────────────────────────────────────┘
           │                        │
           ▼                        ▼
┌─────────────────────┐  ┌─────────────────────────────────────────────┐
│   MongoDB            │  │   MySQL (via Prisma ORM)                    │
│   (Mongoose)         │  │                                             │
│                      │  │   Users ─ Profiles ─ Resumes ─ SavedJobs   │
│   • AI Results       │  │   OTPs ─ Feedback ─ Subscriptions          │
│   • Chat QA Seeds    │  │   PlanSubscriptions ─ UsageTracking         │
│   • Analytics Logs   │  │   Workflows ─ AdminSettings                │
│   • Notifications    │  │   AccountRecoveryRequests                   │
│   • Saved Jobs Cache │  │   SubscriptionHistory ─ AdminNotifications  │
│   • Resume Metadata  │  │                                             │
└─────────────────────┘  └─────────────────────────────────────────────┘
           │                        │
           └───────────┬────────────┘
                       ▼
          ┌──────────────────────────┐
          │   Third-Party Services   │
          │                          │
          │  • PayPal Checkout SDK   │
          │  • Nodemailer (SMTP)     │
          │  • GitHub OAuth Provider │
          │  • Gemini AI (Analytics) │
          └──────────────────────────┘
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
| **Context API** | — | Global state management (`SubscriptionContext`) |

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
| **MySQL** | Primary relational store (users, subscriptions, feedback, admin settings) |
| **Prisma ORM** | Type-safe database client with migrations & schema introspection |
| **MongoDB** | Document store (AI results, chat seeds, analytics logs, notifications) |
| **Mongoose** | MongoDB ODM for schema validation |

### Third-Party Integrations

| Service | Purpose |
|---------|---------|
| **PayPal Checkout SDK** | Premium subscription payment processing |
| **GitHub OAuth** | Social sign-in via `passport-github2` |
| **Gemini AI** | Configurable AI provider for resume analytics |
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

### 5. Premium Subscription Gate

| Feature | Status |
|---------|--------|
| Tiered plans: Free → Monthly → Yearly | 🟢 Complete |
| Free-tier limits: 2 searches/week and 8 searches/month, whichever is hit first blocks further use | 🟢 Complete |
| Paid-tier limits: 2 searches/day with daily reset logic | 🟢 Complete |
| Server-side enforcement for usage limits, not just UI gating | 🟢 Complete |
| Clear upgrade/limit-exceeded responses for the frontend to display | 🟢 Complete |
| `proPlanMiddleware` route protection | 🟢 Complete |
| `UpgradeModal` interception for free-tier users | 🟢 Complete |
| PayPal client-side + server-side payment flow | 🟢 Complete |
| `SubscriptionContext` for global plan state | 🟢 Complete |
| Subscription history with transaction audit trail | 🟢 Complete |
| `SearchUsageVisualizer` for real-time quota display | 🟢 Complete |

### 6. Robust Administrative Suite

| Feature | Status |
|---------|--------|
| `AdminOverview` — Platform-wide KPI dashboard | 🟢 Complete |
| `AdminUsers` — User management & account controls | 🟢 Complete |
| `AdminSubscriptions` — Plan distribution analytics | 🟢 Complete |
| `AdminRevenue` — Revenue tracking & financial metrics | 🟢 Complete |
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
| Recurring paid-user email job-match automation | 🟢 Complete |
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
│   │   └── subscriptionConfig.ts       # Plan tier configuration
│   │
│   ├── controller/
│   │   ├── authController.ts           # Sign-up, login, OTP, OAuth, password reset
│   │   ├── aiController.ts             # Resume parsing & AI analysis engine
│   │   ├── aiChatController.ts         # Chatbot conversation handler
│   │   ├── adminController.ts          # Admin CRUD & analytics endpoints
│   │   ├── paymentController.ts        # PayPal order creation & capture
│   │   ├── subscriptionController.ts   # Plan upgrades, downgrades, cancellation
│   │   └── emailAutomationController.ts# Email workflow configuration
│   │
│   ├── middleware/
│   │   ├── authMiddleware.ts           # JWT cookie verification guard
│   │   ├── adminMiddleware.ts          # Admin role enforcement
│   │   ├── proPlanMiddleware.ts        # Premium tier route gate
│   │   ├── freePlanMiddleware.ts       # Free tier limiter
│   │   ├── subscriptionMiddleware.ts   # Dynamic plan-aware access control
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
│   │   ├── subscriptionRoutes.ts
│   │   ├── PaymentRoutes.ts
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
│   │   ├── subscriptionService.ts      # Subscription business logic
│   │   ├── accountDeletionService.ts   # Soft delete & permanent purge
│   │   ├── paypalClient.ts             # PayPal SDK client factory
│   │   └── userService.ts             # User lookup utilities
│   │
│   ├── tests/
│   │   ├── unit/                       # Jest unit tests
│   │   │   ├── authPasswordChange.test.ts
│   │   │   ├── authPasswordReset.test.ts
│   │   │   ├── emailAutomationController.test.ts
│   │   │   ├── saveJob.test.ts
│   │   │   └── subscriptionService.test.ts
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
│   │   │   ├── UpgradeModal.tsx           # Premium paywall interceptor
│   │   │   ├── SearchUsageVisualizer.tsx   # Quota progress display
│   │   │   ├── FeedbackForm.tsx           # User feedback submission
│   │   │   ├── SetPasswordModal.tsx       # OAuth users password setup
│   │   │   ├── DeleteAccountSection.tsx   # Account deletion flow
│   │   │   ├── PremiumComponents.tsx      # Pro-tier gated UI elements
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
│   │   │   └── SubscriptionContext.tsx     # Global subscription state
│   │   │
│   │   ├── hooks/
│   │   │   ├── useBfcacheHandler.ts       # Back-button security hook
│   │   │   ├── useUpgradePrompt.ts        # Upgrade modal trigger logic
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
│   │   │   │   ├── SettingsPage.tsx       # User preferences & config
│   │   │   │   ├── InvoicePage.tsx        # Billing & invoice history
│   │   │   │   ├── FeedbackPage.tsx       # Feedback center
│   │   │   │   └── HelpCenterPage.tsx     # Support & documentation
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── AdminOverview.tsx       # System-wide KPI dashboard
│   │   │   │   ├── AdminUsers.tsx         # User management console
│   │   │   │   ├── AdminSubscriptions.tsx # Subscription analytics
│   │   │   │   ├── AdminRevenue.tsx       # Revenue metrics
│   │   │   │   ├── AdminFeedback.tsx      # Feedback management
│   │   │   │   ├── AdminAIMonitor.tsx     # AI service health monitor
│   │   │   │   ├── AdminAnalytics.tsx     # Platform analytics
│   │   │   │   ├── AdminSettings.tsx      # System settings panel
│   │   │   │   └── AdminSubscriptionAnalytics.tsx
│   │   │   │
│   │   │   ├── HomePage.tsx
│   │   │   ├── PricingPage.tsx
│   │   │   ├── SubscriptionManagement.tsx
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

# ─── PayPal ───────────────────────────────────
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
PAYPAL_MODE="sandbox"

# ─── Email (Nodemailer SMTP) ─────────────────
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# ─── AI Provider ─────────────────────────────
GEMINI_API_KEY="your-gemini-api-key"
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
npx jest tests/unit/subscriptionService.test.ts
```

**Available Test Suites:**

| Test File | Coverage Area |
|-----------|--------------|
| `authPasswordChange.test.ts` | Password change flow validation |
| `authPasswordReset.test.ts` | Password reset & email verification |
| `emailAutomationController.test.ts` | Email scheduler logic |
| `saveJob.test.ts` | Job save/unsave operations |
| `subscriptionService.test.ts` | Subscription tier transitions |

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
| `POST` | `/api/subscription/upgrade` | 🔒 User | Plan upgrade |
| `POST` | `/api/payment/create-order` | 🔒 User | PayPal order creation |
| `POST` | `/api/payment/capture-order` | 🔒 User | PayPal payment capture |
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

The Prisma schema defines **12 relational models** across the MySQL database:

```
┌──────────────┐     ┌───────────────────┐     ┌──────────────────┐
│    user       │────▶│   profile          │     │  adminsettings   │
│              │     └───────────────────┘     └──────────────────┘
│  id          │
│  name        │────▶┌───────────────────┐     ┌──────────────────────┐
│  email       │     │   resume           │     │  adminnotification   │
│  password    │     └───────────────────┘     └──────────────────────┘
│  plan        │
│  isAdmin     │────▶┌───────────────────┐     ┌──────────────────────┐
│  githubID    │     │   savedjob         │     │  accountrecovery     │
│  subscr.*    │     └───────────────────┘     │  request             │
│  emailAuto.* │                               └──────────────────────┘
│  deletion.*  │────▶┌───────────────────┐
└──────────────┘     │   otp              │
       │             └───────────────────┘
       │
       ├────────────▶┌───────────────────────┐
       │             │  subscriptionhistory   │
       │             └───────────────────────┘
       │
       ├────────────▶┌───────────────────┐
       │             │  usagetracking     │
       │             └───────────────────┘
       │
       ├────────────▶┌───────────────────┐
       │             │  feedback          │
       │             └───────────────────┘
       │
       ├────────────▶┌───────────────────┐
       │             │  workflow          │
       │             └───────────────────┘
       │
       └──────────┐
                  ▼
       ┌─────────────────────┐
       │  plansubscription    │  (Many-to-Many)
       └─────────────────────┘
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

- **Current Stage:** MVP (Minimum Viable Product) – core recruitment automation, AI resume analysis, subscription management, and email automation are functional.
- **Stability:** Backend unit tests and Playwright E2E tests are passing. CI pipeline validates on every push.
- **Next Goals:** Containerize services with Docker, deploy to Kubernetes, add advanced analytics dashboards, and improve AI model integration.


⭐ Star this repository if you found it useful!

</div>
