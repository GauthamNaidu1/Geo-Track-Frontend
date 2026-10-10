interface SkeletonProps {
  className?: string
}

function Bone({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`}
      aria-hidden="true"
    />
  )
}

export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" aria-busy="true" aria-label="Loading statistics">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-6 space-y-3">
          <Bone className="h-4 w-24" />
          <Bone className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="card overflow-hidden" aria-busy="true" aria-label="Loading table">
      <div className="hidden md:block p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Bone key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="p-4 flex flex-col md:flex-row gap-3">
            <Bone className="h-5 w-full md:w-1/4" />
            <Bone className="h-5 w-full md:w-1/6" />
            <Bone className="h-5 w-full md:w-1/6" />
            <Bone className="h-5 w-full md:w-1/4" />
            <Bone className="h-5 w-16 md:ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" aria-busy="true" aria-label="Loading cards">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-6 space-y-4">
          <Bone className="h-6 w-3/4" />
          <Bone className="h-4 w-1/2" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-2/3" />
          <div className="flex gap-2 pt-2">
            <Bone className="h-10 flex-1" />
            <Bone className="h-10 flex-1" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonPanel() {
  return (
    <div className="card p-6 space-y-4" aria-busy="true" aria-label="Loading content">
      <Bone className="h-6 w-1/3" />
      <Bone className="h-10 w-full" />
      <Bone className="h-4 w-full" />
      <Bone className="h-12 w-full" />
    </div>
  )
}

export default function SkeletonLoader({ variant = 'table' }: { variant?: 'table' | 'cards' | 'stats' | 'panel' }) {
  switch (variant) {
    case 'stats':
      return <SkeletonStatCards />
    case 'cards':
      return <SkeletonCards />
    case 'panel':
      return <SkeletonPanel />
    default:
      return <SkeletonTable />
  }
}
