import { useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { logout } from '../store/authSlice'
import { authService } from '../services/authService'
import type { NavItem } from '../shared/navigation/navigationConfig'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navItems: NavItem[]
  children?: React.ReactNode
}

export default function MobileMenu({ isOpen, onClose, navItems, children }: MobileMenuProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const previousFocus = document.activeElement as HTMLElement
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      /* proceed with local logout */
    }
    dispatch(logout())
    navigate('/login')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-label="Close menu"
      />
      <div
        ref={panelRef}
        className="absolute left-0 top-0 h-full w-[min(100%,280px)] flex flex-col animate-slide-in-left"
        
      >
        <div className="flex items-center justify-between p-4" >
          <div>
            <h2 className="text-lg font-bold text-primary">GeoTrack</h2>
            <p className="text-xs text-text-secondary dark:text-slate-400">GPS Attendance</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 focus-ring"
            aria-label="Close navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'))
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 min-h-[44px] px-4 py-2 rounded-lg transition-all duration-100 font-bold text-sm focus-ring`}
                
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="text-lg" aria-hidden="true">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
              </Link>
            )
          })}
          {children && <div className="pt-2">{children}</div>}
        </nav>

        <div
          className="p-4"
          
        >
          <p className="text-sm font-extrabold text-slate-800 dark:text-white truncate">{user?.name}</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize mb-3">
            {user?.role?.replace('_', ' ') || 'Employee'}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full min-h-[44px] px-4 py-2 text-sm font-bold text-left rounded-lg transition-all duration-100 focus-ring text-red-700"
            
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
