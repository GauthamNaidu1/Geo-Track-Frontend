import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  colorScheme?: 'green' | 'red' | 'yellow' | 'blue' | 'orange' | 'default';
}

const borderColorMap: Record<string, string> = {
  green: 'border-l-green-500',
  red: 'border-l-red-500',
  yellow: 'border-l-yellow-500',
  blue: 'border-l-blue-500',
  orange: 'border-l-orange-500',
  default: 'border-l-slate-400 dark:border-l-slate-500',
};

const trendConfig: Record<string, { arrow: string; color: string }> = {
  up: { arrow: '↑', color: 'text-green-600 dark:text-green-400' },
  down: { arrow: '↓', color: 'text-red-600 dark:text-red-400' },
  neutral: { arrow: '→', color: 'text-slate-500 dark:text-slate-400' },
};

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  colorScheme = 'default',
}) => {
  const borderClass = borderColorMap[colorScheme] || borderColorMap.default;
  const trendInfo = trend ? trendConfig[trend] : null;

  return (
    <div
      className={`w-full rounded-lg border-l-4 ${borderClass} bg-white p-4 shadow-sm transition-colors dark:bg-slate-800`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          {icon && <span className="mb-1 block text-2xl">{icon}</span>}
          <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
        {trendInfo && (
          <span
            className={`ml-2 mt-1 flex-shrink-0 text-lg font-semibold ${trendInfo.color}`}
            aria-label={`Trend: ${trend}`}
          >
            {trendInfo.arrow}
          </span>
        )}
      </div>
    </div>
  );
};

export default React.memo(StatCard);
