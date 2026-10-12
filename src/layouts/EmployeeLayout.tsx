import { useState, useCallback } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import RoleSidebar from '../shared/navigation/RoleSidebar'
import RoleTopbar from '../shared/navigation/RoleTopbar'
import { EMPLOYEE_NAV } from '../shared/navigation/navigationConfig'
import MobileMenu from '../components/MobileMenu'
import PageTransition from '../components/PageTransition'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { ROLE_HOME } from '../shared/permissions/roles'
import { UserRole } from '../shared/permissions/roles'

function ReturnToAdminLink() {
  const user = useSelector((state: RootState) => state.auth.user)
  
  if (!user || user.role === 'employee') return null

  const targetPath = ROLE_HOME[user.role as UserRole] || '/e'
  if (targetPath === '/e') return null

  return (
    <Link
      to={targetPath}
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
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      Return to {user.role === 'manager' ? 'Manager' : 'Admin'} Console
    </Link>
  )
}

export default function EmployeeLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), [])
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), [])
  const location = useLocation()

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-100">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <RoleSidebar
        navItems={EMPLOYEE_NAV}
        title="GeoTrack"
        subtitle="Employee Portal"
      >
        <ReturnToAdminLink />
      </RoleSidebar>

      {/* Mobile menu overlay */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={closeMobileMenu} navItems={EMPLOYEE_NAV}>
        <ReturnToAdminLink />
      </MobileMenu>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <RoleTopbar title="GeoTrack" onMenuOpen={openMobileMenu} />

        <main
          id="main-content"
          className="flex-1 overflow-auto pb-20 lg:pb-0"
          tabIndex={-1}
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>

      {/* Mobile bottom navigation bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 lg:hidden z-40"
        
        aria-label="Bottom navigation"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {EMPLOYEE_NAV.map((item) => {
            const isActive =
              item.path === '/e'
                ? location.pathname === '/e'
                : location.pathname.startsWith(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <span className="text-xl" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="text-[10px] font-medium leading-tight">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
