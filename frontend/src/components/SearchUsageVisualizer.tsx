import { useSubscription } from '../hooks/useSubscription';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { cn } from '../utils/utils';

const FREE_WEEKLY_LIMIT  = 2;
const FREE_MONTHLY_LIMIT = 8;
const PRO_DAILY_LIMIT    = 2;

// ── Helpers ────────────────────────────────────────────────────────────────────

function getNextMidnight(): Date {
  const d = new Date();
  d.setHours(24, 0, 0, 0); // next midnight local time
  return d;
}

function getNextMonday(): Date {
  const d = new Date();
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getNextMonthStart(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
}

function formatResetDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
  });
}

function formatResetTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0s';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ── Countdown hook ─────────────────────────────────────────────────────────────
function useCountdown(target: Date) {
  const [msLeft, setMsLeft] = useState(() => target.getTime() - Date.now());

  useEffect(() => {
    const tick = setInterval(() => {
      const left = target.getTime() - Date.now();
      setMsLeft(left);
      if (left <= 0) clearInterval(tick);
    }, 1000);
    return () => clearInterval(tick);
  }, [target.getTime()]);

  return Math.max(0, msLeft);
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Bar({ percent, atLimit }: { percent: number; atLimit: boolean }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={cn(
          'h-2 rounded-full transition-all duration-500',
          atLimit ? 'bg-red-500' : percent >= 75 ? 'bg-amber-500' : 'bg-[#FF4500]'
        )}
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </div>
  );
}

function UsageRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const percent   = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const atLimit   = used >= limit;
  const remaining = Math.max(0, limit - used);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-600">
        <span className="font-medium">{label}</span>
        <span className={cn('font-semibold', atLimit ? 'text-red-600' : 'text-gray-800')}>
          {used} / {limit}
          <span className="font-normal text-gray-400 ml-1.5">
            {atLimit ? '(limit reached)' : `(${remaining} left)`}
          </span>
        </span>
      </div>
      <Bar percent={percent} atLimit={atLimit} />
    </div>
  );
}

function ResetInfo({ label, resetDate, countdown }: {
  label: string;
  resetDate: Date;
  countdown: number;
}) {
  return (
    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
      <span>
        {label} resets{' '}
        <span className="font-medium text-gray-600">
          {formatResetDate(resetDate)} at {formatResetTime(resetDate)}
        </span>
      </span>
      <span className="font-mono font-semibold text-gray-500 ml-2 shrink-0">
        in {formatCountdown(countdown)}
      </span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function SearchUsageVisualizer() {
  const { subscription } = useSubscription();

  const nextMidnight   = getNextMidnight();
  const nextMonday     = getNextMonday();
  const nextMonthStart = getNextMonthStart();

  const countdownMidnight = useCountdown(nextMidnight);
  const countdownMonday   = useCountdown(nextMonday);
  const countdownMonth    = useCountdown(nextMonthStart);

  if (!subscription) return null;

  const plan      = subscription.subscriptionPlan ?? 'Free';
  const isProPlan = plan === 'Monthly' || plan === 'Yearly';

  // ── FREE PLAN ──────────────────────────────────────────────────────────────
  if (!isProPlan) {
    const weeklyUsed  = subscription.weeklySearchesUsed  ?? 0;
    const monthlyUsed = subscription.monthlySearchesUsed ?? 0;
    const weekAtLimit  = weeklyUsed  >= FREE_WEEKLY_LIMIT;
    const monthAtLimit = monthlyUsed >= FREE_MONTHLY_LIMIT;

    return (
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-6 border border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Search Usage</h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            Free Plan
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <UsageRow label="This Week"  used={weeklyUsed}  limit={FREE_WEEKLY_LIMIT}  />
            <ResetInfo
              label="Week"
              resetDate={nextMonday}
              countdown={countdownMonday}
            />
          </div>
          <div>
            <UsageRow label="This Month" used={monthlyUsed} limit={FREE_MONTHLY_LIMIT} />
            <ResetInfo
              label="Month"
              resetDate={nextMonthStart}
              countdown={countdownMonth}
            />
          </div>
        </div>

        {(weekAtLimit || monthAtLimit) && (
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-purple-200">
            <p className="text-xs text-red-600 font-medium">
              {weekAtLimit ? 'Weekly limit reached' : 'Monthly limit reached'}
            </p>
            <Link
              to="/pricing"
              className="text-xs font-semibold text-white bg-[#FF4500] px-2.5 py-1 rounded-lg hover:bg-[#e03e00] transition-colors"
            >
              Upgrade →
            </Link>
          </div>
        )}
      </div>
    );
  }

  // ── MONTHLY / YEARLY PLAN ─────────────────────────────────────────────────
  const dailyUsed  = subscription.dailySearchesUsed ?? 0;
  const totalUsed  = subscription.aiSearchesUsed     ?? 0;
  const atDayLimit = dailyUsed >= PRO_DAILY_LIMIT;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 mb-6 border border-orange-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Search Usage</h3>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
          {plan} Plan
        </span>
      </div>

      <div>
        <UsageRow label="Today" used={dailyUsed} limit={PRO_DAILY_LIMIT} />
        <ResetInfo
          label="Daily counter"
          resetDate={nextMidnight}
          countdown={countdownMidnight}
        />
      </div>

      <div className="mt-3 flex items-center justify-between pt-3 border-t border-orange-200">
        <span className="text-xs text-gray-400">
          Total searches: <span className="font-semibold text-gray-600">{totalUsed}</span>
        </span>
        {atDayLimit && (
          <span className="text-xs text-red-600 font-medium">
            Come back after midnight 🕛
          </span>
        )}
      </div>
    </div>
  );
}
