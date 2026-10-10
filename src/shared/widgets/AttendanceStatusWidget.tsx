import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface AttendanceStatus {
  checkedIn: boolean;
  checkInTime?: string;
}

interface AttendanceStatusWidgetProps {
  attendancePath?: string;
}

const AttendanceStatusWidget: React.FC<AttendanceStatusWidgetProps> = ({
  attendancePath = '/e/attendance',
}) => {
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await api.get('/attendance/status');
        if (!cancelled) {
          setStatus(response.data);
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

    fetchStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatTime = (isoString: string): string => {
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm transition-colors dark:bg-slate-800">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Today's Status
      </h3>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
        </div>
      )}

      {error && !loading && (
        <p className="py-4 text-center text-sm text-red-500 dark:text-red-400">
          Unable to load status.
        </p>
      )}

      {!loading && !error && status && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              className={`inline-block h-3 w-3 rounded-full ${
                status.checkedIn
                  ? 'bg-green-500 shadow-sm shadow-green-300 dark:shadow-green-700'
                  : 'bg-slate-400 dark:bg-slate-500'
              }`}
            />
            <span
              className={`text-base font-semibold ${
                status.checkedIn
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {status.checkedIn ? 'Checked In' : 'Not Checked In'}
            </span>
          </div>

          {status.checkedIn && status.checkInTime && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Since{' '}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {formatTime(status.checkInTime)}
              </span>
            </p>
          )}

          <Link
            to={attendancePath}
            className={`block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
              status.checkedIn
                ? 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                : 'bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
            }`}
          >
            {status.checkedIn ? 'Check Out' : 'Check In'}
          </Link>
        </div>
      )}

      {!loading && !error && !status && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No status available.
          </p>
          <Link
            to={attendancePath}
            className="block w-full rounded-lg bg-green-500 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          >
            Check In
          </Link>
        </div>
      )}
    </div>
  );
};

export default React.memo(AttendanceStatusWidget);
