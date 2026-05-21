# 🚀 Subscription System - Quick Reference

## 🎯 Most Common Tasks

### 1️⃣ Add Usage Limit to a Route

```typescript
import { checkUsageLimit, trackUsage } from '../middleware/subscriptionMiddleware';

router.post('/api/feature',
  authMiddleware,
  checkUsageLimit('aiSearch'),        // User allowed?
  trackUsage('aiSearchesUsed'),        // Track usage
  controller                           // Your controller
);
```

**Available limits:** `'aiSearch'`, `'saveJob'`, `'uploadResume'`, `'askQuestion'`

---

### 2️⃣ Require Premium Plan

```typescript
import { requirePlan } from '../middleware/subscriptionMiddleware';

router.get('/api/premium-feature',
  authMiddleware,
  requirePlan(['ProMonthly', 'ProYearly']),  // Only these plans
  controller
);
```

---

### 3️⃣ Show Upgrade Modal in Component

```typescript
import { useUpgradePrompt } from '../hooks/useUpgradePrompt';
import { UpgradeModal } from '../components/UpgradeModal';

export function MyComponent() {
  const {
    isUpgradeModalOpen,
    upgradeInfo,
    closeUpgradeModal,
    checkAndPromptUpgrade
  } = useUpgradePrompt();

  const handleClick = () => {
    if (!checkAndPromptUpgrade('aiSearch')) {
      return;  // Modal shown, stop here
    }
    // Proceed with action
  };

  return (
    <>
      <button onClick={handleClick}>Action</button>
      
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        reason={upgradeInfo.reason}
        featureName={upgradeInfo.featureName}
      />
    </>
  );
}
```

---

### 4️⃣ Show Premium Badge

```typescript
import { PremiumBadge } from '../components/PremiumComponents';
import { useSubscription } from '../contexts/SubscriptionContext';

export function Header() {
  const { subscription } = useSubscription();

  return (
    <div>
      <span>Username</span>
      <PremiumBadge plan={subscription?.subscriptionPlan} />
    </div>
  );
}
```

---

### 5️⃣ Show Usage Limits

```typescript
import { UsageLimitIndicator } from '../components/PremiumComponents';
import { useSubscription } from '../contexts/SubscriptionContext';

export function Dashboard() {
  const { subscription } = useSubscription();

  return (
    <UsageLimitIndicator
      label="AI Searches"
      used={subscription.aiSearchesUsed}
      limit={subscription.maxAISearches}
    />
  );
}
```

---

### 6️⃣ Check User Subscription Status

```typescript
import { useSubscription } from '../contexts/SubscriptionContext';

export function MyComponent() {
  const { 
    subscription,
    isPremium,
    isYearly,
    daysUntilRenewal,
    canPerformAction
  } = useSubscription();

  if (!isPremium) {
    return <p>Upgrade to access this feature</p>;
  }

  const { allowed, remaining } = canPerformAction('aiSearch');
  
  return <p>Searches left: {remaining}</p>;
}
```

---

### 7️⃣ Get All Available Plans (API)

```
GET /api/subscription/plans
```

Returns:
```json
[
  {
    "id": "Free",
    "name": "Free",
    "monthlyPrice": 0,
    "yearlyPrice": 0,
    "aiSearches": 4,
    "savedJobs": 10,
    "resumeUploads": 1,
    "features": ["4 AI searches/month", "10 saved jobs", ...]
  },
  // ... more plans
]
```

---

### 8️⃣ Get Current User Subscription

```
GET /api/subscription/current
Authorization: Bearer <token>
```

Returns:
```json
{
  "subscriptionPlan": "ProMonthly",
  "subscriptionStatus": "active",
  "subscriptionEndDate": "2026-06-21T...",
  "aiSearchesUsed": 5,
  "maxAISearches": 30,
  "savedJobsCount": 8,
  "maxSavedJobs": 0,  // unlimited
  // ... more fields
}
```

---

### 9️⃣ Upgrade Subscription

```
PUT /api/subscription/upgrade
Authorization: Bearer <token>

Body:
{
  "planName": "ProMonthly",
  "billingCycle": "monthly"
}
```

Response: Updated subscription object

---

### 🔟 Cancel Subscription

```
POST /api/subscription/cancel
Authorization: Bearer <token>
```

Response: Downgraded to Free plan

---

## 📋 Common Patterns

### Pattern: Check Before Action

```typescript
const handleAction = async () => {
  // Check if allowed
  const { allowed } = canPerformAction('aiSearch');
  if (!allowed) {
    showUpgradeModal();
    return;
  }

  // Perform action
  const response = await fetch('/api/ai/search', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  
  // If successful, usage was auto-tracked by middleware
};
```

---

