import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store'
import { logout } from '../../store/authSlice'
import { authService } from '../../services/authService'
import type { NavItem } from './navigationConfig'
import { ROLE_LABELS } from '../permissions/roles'
import type { UserRole } from '../permissions/roles'

interface RoleSidebarProps {
  navItems: NavItem[]
  title: string
  subtitle: string
  accentColor?: string
  children?: React.ReactNode
}

export default function RoleSidebar({
  navItems,
  title,
  subtitle,
  accentColor,
  children,
}: RoleSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      /* proceed with local logout */
    }
    dispatch(logout())
    navigate('/login')
  }

  // Group items by section if sections exist
  const hasSections = navItems.some((item) => item.section)
  const groupedItems: Record<string, NavItem[]> = {}
  if (hasSections) {
    navItems.forEach((item) => {
      const section = item.section ?? 'General'
      if (!groupedItems[section]) groupedItems[section] = []
      groupedItems[section].push(item)
    })
  }

  const renderNavItem = (item: NavItem) => {
    const isActive =
      item.path === '/'
        ? location.pathname === '/'
        : location.pathname === item.path ||
          (item.path !== '/' && location.pathname.startsWith(item.path + '/'))

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
          isActive
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-sm shadow-blue-500/25'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 font-semibold'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className="text-lg" aria-hidden="true">
          {item.icon}
        </span>
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && (
          <span
            className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"
          />
        )}
      </Link>
    )
  }

  return (
    <aside
      className={`hidden lg:flex flex-col w-64 h-screen bg-white/95 dark:bg-[#0c121e] border-r border-slate-200/90 dark:border-slate-800/90 backdrop-blur-md ${
        accentColor ? `border-l-4 ${accentColor}` : ''
      }`}
    >
      {/* Logo / Title */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 dark:border-slate-800/60">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20">
          GT
        </div>
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{subtitle}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1"
        aria-label="Main navigation"
      >
        {hasSections
          ? Object.entries(groupedItems).map(([section, items]) => (
              <div key={section} className="mb-4">
                <p className="px-3 mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section}
                </p>
                <div className="space-y-1">
                  {items.map(renderNavItem)}
                </div>
              </div>
            ))
          : navItems.map(renderNavItem)}
      </nav>

      {/* Extra links injected by layouts */}
      {children && (
        <div className="px-4 pb-2 space-y-1">{children}</div>
      )}

      {/* User info & Logout */}
      <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {user?.role ? ROLE_LABELS[user.role as UserRole] : 'Employee'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  )
}
