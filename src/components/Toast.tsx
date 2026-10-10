import { ToastMessage } from '../context/ToastContext'

interface ToastProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

const styles: Record<ToastMessage['type'], string> = {
  success: 'bg-green-600 dark:bg-green-700 border-green-700',
  error: 'bg-red-600 dark:bg-red-700 border-red-700',
  info: 'bg-primary dark:bg-blue-700 border-blue-700',
  warning: 'bg-amber-600 dark:bg-amber-700 border-amber-700',
}

const icons: Record<ToastMessage['type'], string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '!',
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 max-w-sm sm:max-w-md ml-auto"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border text-white animate-slide-up ${styles[toast.type]}`}
          role="alert"
        >
          <span
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-sm font-bold"
            aria-hidden="true"
          >
            {icons[toast.type]}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{toast.title}</p>
            {toast.message && <p className="text-sm text-white/90 mt-0.5">{toast.message}</p>}
          </div>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors focus-ring"
            aria-label={`Dismiss ${toast.title}`}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      ))}
    </div>
  )
}
