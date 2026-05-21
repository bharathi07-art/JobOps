import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import {
  AdminStatCard,
  BarChart,
  LineChart,
} from '../../components/ui/AdminCharts';

interface SubscriptionAnalytics {
  summary: {
    totalRevenue: number;
    activeSubscriptions: number;
    freeUsers: number;
    totalUsers: number;
  };
  subscriptionCounts: Array<{
    subscriptionPlan: string;
    _count: number;
  }>;
  subscriptionsByStatus: Array<{
    subscriptionStatus: string;
    _count: number;
  }>;
  yearlyVsMonthly: Array<{
    billingCycle: string;
    _count: number;
  }>;
}

export default function AdminSubscriptionAnalytics() {
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'users' | 'plans'>('revenue');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subscription/admin/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin text-[#FF4500]">
            <CreditCard className="w-8 h-8" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <p className="text-gray-600">Unable to load subscription analytics</p>
        </div>
      </AdminLayout>
    );
  }

  const conversionRate =
    analytics.summary.totalUsers > 0
      ? (
          (analytics.summary.activeSubscriptions / analytics.summary.totalUsers) *
          100
        ).toFixed(1)
      : 0;

  const monthlyPlans =
    analytics.yearlyVsMonthly.find((b) => b.billingCycle === 'monthly')?._count || 0;
  const yearlyPlans =
    analytics.yearlyVsMonthly.find((b) => b.billingCycle === 'yearly')?._count || 0;

  // Chart data for subscription trends
  const planData = analytics.subscriptionCounts.map((item) => ({
    plan: item.subscriptionPlan,
    count: item._count,
  }));

  const statusData = analytics.subscriptionsByStatus.map((item) => ({
    status: item.subscriptionStatus || 'unknown',
    count: item._count,
  }));

  return (
    <AdminLayout>
      <div className="p-6 bg-gradient-to-br from-[#FFF8F4] to-white min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <CreditCard className="w-8 h-8 text-[#FF4500]" />
            Subscription Analytics
          </h1>
          <p className="text-gray-600">Monitor revenue, subscriptions, and growth metrics</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdminStatCard
            label="Total Revenue"
            value={`$${analytics.summary.totalRevenue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            growth={12}
            icon={DollarSign}
            color="text-green-600"
            delay={0}
          />
          <AdminStatCard
            label="Active Subscriptions"
            value={analytics.summary.activeSubscriptions}
            growth={8}
            icon={TrendingUp}
            color="text-[#FF4500]"
            delay={0.1}
          />
          <AdminStatCard
            label="Free Users"
            value={analytics.summary.freeUsers}
            growth={-2}
            icon={Users}
            color="text-blue-600"
            delay={0.2}
          />
          <AdminStatCard
            label="Conversion Rate"
            value={`${conversionRate}%`}
            growth={5}
            icon={BarChart3}
            color="text-purple-600"
            delay={0.3}
          />
        </div>

        {/* Metric Toggle */}
        <div className="mb-8 flex gap-4">
          {[
            { id: 'revenue', label: 'Revenue Overview', icon: DollarSign },
            { id: 'users', label: 'User Breakdown', icon: Users },
            { id: 'plans', label: 'Plan Distribution', icon: CreditCard },
          ].map((metric) => (
            <motion.button
              key={metric.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMetric(metric.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedMetric === metric.id
                  ? 'bg-[#FF4500] text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <metric.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{metric.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Plan Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-[#FF4500]" />
              Subscription Plans Distribution
            </h3>
            <div className="space-y-4">
              {planData.map((item, idx) => {
                const total = planData.reduce((sum, p) => sum + p.count, 0);
                const percentage = ((item.count / total) * 100).toFixed(1);
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.plan}</span>
                      <span className="text-sm font-bold text-gray-900">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className={`h-full rounded-full ${
                          item.plan === 'ProYearly'
                            ? 'bg-gradient-to-r from-[#FF4500] to-orange-400'
                            : item.plan === 'ProMonthly'
                              ? 'bg-[#FF4500]'
                              : 'bg-gray-400'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Billing Cycle Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#FF4500]" />
              Monthly vs Yearly Subscriptions
            </h3>
            <div className="flex items-end justify-around gap-4">
              {[
                { label: 'Monthly', count: monthlyPlans, color: 'bg-[#FF4500]' },
                { label: 'Yearly', count: yearlyPlans, color: 'bg-orange-400' },
              ].map((item, idx) => {
                const total = monthlyPlans + yearlyPlans;
                const height = total > 0 ? (item.count / total) * 100 : 0;
                return (
                  <div key={idx} className="text-center flex-1">
                    <div className="relative h-40 flex items-end justify-center mb-4">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className={`w-full rounded-t-lg ${item.color}`}
                      />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                    <p className="text-xs text-gray-500">
                      {total > 0 ? ((item.count / total) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Subscription Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusData.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200"
              >
                <p className="text-sm text-gray-600 capitalize">{item.status}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{item.count}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gradient-to-r from-[#FFCBA4] to-orange-200 rounded-2xl p-8 text-[#FF4500]"
        >
          <h3 className="text-lg font-bold mb-4">📊 Key Insights</h3>
          <ul className="space-y-2 text-sm">
            <li>
              ✓ {yearlyPlans > monthlyPlans ? 'Yearly' : 'Monthly'} plans are more popular ({Math.max(monthlyPlans, yearlyPlans)} subscribers)
            </li>
            <li>
              ✓ Conversion rate is {conversionRate}% - {conversionRate > 20 ? 'Strong' : conversionRate > 10 ? 'Healthy' : 'Needs improvement'}
            </li>
            <li>
              ✓ Total revenue generated: ${analytics.summary.totalRevenue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </li>
            <li>
              ✓ {analytics.summary.freeUsers} users on free plan (opportunity for conversion)
            </li>
          </ul>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
