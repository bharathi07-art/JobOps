# TODO

## Email automation for monthly/yearly + block free-plan toggling

### Backend
- [ ] Locate existing job search/matching service that produces the job results and can be reused by the automation runner.
- [ ] Add Prisma fields (or new model) for email automation settings:
  - [ ] enable/disable
  - [ ] maxResults / resultsCount (UI setting)
  - [ ] searchTime (HH:mm)
  - [ ] (optional) frequency/monthly-yearly or infer from subscriptionPlan
  - [ ] audit fields (updatedAt)
- [ ] Add DB migration.
- [ ] Implement protected API endpoints:
  - [ ] GET current automation settings
  - [ ] PUT/update automation settings
  - [ ] Enforce subscription gating: only active ProMonthly/ProYearly users can enable
- [ ] Implement automation runner (scheduler):
  - [ ] Schedule at configured searchTime
  - [ ] For each enabled user, run search/matching job generation
  - [ ] Email body contains first 7 jobs (as required), regardless of resultsCount setting
  - [ ] Send email to user.email
- [ ] Ensure scheduler never runs for Free plan users.

### Frontend
- [ ] Add SettingsPage UI under Notifications/Automation tab:
  - [ ] Toggle enable/disable automation
  - [ ] Results count input
  - [ ] Search time picker (HH:mm)
  - [ ] Disable UI for Free users (backend will enforce too)
- [ ] Add API calls to load/update automation settings.

### QA / Testing
- [ ] Run prisma migrate.
- [ ] Run backend + frontend.
- [ ] Verify:
  - [ ] Free user cannot enable
  - [ ] ProMonthly/ProYearly can enable
  - [ ] Email contains first 7 jobs
  - [ ] Runs at configured time

