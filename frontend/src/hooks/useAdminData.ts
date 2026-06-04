import { useEffect, useState } from 'react';
import axios from 'axios';

export interface AdminStats {
  totalUsers: number;
  totalSubscriptions: number;
  totalResumes: number;
  totalAIResults: number;
  totalJobsMatched: number;
  totalHighMatches: number;
}
export interface WeeklyVisit {
  day: string;
  users: number;
  sessions: number;
}
export interface MonthlyRevenue {
  month: string;
  revenue: number;
  subscriptions: number;
}
export interface SubscriptionPie {
  label: string;
  value: number;
  color: string;
}
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}
export interface RecentActivity {
  id: string;
  user: string;
  action: string;
  time: string;
  type: string;
}

export interface AdminData {
  stats?: AdminStats;
  weeklyVisits?: WeeklyVisit[];
  monthlyRevenue?: MonthlyRevenue[];
  subscriptionPie?: SubscriptionPie[];
  notifications?: Notification[];
  recentActivity?: RecentActivity[];
}

export const useAdminData = () => {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = (() => {
      try {
        return JSON.parse(localStorage.getItem('userInfo') || 'null')?.token;
      } catch {
        return null;
      }
    })();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchAll = async () => {
      try {
        const [overviewRes, weeklyRes, monthlyRes, pieRes, notifRes, activityRes] = await Promise.all([
          axios.get('/api/admin/overview', { headers }),
          axios.get('/api/admin/weekly-visits', { headers }),
          axios.get('/api/admin/monthly-revenue', { headers }),
          axios.get('/api/admin/subscription-pie', { headers }),
          axios.get('/api/admin/notifications', { headers }),
          axios.get('/api/admin/recent-activity', { headers })
        ]);
        setData({
          stats: overviewRes.data.overview,
          weeklyVisits: weeklyRes.data,
          monthlyRevenue: monthlyRes.data,
          subscriptionPie: pieRes.data,
          notifications: notifRes.data,
          recentActivity: activityRes.data,
        });
      } catch (e: any) {
        setError(e.message || 'Failed to load admin data');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return { data, loading, error };
};
