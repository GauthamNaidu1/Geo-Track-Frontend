import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import DarkModeToggle from '../../components/DarkModeToggle'
import NotificationBell from '../../components/NotificationBell'

interface RoleTopbarProps {
  title: string
  onMenuOpen: () => void
}

export default function RoleTopbar({ title, onMenuOpen }: RoleTopbarProps) {
  const user = useSelector((state: RootState) => state.auth.user)

  return (
    <header
      className="flex items-center justify-between px-6 h-16 relative z-20 bg-white/80 dark:bg-[#0c121e]/80 border-b border-slate-200/90 dark:border-slate-800/90 backdrop-blur-md transition-colors"
    >
      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h2 className="text-base font-bold text-slate-900 dark:text-white lg:hidden">
          {title}
        </h2>
        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-sm animate-pulse" />
          <span>Portal Connected</span>
        </div>
      </div>

      {/* Right: user info + dark mode + notifications */}
      <div className="flex items-center gap-3">
        <span
          className="hidden sm:inline text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]"
        >
          {user?.name || 'User'}
        </span>
        <DarkModeToggle />
        <NotificationBell />
        <div
          className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/20"
          role="img"
          aria-label={`Profile: ${user?.name || 'User'}`}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  )
}
