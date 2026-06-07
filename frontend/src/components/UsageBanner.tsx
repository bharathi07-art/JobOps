import { useSubscription } from '../contexts/SubscriptionContext';
import { Link } from 'react-router-dom';

export default function UsageBanner() {
  const { subscription, isPremium, canPerformAction: _canPerformAction } = useSubscription();

  if (isPremium || !subscription) return null;

  const maxSearches = subscription.maxAISearches || 4;
  const maxSavedJobs = subscription.maxSavedJobs || 10; // Might be different now, let's just use what's returned by remaining if possible. Wait, maxSavedJobs is available.
  const maxApplications = subscription.maxApplications || 3;

  const searchesUsed = subscription.aiSearchesUsed || 0;
  const jobsSaved = subscription.savedJobsCount || 0;
  const applicationsCount = subscription.applicationsCount || 0;

  const searchPercent = Math.min(100, Math.round((searchesUsed / maxSearches) * 100));
  const jobsPercent = Math.min(100, Math.round((jobsSaved / maxSavedJobs) * 100));
  const appsPercent = Math.min(100, Math.round((applicationsCount / maxApplications) * 100));

  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 mb-8 border border-orange-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Free Plan Limits</h2>
          <p className="text-orange-700">You are currently using the Free plan. Upgrade to Pro for unlimited access.</p>
        </div>
        <Link 
          to="/dashboard/settings" 
          className="mt-4 md:mt-0 px-6 py-2 bg-gradient-to-r from-[#FF4500] to-orange-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
        >
          Upgrade to Pro
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UsageItem title="AI Matches" used={searchesUsed} max={maxSearches} percent={searchPercent} />
        <UsageItem title="Saved Jobs" used={jobsSaved} max={maxSavedJobs} percent={jobsPercent} />
        <UsageItem title="Applications" used={applicationsCount} max={maxApplications} percent={appsPercent} />
      </div>
    </div>
  );
}

function UsageItem({ title, used, max, percent }: { title: string; used: number; max: number; percent: number }) {
  const isNearLimit = percent >= 80;
  const isAtLimit = percent >= 100;
  
  return (
    <div className="bg-white rounded-lg p-4 border border-orange-100 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-gray-700">{title}</span>
        <span className="text-sm font-medium text-gray-500">{used} / {max}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-[#FF4500]'}`} 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      {isAtLimit && <p className="text-xs text-red-500 mt-2 font-medium">Limit reached</p>}
    </div>
  );
}
