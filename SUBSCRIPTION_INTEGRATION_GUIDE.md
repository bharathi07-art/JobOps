# Subscription & Premium Access System - Integration Guide

## Overview
This guide explains how to integrate the new subscription system with existing JobOps features.

## Core Components

### 1. Backend Integration

#### Adding Usage Checks to Existing Routes
```typescript
// In any route that needs to check limits
import { checkUsageLimit, trackUsage } from '../middleware/subscriptionMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';

router.post('/api/ai/search', 
  authMiddleware,
  checkUsageLimit('aiSearch'),      // Check if user can perform action
  trackUsage('aiSearchesUsed'),       // Track usage after success
  aiSearchController
);

router.post('/api/jobs/save',
  authMiddleware,
  checkUsageLimit('saveJob'),
  trackUsage('savedJobsCount'),
  saveJobController
);

router.post('/api/resume/upload',
  authMiddleware,
  checkUsageLimit('uploadResume'),
  trackUsage('resumeUploadsCount'),
  uploadResumeController
);
```

#### Premium-Only Routes
```typescript
import { requirePlan } from '../middleware/subscriptionMiddleware';

// Only Pro Monthly and Pro Yearly can access
router.get('/api/premium/analytics',
  authMiddleware,
  requirePlan(['ProMonthly', 'ProYearly']),
  premiumAnalyticsController
);
```

### 2. Frontend Integration

#### Using the Subscription Provider
Wrap your App component with the SubscriptionProvider:

```typescript
// App.tsx
import { SubscriptionProvider } from './contexts/SubscriptionContext';

function App() {
  return (
    <SubscriptionProvider>
      {/* Your app components */}
    </SubscriptionProvider>
  );
}
```

#### Using the Subscription Hook
```typescript
import { useSubscription } from './contexts/SubscriptionContext';

function YourComponent() {
  const { subscription, isPremium, canPerformAction } = useSubscription();

  // Check if user is premium
  if (!isPremium) {
    return <div>Upgrade to access this feature</div>;
  }

  // Check limits for specific action
  const { allowed, remaining } = canPerformAction('aiSearch');
  
  return <div>Searches remaining: {remaining}</div>;
}
```

#### Using the Upgrade Prompt Hook
```typescript
import { useUpgradePrompt } from './hooks/useUpgradePrompt';
import { UpgradeModal } from './components/UpgradeModal';

function FeatureComponent() {
  const {
    isUpgradeModalOpen,
    upgradeInfo,
    closeUpgradeModal,
    checkAndPromptUpgrade,
  } = useUpgradePrompt({
    featureName: 'Advanced Resume Analysis',
  });

  const handleAnalyze = () => {
    // Check limits and show modal if needed
    if (!checkAndPromptUpgrade('aiSearch')) {
      return; // User hit limit
    }

    // Perform action
    analyzeResume();
  };

  return (
    <>
      <button onClick={handleAnalyze}>Analyze Resume</button>
      
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        reason={upgradeInfo.reason as any}
        featureName={upgradeInfo.featureName}
      />
    </>
  );
}
```

#### Using Premium Badges
```typescript
import { PremiumBadge, UsageLimitIndicator } from './components/PremiumComponents';

function Dashboard() {
  const { subscription } = useSubscription();

  return (
    <div>
      {/* Show badge if user is premium */}
      <PremiumBadge plan={subscription?.subscriptionPlan || 'Free'} />

      {/* Show usage limits */}
      <UsageLimitIndicator
        label="AI Searches"
        used={subscription?.aiSearchesUsed || 0}
        limit={subscription?.maxAISearches || 4}
      />
    </div>
  );
}
```

## API Endpoints

### Subscription Management

```
GET    /api/subscription/plans                    - Get all available plans
GET    /api/subscription/current                  - Get current user subscription (auth required)
PUT    /api/subscription/upgrade                  - Upgrade/change plan (auth required)
POST   /api/subscription/cancel                   - Cancel subscription (auth required)
GET    /api/subscription/history                  - Get subscription history (auth required)
GET    /api/subscription/analytics                - Get usage analytics (auth required)
```

### Admin Endpoints

```
GET    /api/subscription/admin/analytics          - Get admin subscription analytics (admin only)
POST   /api/subscription/admin/record-payment     - Record manual payment (admin only)
```

## Feature Implementations

### 1. AI Search with Usage Limits

**Current state:** Free users get 4 searches/month, Pro users get unlimited (1/day limit handled separately)

**Implementation:**
```typescript
// Backend: aiRoutes.ts
router.post('/search',
  authMiddleware,
  checkUsageLimit('aiSearch'),
  trackUsage('aiSearchesUsed'),
  aiController.performSearch
);

// Frontend: Use the hook
const { checkAndPromptUpgrade } = useUpgradePrompt();

function SearchJobs() {
  const handleSearch = () => {
    if (!checkAndPromptUpgrade('aiSearch')) {
      return;
    }
    
    // Perform search...
  };
}
```

