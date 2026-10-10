import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import MobileMenu from './MobileMenu'
import PageTransition from './PageTransition'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const openMobileMenu = useCallback(() => setMobileMenuOpen(true), [])
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), [])

  return (
    <div className="flex h-screen bg-background dark:bg-slate-900">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar />
      <MobileMenu isOpen={mobileMenuOpen} onClose={closeMobileMenu} navItems={[]} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar onMenuOpen={openMobileMenu} />
        <main id="main-content" className="flex-1 overflow-auto" tabIndex={-1}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
