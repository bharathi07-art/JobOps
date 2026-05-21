// EXAMPLE IMPLEMENTATIONS - How to integrate subscription checks into existing routes

// ============================================================================
// EXAMPLE 1: AI Search Route with Usage Limits
// ============================================================================
// File: backend/routes/aiRoutes.ts

import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { 
  checkUsageLimit, 
  trackUsage 
} from "../middleware/subscriptionMiddleware";
import { performAISearch } from "../controller/aiController";

const router = express.Router();

// Before: Simple route without subscription checks
// router.post("/search", authMiddleware, performAISearch);

// After: With subscription checks
router.post(
  "/search",
  authMiddleware,
  checkUsageLimit('aiSearch'),    // Check if user can perform action
  trackUsage('aiSearchesUsed'),    // Track usage automatically
  performAISearch                  // Your existing controller
);

export default router;

// ============================================================================
// EXAMPLE 2: Save Job with Usage Limits
// ============================================================================
// File: backend/routes/userRoutes.ts (or create jobRoutes.ts)

// Before
// router.post("/save-job", authMiddleware, saveJobController);

// After
import { checkUsageLimit, trackUsage } from "../middleware/subscriptionMiddleware";

router.post(
  "/save-job",
  authMiddleware,
  checkUsageLimit('saveJob'),      // Enforce 10 job limit for free users
  trackUsage('savedJobsCount'),     // Track saved jobs
  saveJobController
);

// ============================================================================
// EXAMPLE 3: Premium-Only Feature
// ============================================================================
// File: backend/routes/adminRoutes.ts

import { requirePlan } from "../middleware/subscriptionMiddleware";

// Only Pro users can access advanced analytics
router.get(
  "/premium/analytics",
  authMiddleware,
  requirePlan(['ProMonthly', 'ProYearly']),  // Only these plans
  premiumAnalyticsController
);

// ============================================================================
// EXAMPLE 4: Frontend - React Component with Upgrade Modal
// ============================================================================
// File: frontend/src/pages/SearchJobs.tsx

import React, { useState } from 'react';
import { useUpgradePrompt } from '../hooks/useUpgradePrompt';
import { UpgradeModal } from '../components/UpgradeModal';
import { useSubscription } from '../contexts/SubscriptionContext';

export function SearchJobs() {
  const {
    isUpgradeModalOpen,
    upgradeInfo,
    closeUpgradeModal,
    checkAndPromptUpgrade,
    isPremium,
  } = useUpgradePrompt({
    featureName: 'AI Job Search',
  });

  const { subscription } = useSubscription();
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    // Check usage limits before searching
    if (!checkAndPromptUpgrade('aiSearch')) {
      return; // User hit limit or modal shown
    }

    setSearching(true);
    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ /* search params */ })
      });

      if (response.ok) {
        // Success - usage was tracked automatically
        console.log('Search completed');
      } else if (response.status === 429) {
        // Hit limit
        const data = await response.json();
        checkAndPromptUpgrade('aiSearch');
      }
    } finally {
      setSearching(false);
    }
  };

  return (
    <>
      <div>
        {/* Show usage info if premium */}
        {isPremium && (
          <div>
            <p>Searches used: {subscription?.aiSearchesUsed || 0}</p>
          </div>
        )}

        <button 
          onClick={handleSearch}
          disabled={searching}
        >
          {searching ? 'Searching...' : 'Search Jobs'}
        </button>
      </div>

      {/* Upgrade modal shown automatically when limit is hit */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        reason={upgradeInfo.reason as any}
        featureName={upgradeInfo.featureName}
        message={upgradeInfo.message}
      />
    </>
  );
}

// ============================================================================
// EXAMPLE 5: Show Usage Limits in Dashboard
// ============================================================================
// File: frontend/src/pages/Dashboard.tsx

import { useSubscription } from '../contexts/SubscriptionContext';
import { UsageLimitIndicator, PremiumBadge } from '../components/PremiumComponents';