### Pattern: Show Locked Feature

```typescript
import { LockedFeatureIndicator } from '../components/PremiumComponents';

export function FeatureComponent() {
  const { isPremium } = useSubscription();

  if (!isPremium) {
    return (
      <LockedFeatureIndicator
        featureName="Advanced Analytics"
        requiredPlan="Pro"
      />
    );
  }

  return <AdvancedAnalytics />;
}
```

---

### Pattern: Conditional Rendering Based on Plan

```typescript
const { isPremium, isYearly } = useSubscription();

return (
  <>
    {!isPremium && (
      <div>Free plan - Limited features</div>
    )}
    
    {isPremium && !isYearly && (
      <div>Pro Monthly - All features</div>
    )}
    
    {isYearly && (
      <div className="bg-amber-100">
        Pro Yearly - All features + Career Roadmap
      </div>
    )}
  </>
);
```

---

## 📊 Admin API Endpoints

### Get Subscription Analytics

```
GET /api/subscription/admin/analytics
Authorization: Bearer <admin-token>
```

Returns:
```json
{
  "summary": {
    "totalRevenue": 1250.50,
    "activeSubscriptions": 23,
    "freeUsers": 145,
    "totalUsers": 168
  },
  "subscriptionCounts": [
    { "subscriptionPlan": "Free", "_count": 145 },
    { "subscriptionPlan": "ProMonthly", "_count": 15 },
    { "subscriptionPlan": "ProYearly", "_count": 8 }
  ],
  // ... more data
}
```

---

## 🔧 Configuration

### Modify Plan Limits

Edit: `backend/services/subscriptionService.ts`

```typescript
export const SUBSCRIPTION_PLANS = {
  Free: {
    aiSearches: 4,          // Change here
    savedJobs: 10,          // Change here
    resumeUploads: 1,       // Change here
  },
  ProMonthly: {
    monthlyPrice: 9.99,     // Change here
  },
  ProYearly: {
    yearlyPrice: 99.99,     // Change here
  }
};
```

---

### Modify Plan Features

Edit: `backend/controller/subscriptionController.ts`

```typescript
const getFeaturesList = (planName) => {
  const features = {
    Free: ['Feature 1', 'Feature 2'],      // Edit here
    ProMonthly: ['Feature 1', 'Feature 2'], // Edit here
    ProYearly: ['Feature 1', 'Feature 2']  // Edit here
  };
  return features[planName];
};
```

---

## 🚨 Error Responses

### Usage Limit Exceeded

```json
Status: 429
{
  "message": "aiSearch limit reached",
  "remainingUsage": 0,
  "upgrade": true
}
```

### Plan Required

```json
Status: 403
{
  "message": "This feature requires a premium plan",
  "currentPlan": "Free",
  "requiredPlans": ["ProMonthly", "ProYearly"]
}
```

### Unauthorized

```json
Status: 401
{
  "message": "Unauthorized"
}
```

---

## 🧪 Quick Testing

### Test Free Limit
```bash
# Create user → Make 4 AI searches → 5th should fail
curl -X POST http://localhost:5000/api/ai/search \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}'

# Response will be 429 on 5th attempt
```

### Test Admin Analytics
```bash
curl http://localhost:5000/api/subscription/admin/analytics \
  -H "Authorization: Bearer <admin-token>"
```

---

## 📚 Full Documentation

- **Overview**: `README_SUBSCRIPTION.md`
- **Integration**: `SUBSCRIPTION_INTEGRATION_GUIDE.md`
- **Examples**: `SUBSCRIPTION_EXAMPLES.md`
- **Setup**: `SETUP_CHECKLIST.md`

---

## ⚡ Pro Tips

1. **Always wrap app with SubscriptionProvider** or hooks won't work
2. **Middleware is applied at route level** - limits enforced backend
3. **Usage tracking is automatic** - no extra code needed
4. **Context updates automatically** - no manual refresh needed
5. **All limits reset monthly** - except for unlimited plans
6. **Free tier limits reset** - first day of each month
7. **Premium is checked via plan name** - includes both monthly and yearly

---

## 🎯 Most Common Use Cases

| Goal | Code |
|------|------|
| Add limit to route | `checkUsageLimit('aiSearch')` |
| Require premium | `requirePlan(['ProMonthly'])` |
| Show upgrade modal | `useUpgradePrompt()` |
| Check if premium | `const { isPremium } = useSubscription()` |
| Show limits | `<UsageLimitIndicator />` |
| Show badge | `<PremiumBadge />` |
| Get current plan | `subscription.subscriptionPlan` |
| Check remaining | `canPerformAction('aiSearch').remaining` |

---

**Last Updated:** May 21, 2026
**Version:** 1.0.0
✅ All features production-ready
