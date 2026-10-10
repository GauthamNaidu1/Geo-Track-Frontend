import React from 'react';
import { Link } from 'react-router-dom';

interface QuickAction {
  label: string;
  path: string;
  variant: 'primary' | 'secondary';
  icon?: string;
}

interface QuickActionsWidgetProps {
  actions: QuickAction[];
}

const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ actions }) => {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm transition-colors dark:bg-slate-800">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Quick Actions
      </h3>

      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              action.variant === 'primary'
                ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {action.icon && <span className="text-base">{action.icon}</span>}
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default React.memo(QuickActionsWidget);
