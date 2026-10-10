import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface PendingApprovalsWidgetProps {
  approvalsPath?: string;
}

const PendingApprovalsWidget: React.FC<PendingApprovalsWidgetProps> = ({
  approvalsPath = '/m/approvals',
}) => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchPending = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await api.get('/leave/requests', {
          params: { status: 'pending' },
        });
        if (!cancelled) {
          const data = response.data;
          if (typeof data?.count === 'number') {
            setCount(data.count);
          } else if (typeof data?.total === 'number') {
            setCount(data.total);
          } else if (Array.isArray(data)) {
            setCount(data.length);
          } else if (Array.isArray(data?.data)) {
            setCount(data.data.length);
          } else if (Array.isArray(data?.requests)) {
            setCount(data.requests.length);
          } else {
            setCount(0);
          }
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

    fetchPending();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-lg border-l-4 border-l-amber-400 bg-white p-5 shadow-sm transition-colors dark:border-l-amber-500 dark:bg-slate-800">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Pending Approvals
      </h3>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
        </div>
      )}

      {error && !loading && (
        <p className="py-4 text-center text-sm text-red-500 dark:text-red-400">
          Unable to load approvals.
        </p>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl dark:bg-amber-900/40">
              📝
            </span>
            <div>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {count}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {count === 1 ? 'request' : 'requests'} awaiting review
              </p>
            </div>
          </div>

          <Link
            to={approvalsPath}
            className="block w-full rounded-lg bg-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
          >
            Review Approvals
          </Link>
        </div>
      )}
    </div>
  );
};

export default React.memo(PendingApprovalsWidget);
