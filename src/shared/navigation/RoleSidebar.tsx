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
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-100 ${
          isActive
            ? 'text-blue-800 dark:text-blue-200'
            : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
        style={isActive ? {
          background: 'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 100%)',
          border: '1px solid #93c5fd',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.8)',
        } : {
          background: 'transparent',
          border: '1px solid transparent',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)'
            el.style.border = '1px solid #cbd5e1'
            el.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'transparent'
            el.style.border = '1px solid transparent'
            el.style.boxShadow = 'none'
          }
        }}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className="text-lg" aria-hidden="true">
          {item.icon}
        </span>
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && (
          <span
            className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"
            style={{ boxShadow: '0 0 4px rgba(239,68,68,0.8)' }}
          />
        )}
      </Link>
    )
  }

  return (
    <aside
      className={`hidden lg:flex flex-col w-64 h-screen ${
        accentColor ? `border-l-4 ${accentColor}` : ''
      }`}
      style={{
        background: 'linear-gradient(160deg, #f1f5f9 0%, #e2e8f0 60%, #cbd5e1 100%)',
        borderRight: '2px solid #94a3b8',
        boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.06), 4px 0 18px -4px rgba(0,0,0,0.2)',
      }}
    >
      {/* Logo / Title */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{
          background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
          borderBottom: '1px solid #94a3b8',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1)',
        }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-extrabold text-sm"
          style={{
            background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
            border: '1px solid #1e40af',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 3px 6px rgba(0,0,0,0.3)',
            textShadow: '0 -1px 1px rgba(0,0,0,0.5)',
          }}
        >
          GT
        </div>
        <div>
          <h1
            className="text-base font-extrabold text-slate-800"
            style={{ textShadow: '0 1px 0 rgba(255,255,255,0.9)' }}
          >
            {title}
          </h1>
          <p className="text-xs text-slate-500 font-semibold">{subtitle}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
        aria-label="Main navigation"
      >
        {hasSections
          ? Object.entries(groupedItems).map(([section, items]) => (
              <div key={section} className="mb-4">
                <p
                  className="px-3 mb-2 text-xs font-extrabold uppercase tracking-widest"
                  style={{
                    color: '#64748b',
                    textShadow: '0 1px 0 rgba(255,255,255,0.9)',
                  }}
                >
                  {section}
                </p>
                <div className="space-y-0.5">
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
      <div
        className="px-4 py-4"
        style={{
          borderTop: '1px solid #94a3b8',
          background: 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0"
            style={{
              background: 'linear-gradient(180deg, #6366f1 0%, #4338ca 100%)',
              border: '1px solid #3730a3',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.3)',
              textShadow: '0 -1px 1px rgba(0,0,0,0.5)',
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-extrabold text-slate-800 truncate"
              style={{ textShadow: '0 1px 0 rgba(255,255,255,0.9)' }}
            >
              {user?.name}
            </p>
            <p className="text-xs text-slate-500 font-semibold">
              {user?.role ? ROLE_LABELS[user.role as UserRole] : 'Employee'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-700 rounded-lg transition-all duration-100"
          style={{
            background: 'linear-gradient(180deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #fca5a5',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.12)',
            textShadow: '0 1px 0 rgba(255,255,255,0.8)',
          }}
          onMouseDown={(e) => {
            const el = e.currentTarget
            el.style.transform = 'translateY(1px)'
            el.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'
          }}
          onMouseUp={(e) => {
            const el = e.currentTarget
            el.style.transform = ''
            el.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.12)'
          }}
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
