# ✅ Subscription System - Setup Checklist

Complete this checklist to fully integrate the subscription system into JobOps.

## 🗂️ Phase 1: Database Setup (5 minutes)

- [ ] Navigate to `backend/` directory
- [ ] Run: `npx prisma migrate dev --name "add_subscription_system"`
- [ ] Verify migration completed successfully
- [ ] Check that new tables exist in database:
  - [ ] `plansubscription` table created
  - [ ] `subscriptionhistory` table created
  - [ ] `usagetracking` table created
  - [ ] `User` table has new columns

## 🔧 Phase 2: Backend Configuration (10 minutes)

- [ ] Backend routes already configured in `server.ts` ✓
- [ ] Test subscription API endpoints:
  ```bash
  curl http://localhost:5000/api/subscription/plans
  ```
  - [ ] Should return list of plans
  
- [ ] Verify middleware is working:
  - [ ] `subscriptionMiddleware.ts` exists
  - [ ] Import statements are correct

- [ ] Update existing routes (Optional - for enforcing limits):
  - [ ] Add `checkUsageLimit()` to AI search routes
  - [ ] Add `trackUsage()` middleware to tracked routes
  - [ ] Add `requirePlan()` to premium routes

## 🎨 Phase 3: Frontend Setup (10 minutes)

### 3.1 Wrap App with Provider
- [ ] Open `frontend/src/main.tsx` or `frontend/src/App.tsx`
- [ ] Import `SubscriptionProvider`:
  ```typescript
  import { SubscriptionProvider } from './contexts/SubscriptionContext';
  ```
- [ ] Wrap your app:
  ```typescript
  <SubscriptionProvider>
    <YourApp />
  </SubscriptionProvider>
  ```

### 3.2 Add Routes
- [ ] Add to your Router configuration:
  ```typescript
  import PricingPage from './pages/PricingPage';
  import SubscriptionManagement from './pages/SubscriptionManagement';
  import AdminSubscriptionAnalytics from './pages/admin/AdminSubscriptionAnalytics';

  <Route path="/pricing" element={<PricingPage />} />
  <Route path="/dashboard/subscription" element={<SubscriptionManagement />} />
  <Route path="/admin/subscriptions" element={<AdminSubscriptionAnalytics />} />
  ```

### 3.3 Update Navigation
- [ ] Add links in navigation/header:
  ```typescript
  <a href="/pricing">Pricing</a>
  {isAuthenticated && <a href="/dashboard/subscription">Subscription</a>}
  {isAdmin && <a href="/admin/subscriptions">Subscriptions</a>}
  ```

## ✨ Phase 4: Feature Integration (20 minutes)

### 4.1 AI Search Route
- [ ] Locate AI search route in your code
- [ ] Add usage check middleware:
  ```typescript
  import { checkUsageLimit, trackUsage } from '../middleware/subscriptionMiddleware';

  router.post(
    "/search",
    authMiddleware,
    checkUsageLimit('aiSearch'),    // NEW
    trackUsage('aiSearchesUsed'),    // NEW
    aiSearchController
  );
  ```

### 4.2 Save Job Route
- [ ] Locate save job route
- [ ] Add middleware:
  ```typescript
  router.post(
    "/save",
    authMiddleware,
    checkUsageLimit('saveJob'),      // NEW
    trackUsage('savedJobsCount'),    // NEW
    saveJobController
  );
  ```

### 4.3 Resume Upload Route
- [ ] Locate resume upload route
- [ ] Add middleware:
  ```typescript
  router.post(
    "/upload",
    authMiddleware,
    checkUsageLimit('uploadResume'),     // NEW
    trackUsage('resumeUploadsCount'),    // NEW
    uploadController
  );
  ```

### 4.4 Premium Features
- [ ] Locate admin/premium routes
- [ ] Add plan requirement:
  ```typescript
  import { requirePlan } from '../middleware/subscriptionMiddleware';

  router.get(
    "/premium/analytics",
    authMiddleware,
    requirePlan(['ProMonthly', 'ProYearly']),  // NEW
    analyticsController
  );
  ```

## 🧪 Phase 5: Testing (15 minutes)

### 5.1 Public Pages
- [ ] Visit `http://localhost:3000/pricing`
  - [ ] See pricing cards
  - [ ] Toggle monthly/yearly
  - [ ] See FAQ section
  - [ ] See "Best Value" badge on yearly
  
- [ ] Visit `http://localhost:5000/api/subscription/plans`
  - [ ] Returns JSON with all plans
  - [ ] Each plan has features array

