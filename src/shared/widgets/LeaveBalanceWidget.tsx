import React from 'react';
import { Link } from 'react-router-dom';

interface LeaveBalanceWidgetProps {
  leavePath?: string;
  requestPath?: string;
}

const LeaveBalanceWidget: React.FC<LeaveBalanceWidgetProps> = ({
  leavePath = '/e/leaves',
  requestPath = '/e/leaves/request',
}) => {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm transition-colors dark:bg-slate-800">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Leave Balance
      </h3>

      <div className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Manage your leave requests and check your remaining balance.
        </p>

        <div className="flex flex-col gap-2 pt-1">
          <Link
            to={leavePath}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            <span>📋</span>
            View Leaves
          </Link>
          <Link
            to={requestPath}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <span>✏️</span>
            Request Leave
          </Link>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LeaveBalanceWidget);