### 2. Saved Jobs Limit

**Current state:** Free plan: 10 jobs, Pro: unlimited

**Implementation:**
```typescript
// Backend
router.post('/save',
  authMiddleware,
  checkUsageLimit('saveJob'),
  trackUsage('savedJobsCount'),
  saveJobController
);

// Frontend
<UsageLimitIndicator
  label="Saved Jobs"
  used={subscription.savedJobsCount}
  limit={subscription.maxSavedJobs}
/>
```

### 3. Resume Upload Limit

**Current state:** Free plan: 1 upload, Pro: unlimited

**Implementation:**
```typescript
// Backend
router.post('/upload',
  authMiddleware,
  checkUsageLimit('uploadResume'),
  trackUsage('resumeUploadsCount'),
  uploadController
);
```

### 4. Premium Analytics Dashboard

**Implementation:**
```typescript
// Backend
router.get('/analytics',
  authMiddleware,
  requirePlan(['ProMonthly', 'ProYearly']),
  analyticsController
);

// Frontend
import AdminSubscriptionAnalytics from './pages/admin/AdminSubscriptionAnalytics';
```

### 5. Email Notifications (Pro Feature)

**Implementation:**
```typescript
// Backend: Check subscription before sending
const user = await getUserSubscription(userId);

if (user.subscriptionPlan.includes('Pro') && user.emailNotifications) {
  // Send email notification
}
```

## New Pages to Add to Routes

1. **Pricing Page**
   ```
   Route: /pricing
   Component: PricingPage
   Access: Public
   ```

2. **Subscription Management**
   ```
   Route: /dashboard/subscription
   Component: SubscriptionManagement
   Access: Authenticated users only
   ```

3. **Admin Subscription Analytics**
   ```
   Route: /admin/subscriptions
   Component: AdminSubscriptionAnalytics
   Access: Admin only
   ```

## Database Migrations

Run the following command to apply the schema changes:

```bash
cd backend
npx prisma migrate dev --name "add_subscription_system"
```

This will:
1. Update User model with subscription fields
2. Create PlanSubscription model
3. Create SubscriptionHistory model
4. Create UsageTracking model

## Testing the System

### Test Free Plan Limits
1. Create new user account
2. Try to exceed limits (5th AI search, 11th saved job, 2nd resume)
3. Should see upgrade modal

### Test Premium Plan
1. Upgrade to Pro Monthly
2. Verify limits are increased
3. Check usage analytics

### Test Admin Dashboard
1. Go to `/admin/subscriptions`
2. Verify analytics data displays correctly
3. Check revenue calculations

## Configuration

### Modify Plan Limits

Edit `backend/services/subscriptionService.ts`:

```typescript
export const SUBSCRIPTION_PLANS = {
  Free: {
    // Modify these values
    aiSearches: 4,
    savedJobs: 10,
    resumeUploads: 1,
    // ...
  },
  // ...
};
```

### Customize Pricing

Edit the same file and update `monthlyPrice` and `yearlyPrice`:

```typescript
ProMonthly: {
  monthlyPrice: 9.99,    // Change this
  yearlyPrice: 0,
},
ProYearly: {
  monthlyPrice: 0,
  yearlyPrice: 99.99,    // Change this
},
```

## Features Ready for Integration

- ✅ Subscription Plans (Free, Pro Monthly, Pro Yearly)
- ✅ Usage Tracking
- ✅ Upgrade Modals
- ✅ Premium Badges
- ✅ Usage Indicators
- ✅ Admin Analytics
- ✅ Billing History
- ✅ Plan Management
- ✅ Subscription Context (Global state)
- ✅ Middleware for route protection

## Future Enhancements

1. **Payment Gateway Integration**
   - Stripe
   - Razorpay
   - PayPal

2. **Email Notifications**
   - Daily job search notifications (Pro feature)
   - Renewal reminders
   - Subscription alerts

3. **Advanced Analytics**
   - Career roadmap AI
   - Skill gap analysis
   - Personalized recommendations

4. **Team Features**
   - Shared plans
   - Team analytics
   - Team administration

## Troubleshooting

### Issue: Usage limits not resetting
**Solution:** Check `lastResetDate` in database. Ensure the reset logic runs monthly.

### Issue: Users can't upgrade
**Solution:** Verify payment provider integration (currently frontend-ready, backend-ready)

### Issue: Admin analytics not showing
**Solution:** Ensure user is marked as `isAdmin` in database and check subscription history is being recorded.

## Support

For integration questions or issues, refer to:
- Component examples in `/frontend/src/components`
- Hook examples in `/frontend/src/hooks`
- Backend service examples in `/backend/services/subscriptionService.ts`
