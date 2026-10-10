interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const sizes = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
}

export default function Spinner({ size = 'md', label = 'Loading', className = '' }: SpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status" aria-live="polite">
      <div
        className={`animate-spin rounded-full border-primary border-t-transparent ${sizes[size]}`}
        aria-hidden="true"
      />
      {label && <span className="sr-only">{label}</span>}
      {label && size !== 'sm' && (
        <p className="text-sm text-text-secondary dark:text-slate-400">{label}</p>
      )}
    </div>
  )
}
