import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CreditCard, Download, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PremiumBadge, SubscriptionStatusBar, UsageLimitIndicator } from '../components/PremiumComponents';
import { BarChart } from '../components/ui/AdminCharts';


interface Subscription {
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  billingCycle: string;
  autoRenew: boolean;
  aiSearchesUsed: number;
  maxAISearches: number;
  savedJobsCount: number;
  maxSavedJobs: number;
  resumeUploadsCount: number;
  maxResumeUploads: number;
}

interface Transaction {
  id: number;
  planName: string;
  action: string;
  amount: number;
  status: string;
  createdAt: string;
  transactionId: string;
}

interface Analytics {
  totalAISearches: number;
  totalJobsSaved: number;
  totalResumesUploaded: number;
  totalQuestionsAsked: number;
  dailyData: any[];
}

export default function SubscriptionManagement() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [subRes, transRes, analyticsRes] = await Promise.all([
        fetch('/api/subscription/current', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/subscription/history', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/subscription/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const subData = await subRes.json();
      const transData = await transRes.json();
      const analyticsData = await analyticsRes.json();

      setSubscription(subData);
      setTransactions(transData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setShowCancelModal(false);
        fetchSubscriptionData();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-[#FF4500]">
          <RotateCcw className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F4] to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF4500] to-orange-400 text-white px-6 py-12">
        <h1 className="text-4xl font-bold mb-4">Subscription & Billing</h1>
        <p className="text-white/90">Manage your subscription, view usage, and billing history</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Current Subscription Status */}
        {subscription && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <SubscriptionStatusBar
                plan={subscription.subscriptionPlan}
                endDate={subscription.subscriptionEndDate ? new Date(subscription.subscriptionEndDate) : undefined}
                billingCycle={subscription.billingCycle}
              />
            </motion.div>

            {/* Current Plan Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm"
            >
              <div className="grid md:grid-cols-2 gap-8">
                {/* Plan Info */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-3xl font-bold text-gray-900">
                      {subscription.subscriptionPlan}
                    </h2>
                    <PremiumBadge plan={subscription.subscriptionPlan} />
                  </div>

                  {/* Price display */}
                  <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    {subscription.subscriptionPlan === 'Monthly' && (
                      <p className="text-lg font-bold text-gray-900">$25<span className="text-sm font-normal text-gray-500">/month</span></p>
                    )}
                    {subscription.subscriptionPlan === 'Yearly' && (
                      <>
                        <p className="text-lg font-bold text-gray-900">$250<span className="text-sm font-normal text-gray-500">/year</span></p>
                        <p className="text-xs text-green-600 font-medium mt-0.5">Saving $50 annually (16.7% off vs monthly)</p>
                      </>
                    )}
                    {subscription.subscriptionPlan === 'Free' && (
                      <p className="text-lg font-bold text-gray-900">$0<span className="text-sm font-normal text-gray-500">/forever</span></p>
                    )}
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar className="w-5 h-5 text-[#FF4500]" />
                      <span>
                        Started:{' '}
                        {new Date(subscription.subscriptionStartDate).toLocaleDateString()}
                      </span>
                    </div>

                    {subscription.subscriptionEndDate && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar className="w-5 h-5 text-[#FF4500]" />
                        <span>
                          Renews:{' '}
                          {new Date(subscription.subscriptionEndDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-gray-600">
                      <CreditCard className="w-5 h-5 text-[#FF4500]" />
                      <span>
                        Billing Cycle: {subscription.billingCycle?.charAt(0).toUpperCase() + subscription.billingCycle?.slice(1)}
                      </span>
                    </div>

                    {subscription.autoRenew && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-green-700">
                          Auto-renewal is enabled. Your subscription will renew automatically.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-between">
                  {subscription.subscriptionPlan !== 'Free' && (
                    <div className="space-y-3">
                      <Button
                        onClick={() => window.location.href = '/pricing'}
                        variant="primary"
                        className="w-full"
                      >
                        Upgrade Plan
                      </Button>
                      <Button
                        onClick={() => setShowCancelModal(true)}
                        variant="ghost"
                        className="w-full text-red-600 hover:bg-red-50"
                      >
                        Cancel Subscription
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Usage Limits */}
            {subscription.subscriptionPlan !== 'Free' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Usage Statistics</h3>
                <div className="grid md:grid-cols-3 gap-6">
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
              </motion.div>
            )}

            {/* Usage Analytics */}
            {analytics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Activity Overview</h3>
                
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Summary Stats */}
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">AI Searches (Last 30 days)</p>
                      <p className="text-3xl font-bold text-blue-900 mt-1">{analytics.totalAISearches}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Jobs Saved (Last 30 days)</p>
                      <p className="text-3xl font-bold text-green-900 mt-1">{analytics.totalJobsSaved}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Resumes Uploaded (Last 30 days)</p>
                      <p className="text-3xl font-bold text-purple-900 mt-1">{analytics.totalResumesUploaded}</p>
                    </div>
                  </div>

                  {/* Chart */}
                  {analytics.dailyData.length > 0 && (
                    <BarChart
                      data={analytics.dailyData.map((day: any) => ({
                        date: new Date(day.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        }),
                        searches: day.aiSearchesUsed,
                      }))}
                      xKey="date"
                      yKey="searches"
                      color="#FF4500"
                      label="Daily AI Searches"
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* Billing History */}
            {transactions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Billing History</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Plan</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">{tx.planName}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 capitalize">{tx.action}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                            ${tx.amount?.toFixed(2) || '0.00'}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              tx.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : tx.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Download invoice
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Cancel Subscription?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? You'll lose access to premium features.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => setShowCancelModal(false)}
                variant="ghost"
                className="flex-1"
              >
                Keep Subscription
              </Button>
              <Button
                onClick={handleCancelSubscription}
                variant="danger"
                className="flex-1"
              >
                Yes, Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
