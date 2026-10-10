import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import NotificationBell from './NotificationBell'
import DarkModeToggle from './DarkModeToggle'

interface NavbarProps {
  onMenuOpen: () => void
}

export default function Navbar({ onMenuOpen }: NavbarProps) {
  const user = useSelector((state: RootState) => state.auth.user)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null)
      })
    }
  }

  return (
    <header 
      className="bg-gradient-to-b from-gray-100 to-gray-300 dark:from-slate-700 dark:to-slate-900 border-b-2 border-gray-400 dark:border-slate-950 shadow-md px-4 sm:px-6 py-3 flex justify-between items-center gap-2 relative z-20"
      style={{ boxShadow: '0 4px 10px -2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)' }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onMenuOpen}
          className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus-ring"
          aria-label="Open navigation menu"
        >
          <svg className="w-6 h-6 text-text-primary dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg sm:text-xl font-semibold text-text-primary dark:text-white truncate lg:hidden">
          GeoTrack
        </h1>
        <h1 className="hidden lg:block text-xl font-semibold text-text-primary dark:text-white">
          GeoTrack
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-200 dark:border-indigo-800"
          >
            📱 Install App
          </button>
        )}
        <DarkModeToggle />
        <NotificationBell />
        <span className="hidden sm:inline text-sm text-text-secondary dark:text-slate-400 truncate max-w-[120px]">
          {user?.name || 'User'}
        </span>
        <div
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm flex-shrink-0"
          role="img"
          aria-label={`Profile: ${user?.name || 'User'}`}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  )
}
