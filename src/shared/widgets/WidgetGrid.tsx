import React from 'react';

interface WidgetGridProps {
  children: React.ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
}

const smColumnClasses: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

const mdColumnClasses: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

const lgColumnClasses: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

const WidgetGrid: React.FC<WidgetGridProps> = ({
  children,
  columns = {},
}) => {
  const sm = columns.sm ?? 1;
  const md = columns.md ?? 2;
  const lg = columns.lg ?? 3;

  const smClass = smColumnClasses[sm] || 'grid-cols-1';
  const mdClass = mdColumnClasses[md] || 'md:grid-cols-2';
  const lgClass = lgColumnClasses[lg] || 'lg:grid-cols-3';

  return (
    <div className={`grid gap-4 ${smClass} ${mdClass} ${lgClass}`}>
      {children}
    </div>
  );
};

export default React.memo(WidgetGrid);
