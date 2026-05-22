# TODO - Subscription Card & Plan UI Improvements

## Step 1 — Backend: structured subscription response
- [ ] Update `backend/services/subscriptionService.ts` to compute plan-specific limits and locked/unlocked feature lists.
- [ ] Update `backend/controller/subscriptionController.ts` `getCurrentSubscription` to return API shape required by UI (plan, searchesUsed/Remaining, canUsePremium, premiumLockedFeatures, subscriptionEndDate, billingCycle, renewalInDays, etc.).

## Step 2 — Backend: ensure premium access validation
- [ ] Verify/adjust middleware usage so premium data cannot be accessed when not active.
- [ ] Confirm usage counters are computed server-side.

## Step 3 — Frontend: dynamic pricing cards
- [ ] Update `frontend/src/pages/PricingPage.tsx` to render Free/Monthly/Yearly cards per requirement.
- [ ] Implement locked feature rows with lock icons + tooltips + “Upgrade to Unlock” CTA (via existing Button + existing modal).
- [ ] Add usage counter UI text (e.g. `2/4 AI searches used`, `Monthly reset in X days`) based on API response.

## Step 4 — Frontend: subscription management dashboard
- [ ] Update `frontend/src/pages/SubscriptionManagement.tsx` so Free users see empty analytics + upgrade prompts; Monthly full analytics; Yearly enhanced analytics widgets.
- [ ] Add/align subscription management section (current plan, upgrade/downgrade, cancel, billing history, renewal date, payment status).

## Step 5 — Frontend: modal + context
- [ ] Ensure `frontend/src/components/UpgradeModal.tsx` explains feature benefits + Monthly vs Yearly comparison.
- [ ] Extend `frontend/src/contexts/SubscriptionContext.tsx` to use new backend structured response (plan id, renewal in days, remaining usage, etc.).

## Step 6 — QA
- [ ] Backend: typecheck + run server smoke test.
- [ ] Frontend: build/typecheck.
- [ ] UX checks for Free / Monthly / Yearly.

