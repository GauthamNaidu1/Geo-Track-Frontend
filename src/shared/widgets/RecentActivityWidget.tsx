import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import type { RootState } from '../../store';

interface ActivityEvent {
  id?: string;
  employeeId?: string;
  employeeName?: string;
  name?: string;
  office?: string;
  officeName?: string;
  type?: 'check-in' | 'check-out' | string;
  timestamp?: string;
  time?: string;
  createdAt?: string;
}

interface RecentActivityWidgetProps {
  scope: 'self' | 'team' | 'org';
  limit?: number;
}

const formatTimeAgo = (dateString: string): string => {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch {
    return '';
  }
};

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
  scope,
  limit = 5,
}) => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    let cancelled = false;

    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await api.get('/dashboard/live-attendance');
        if (!cancelled) {
          let data: ActivityEvent[] = Array.isArray(response.data)
            ? response.data
            : response.data?.data ?? response.data?.activities ?? [];

          if (scope === 'self' && currentUser) {
            data = data.filter(
              (event) =>
                event.employeeId === currentUser.id ||
                event.employeeName === currentUser.name ||
                event.name === currentUser.name
            );
          }

          setActivities(data.slice(0, limit));
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

    fetchActivity();

    return () => {
      cancelled = true;
    };
  }, [scope, limit, currentUser]);

  const getEventTime = (event: ActivityEvent): string => {
    return event.timestamp || event.time || event.createdAt || '';
  };

  const getEventName = (event: ActivityEvent): string => {
    return event.employeeName || event.name || 'Unknown';
  };

  const getEventOffice = (event: ActivityEvent): string => {
    return event.office || event.officeName || '';
  };

  const getEventType = (event: ActivityEvent): string => {
    const type = event.type || 'check-in';
    return type === 'check-out' ? 'Checked out' : 'Checked in';
  };

  const getEventTypeColor = (event: ActivityEvent): string => {
    const type = event.type || 'check-in';
    return type === 'check-out'
      ? 'text-red-600 dark:text-red-400'
      : 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm transition-colors dark:bg-slate-800">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Recent Activity
      </h3>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
        </div>
      )}

      {error && !loading && (
        <p className="py-4 text-center text-sm text-red-500 dark:text-red-400">
          Unable to load activity.
        </p>
      )}

      {!loading && !error && activities.length === 0 && (
        <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
          No recent activity.
        </p>
      )}

      {!loading && !error && activities.length > 0 && (
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {activities.map((event, index) => {
            const timeStr = getEventTime(event);
            return (
              <li
                key={event.id || index}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                    {getEventName(event)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className={getEventTypeColor(event)}>
                      {getEventType(event)}
                    </span>
                    {getEventOffice(event) && (
                      <span> · {getEventOffice(event)}</span>
                    )}
                  </p>
                </div>
                {timeStr && (
                  <span className="flex-shrink-0 text-xs text-slate-400 dark:text-slate-500">
                    {formatTimeAgo(timeStr)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default React.memo(RecentActivityWidget);
