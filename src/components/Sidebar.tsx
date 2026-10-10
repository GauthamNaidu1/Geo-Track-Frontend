import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { logout } from '../store/authSlice'
import { authService } from '../services/authService'
import { NAV_ITEMS } from '../constants/navigation'

export default function Sidebar() {
  const user = useSelector((state: RootState) => state.auth.user)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogout = async () => {
    try {
      await authService.logout()
      dispatch(logout())
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      dispatch(logout())
      navigate('/login')
    }
  }

  return (
    <aside
      className="hidden lg:flex w-64 flex-col bg-gradient-to-r from-gray-50 to-gray-200 dark:from-slate-800 dark:to-slate-900 border-r-2 border-gray-400 dark:border-slate-950 shadow-[4px_0_10px_rgba(0,0,0,0.2)] z-10 p-6 overflow-y-auto"
      style={{ boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.5), 4px 0 15px -3px rgba(0,0,0,0.3)' }}
      aria-label="Sidebar navigation"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary">GeoTrack</h2>
        <p className="text-xs text-text-secondary dark:text-slate-400 mt-1">
          GPS Attendance System
        </p>
      </div>

      <nav className="space-y-1 flex-1" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 min-h-[44px] px-4 py-2 rounded-lg transition-colors focus-ring ${
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 font-medium'
                  : 'text-text-primary dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-lg" aria-hidden="true">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-text-secondary dark:text-slate-400 mb-1 truncate">
          {user?.name || 'User'}
        </p>
        <p className="text-xs text-text-secondary dark:text-slate-400 mb-3 capitalize">
          Role: {user?.role?.replace('_', ' ') || 'Employee'}
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full min-h-[44px] px-4 py-2 text-sm text-text-primary dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left focus-ring"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
