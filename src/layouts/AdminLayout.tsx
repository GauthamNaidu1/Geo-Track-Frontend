import { useState, useCallback } from 'react'
import { Outlet, Link } from 'react-router-dom'
import RoleSidebar from '../shared/navigation/RoleSidebar'
import RoleTopbar from '../shared/navigation/RoleTopbar'
import { ADMIN_NAV } from '../shared/navigation/navigationConfig'
import MobileMenu from '../components/MobileMenu'
import PageTransition from '../components/PageTransition'

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), [])
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), [])

  return (
    <div className="flex h-screen" style={{ background: 'radial-gradient(ellipse at 50% 0%, #e2e8f0 0%, #cbd5e1 100%)' }}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Wider desktop sidebar for grouped nav */}
      <div className="hidden lg:block">
        <div className="w-72">
          <RoleSidebar
            navItems={ADMIN_NAV}
            title="GeoTrack"
            subtitle="Admin Console"
            accentColor="border-l-indigo-500"
          >
            {/* Switch to employee view */}
            <Link
              to="/e"
              className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Switch to Employee View
            </Link>
          </RoleSidebar>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={closeMobileMenu} navItems={ADMIN_NAV}>
        <Link
          to="/e"
          className="flex items-center gap-3 min-h-[44px] px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Switch to Employee View
        </Link>
      </MobileMenu>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <RoleTopbar title="Admin Console" onMenuOpen={openMobileMenu} />
        <main id="main-content" className="flex-1 overflow-auto" tabIndex={-1}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