### 5.2 Authenticated Pages
- [ ] Create a test user account
- [ ] Visit `/dashboard/subscription`
  - [ ] See current plan (should be "Free")
  - [ ] See usage limits (4 AI searches, 10 jobs, 1 resume)
  - [ ] See upgrade buttons

### 5.3 Usage Limits
- [ ] Test free plan limit:
  - [ ] Make 4 AI searches - should succeed
  - [ ] Make 5th search - should show upgrade modal
  - [ ] Try to save 11th job - should show modal
  - [ ] Try to upload 2nd resume - should show modal

### 5.4 Upgrade Flow
- [ ] Click "Upgrade Now" on pricing page
  - [ ] See upgrade modal
  - [ ] See plan options
  - [ ] See billing cycle toggle
  - [ ] Click plan button
  - [ ] Should submit upgrade request

### 5.5 Admin Panel
- [ ] Sign in as admin user
- [ ] Visit `/admin/subscriptions`
  - [ ] See revenue chart
  - [ ] See subscription breakdown
  - [ ] See key metrics

## 📝 Phase 6: Documentation (5 minutes)

- [ ] Read `README_SUBSCRIPTION.md` - Overview
- [ ] Read `SUBSCRIPTION_INTEGRATION_GUIDE.md` - Integration guide
- [ ] Read `SUBSCRIPTION_EXAMPLES.md` - Code examples

## 🚀 Phase 7: Customization (Optional - 30 minutes)

### 7.1 Adjust Plan Limits
- [ ] Edit `backend/services/subscriptionService.ts`
- [ ] Modify `SUBSCRIPTION_PLANS` object:
  ```typescript
  Free: {
    aiSearches: 4,        // Change this
    savedJobs: 10,        // Change this
    resumeUploads: 1,     // Change this
  }
  ```

### 7.2 Adjust Pricing
- [ ] In same file, modify prices:
  ```typescript
  ProMonthly: {
    monthlyPrice: 9.99,   // Change to your price
  },
  ProYearly: {
    yearlyPrice: 99.99,   // Change to your price
  }
  ```

### 7.3 Customize Plan Features
- [ ] Modify features list in controller:
  ```typescript
  // backend/controller/subscriptionController.ts
  const getFeaturesList = (planName) => {
    // Customize features here
  }
  ```

### 7.4 Adjust Colors (if needed)
- [ ] All components use existing palette
- [ ] Change is not needed - fully integrated

## 🎯 Quick Integration Example

Here's a quick example of integrating into ONE route:

### Before
```typescript
router.post('/api/ai/search', authMiddleware, aiSearchController);
```

### After
```typescript
import { checkUsageLimit, trackUsage } from '../middleware/subscriptionMiddleware';

router.post(
  '/api/ai/search',
  authMiddleware,
  checkUsageLimit('aiSearch'),    // Add this
  trackUsage('aiSearchesUsed'),    // Add this
  aiSearchController
);
```

That's it! The middleware handles everything automatically.

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Pricing page shows blank | Verify `/api/subscription/plans` returns data |
| Upgrade modal not showing | Ensure app wrapped with `SubscriptionProvider` |
| Usage limits not working | Check middleware is applied to route |
| Admin analytics empty | Ensure user is marked as `isAdmin` |
| Database migration failed | Check MySQL is running, permissions are set |
| CORS errors | Verify backend CORS config allows frontend domain |

## 📞 Still Having Issues?

1. Check that all files exist:
   ```
   backend/
   ├── services/subscriptionService.ts ✓
   ├── controller/subscriptionController.ts ✓
   ├── routes/subscriptionRoutes.ts ✓
   ├── middleware/subscriptionMiddleware.ts ✓
   
   frontend/
   ├── pages/PricingPage.tsx ✓
   ├── pages/SubscriptionManagement.tsx ✓
   ├── pages/admin/AdminSubscriptionAnalytics.tsx ✓
   ├── components/UpgradeModal.tsx ✓
   ├── components/PremiumComponents.tsx ✓
   ├── contexts/SubscriptionContext.tsx ✓
   └── hooks/useUpgradePrompt.ts ✓
   ```

2. Check imports are correct in modified files
3. Verify database connection string in `.env`
4. Check Node.js and npm versions are compatible
5. Run `npm install` in both frontend and backend

## ✅ You're Done!

Once you complete all phases, your JobOps platform will have:
- ✅ Complete subscription system
- ✅ Usage limit tracking
- ✅ Upgrade modals
- ✅ Pricing pages
- ✅ Admin analytics
- ✅ User subscription management

Start earning! 🎉

---

**Last Updated:** May 21, 2026
**System Version:** 1.0.0
**Status:** ✅ Production Ready
