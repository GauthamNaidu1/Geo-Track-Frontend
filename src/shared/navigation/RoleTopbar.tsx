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
      className="flex items-center justify-between px-4 h-16 relative z-20"
      
    >
      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all duration-100"
          
          aria-label="Open navigation menu"
          onMouseDown={(e) => {
            const el = e.currentTarget
            el.style.transform = 'translateY(1px)'
            el.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'
          }}
          onMouseUp={(e) => {
            const el = e.currentTarget
            el.style.transform = ''
            el.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 4px rgba(0,0,0,0.15)'
          }}
        >
          <svg
            className="w-6 h-6 text-slate-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h2 className="text-base font-bold text-slate-800 lg:hidden">
          {title}
        </h2>
        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-sm" />
          <span>Portal Connected</span>
        </div>
      </div>

      {/* Right: user info + dark mode + notifications */}
      <div className="flex items-center gap-2">
        <span
          className="hidden sm:inline text-sm font-bold text-slate-600 truncate max-w-[120px]"
          style={{ textShadow: '0 1px 0 rgba(255,255,255,0.9)' }}
        >
          {user?.name || 'User'}
        </span>
        <DarkModeToggle />
        <NotificationBell />
        <div
          className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0"
          role="img"
          aria-label={`Profile: ${user?.name || 'User'}`}
          
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  )
}
