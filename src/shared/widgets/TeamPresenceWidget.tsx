import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface DashboardStats {
  totalEmployees?: number;
  checkedIn?: number;
  presentToday?: number;
  absent?: number;
  onLeave?: number;
}

const TeamPresenceWidget: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await api.get('/dashboard/stats');
        if (!cancelled) {
          const data = response.data?.data ?? response.data;
          setStats(data);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const checkedIn = stats?.checkedIn ?? stats?.presentToday ?? 0;
  const total = stats?.totalEmployees ?? 0;
  const absent = stats?.absent ?? Math.max(0, total - checkedIn - (stats?.onLeave ?? 0));
  const onLeave = stats?.onLeave ?? 0;
  const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm transition-colors dark:bg-slate-800">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Team Presence
      </h3>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
        </div>
      )}

      {error && !loading && (
        <p className="py-4 text-center text-sm text-red-500 dark:text-red-400">
          Unable to load team data.
        </p>
      )}

      {!loading && !error && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {checkedIn}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Checked In
              </p>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-600 dark:text-slate-300">
                {absent}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Absent
              </p>
            </div>
            <div>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {onLeave}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                On Leave
              </p>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Presence</span>
              <span>{percentage}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500 dark:bg-green-400"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {!loading && !error && !stats && (
        <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
          No data available.
        </p>
      )}
    </div>
  );
};

export default React.memo(TeamPresenceWidget);