export function Dashboard() {
  const { subscription, isPremium } = useSubscription();

  if (!subscription) return null;

  return (
    <div>
      {/* Premium badge in header */}
      <div className="flex items-center gap-2">
        <h1>Dashboard</h1>
        <PremiumBadge plan={subscription.subscriptionPlan} />
      </div>

      {/* Show limits for free users */}
      {!isPremium && (
        <div className="grid grid-cols-3 gap-4">
          <UsageLimitIndicator
            label="AI Searches"
            used={subscription.aiSearchesUsed}
            limit={subscription.maxAISearches}
          />
          <UsageLimitIndicator
            label="Saved Jobs"
            used={subscription.savedJobsCount}
            limit={subscription.maxSavedJobs}
          />
          <UsageLimitIndicator
            label="Resume Uploads"
            used={subscription.resumeUploadsCount}
            limit={subscription.maxResumeUploads}
          />
        </div>
      )}

      {/* Rest of dashboard */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Resume Upload with Limit Check
// ============================================================================
// File: frontend/src/components/ResumeUpload.tsx

import { useUpgradePrompt } from '../hooks/useUpgradePrompt';
import { useSubscription } from '../contexts/SubscriptionContext';

export function ResumeUpload() {
  const { 
    checkAndPromptUpgrade, 
    isUpgradeModalOpen, 
    closeUpgradeModal,
    upgradeInfo 
  } = useUpgradePrompt();

  const { subscription } = useSubscription();
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (file: File) => {
    // Check limit BEFORE uploading
    if (!checkAndPromptUpgrade('uploadResume')) {
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        console.log('Resume uploaded');
        // Refresh subscription to see updated count
        // Or let context auto-refresh
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input 
        type="file"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
        disabled={uploading}
      />

      {subscription && (
        <p>
          Resumes uploaded: {subscription.resumeUploadsCount} / {
            subscription.maxResumeUploads === 0 ? '∞' : subscription.maxResumeUploads
          }
        </p>
      )}

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        reason={upgradeInfo.reason as any}
        featureName={upgradeInfo.featureName}
      />
    </>
  );
}

// ============================================================================
// EXAMPLE 7: Add Routes to App
// ============================================================================
// File: frontend/src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import PricingPage from './pages/PricingPage';
import SubscriptionManagement from './pages/SubscriptionManagement';
import AdminSubscriptionAnalytics from './pages/admin/AdminSubscriptionAnalytics';

export default function App() {
  return (
    <BrowserRouter>
      <SubscriptionProvider>
        <Routes>
          {/* Existing routes */}
          
          {/* New subscription routes */}
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/dashboard/subscription" element={<SubscriptionManagement />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptionAnalytics />} />
          
          {/* Rest of routes */}
        </Routes>
      </SubscriptionProvider>
    </BrowserRouter>
  );
}

// ============================================================================
// EXAMPLE 8: Update Server Routes
// ============================================================================
// File: backend/server.ts

import subscriptionRoutes from "./routes/subscriptionRoutes";

// Add to app.use() calls
app.use("/api/subscription", subscriptionRoutes);

// Make sure middleware is applied to protected routes
import { 
  checkUsageLimit, 
  trackUsage,
  requireSubscription,
  requirePlan 
} from "./middleware/subscriptionMiddleware";

// ============================================================================
// EXAMPLE 9: Navigation with Subscription Badge
// ============================================================================
// File: frontend/src/components/Nav.tsx

import { PremiumBadge } from './PremiumComponents';
import { useSubscription } from '../contexts/SubscriptionContext';

export function Nav() {
  const { subscription } = useSubscription();

  return (
    <nav>
      <div className="flex items-center gap-4">
        <h1>JobOps</h1>
        
        {/* Show badge next to user name */}
        {subscription && (
          <>
            <span>Welcome, {userData?.name}</span>
            <PremiumBadge plan={subscription.subscriptionPlan} />
          </>
        )}

        <a href="/pricing">Pricing</a>
        {userData && <a href="/dashboard/subscription">Subscription</a>}
        {userData?.isAdmin && <a href="/admin/subscriptions">Analytics</a>}
      </div>
    </nav>
  );
}

// ============================================================================
// EXAMPLE 10: Protected Admin Route
// ============================================================================
// File: backend/routes/adminRoutes.ts

import { requirePlan } from '../middleware/subscriptionMiddleware';

// Only premium users can access admin dashboard
router.get(
  '/overview',
  authMiddleware,
  requirePlan(['ProMonthly', 'ProYearly']), // Add this line
  adminController.getOverview
);
