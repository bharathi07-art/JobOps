import { useEffect, useState } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { cn } from '../utils/utils';
/**
 * Visualizes AI search usage.
 *
 * Free users: 2 searches per week, 8 per month.
 * Paid (monthly/yearly) users: 2 searches per day, unlimited per month.
 */
export default function SearchUsageVisualizer() {
  const { subscription } = useSubscription();
  const plan = subscription?.plan ?? 'FREE';

  // ----- Daily (for paid plans) -----
  const [dailyUsed, setDailyUsed] = useState(0);
  const [dailyLimit, setDailyLimit] = useState<number>(Infinity);

  // ----- Weekly (for free plan) -----
  const [weeklyUsed, setWeeklyUsed] = useState(0);
  const [weeklyLimit, setWeeklyLimit] = useState<number>(Infinity);

  // ----- Monthly (shared) -----
  const monthlyUsed = subscription?.aiSearchesUsed ?? 0;
  const monthlyLimit = plan === 'FREE' ? 8 : Infinity;

  // Load daily usage for paid plans (reset each day)
  useEffect(() => {
    if (plan !== 'FREE') {
      const today = new Date().toISOString().slice(0, 10);
      const raw = localStorage.getItem('dailySearchInfo');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.date === today) {
            setDailyUsed(parsed.count);
          } else {
            setDailyUsed(0);
            localStorage.setItem('dailySearchInfo', JSON.stringify({ date: today, count: 0 }));
          }
        } catch {
          setDailyUsed(0);
          localStorage.setItem('dailySearchInfo', JSON.stringify({ date: today, count: 0 }));
        }
      } else {
        localStorage.setItem('dailySearchInfo', JSON.stringify({ date: today, count: 0 }));
      }
      setDailyLimit(2);
    }
  }, [plan]);

  // Load weekly usage for free plan (reset each Monday)
  useEffect(() => {
    if (plan === 'FREE') {
      const now = new Date();
      // Compute ISO week start (Monday) string
      const day = now.getUTCDay();
      const diff = (day + 6) % 7; // days since Monday
      const monday = new Date(now);
      monday.setUTCDate(now.getUTCDate() - diff);
      const weekKey = monday.toISOString().slice(0, 10);

      const raw = localStorage.getItem('weeklySearchInfo');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.week === weekKey) {
            setWeeklyUsed(parsed.count);
          } else {
            setWeeklyUsed(0);
            localStorage.setItem('weeklySearchInfo', JSON.stringify({ week: weekKey, count: 0 }));
          }
        } catch {
          setWeeklyUsed(0);
          localStorage.setItem('weeklySearchInfo', JSON.stringify({ week: weekKey, count: 0 }));
        }
      } else {
        localStorage.setItem('weeklySearchInfo', JSON.stringify({ week: weekKey, count: 0 }));
      }
      setWeeklyLimit(2);
    }
  }, [plan]);

  const dailyPercent = dailyLimit !== Infinity ? Math.min(100, Math.round((dailyUsed / dailyLimit) * 100)) : 0;
  const weeklyPercent = weeklyLimit !== Infinity ? Math.min(100, Math.round((weeklyUsed / weeklyLimit) * 100)) : 0;
  const monthlyPercent = monthlyLimit ? Math.min(100, Math.round((monthlyUsed / monthlyLimit) * 100)) : 0;

  const isDailyAtLimit = dailyLimit !== Infinity && dailyUsed >= dailyLimit;
  const isWeeklyAtLimit = weeklyLimit !== Infinity && weeklyUsed >= weeklyLimit;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-6 border border-purple-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Usage</h3>
      {/* Monthly usage */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-700 mb-1">
          <span>Month Used: {monthlyUsed} / {monthlyLimit === Infinity ? '∞' : monthlyLimit}</span>
          <span>{monthlyPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full ${monthlyPercent >= 100 ? 'bg-red-500' : 'bg-purple-500'}`} style={{ width: `${monthlyPercent}%` }} />
        </div>
      </div>
      {/* Weekly usage for free plan */}
      {weeklyLimit !== Infinity && (
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-700 mb-1">
            <span>Week Used: {weeklyUsed} / {weeklyLimit}</span>
            <span>{weeklyPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full ${isWeeklyAtLimit ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${weeklyPercent}%` }} />
          </div>
          {isWeeklyAtLimit && (
            <p className="mt-1 text-xs text-red-600">You have reached your weekly limit. New searches will be available next week.</p>
          )}
        </div>
      )}
      {/* Daily usage for paid plans */}
      {dailyLimit !== Infinity && (
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-700 mb-1">
            <span>Daily Used: {dailyUsed} / {dailyLimit}</span>
            <span>{dailyPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full ${isDailyAtLimit ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${dailyPercent}%` }} />
          </div>
          {isDailyAtLimit && (
            <p className="mt-1 text-xs text-red-600">You have reached your daily limit. New searches will be available tomorrow.</p>
          )}
        </div>
      )}
    </div>
  );
}
