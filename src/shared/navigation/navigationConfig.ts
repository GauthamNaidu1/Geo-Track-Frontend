export interface NavItem {
  label: string
  path: string
  icon: string
  section?: string
  badge?: boolean
}

// ── Employee Navigation ──────────────────────────────────────────────
export const EMPLOYEE_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/e', icon: '🏠' },
  { label: 'Attendance', path: '/e/attendance', icon: '📋' },
  { label: 'My Leaves', path: '/e/leaves', icon: '🏖️' },
  { label: 'Work Logs', path: '/e/work-logs', icon: '📝' },
  { label: 'Profile', path: '/e/profile', icon: '👤' },
]

// ── Manager Navigation ───────────────────────────────────────────────
export const MANAGER_NAV: NavItem[] = [
  { label: 'Team Dashboard', path: '/m', icon: '📊' },
  { label: 'Team Attendance', path: '/m/team-attendance', icon: '✅' },
  { label: 'Leave Approvals', path: '/m/approvals', icon: '📩', badge: true },
  { label: 'Productivity', path: '/m/productivity', icon: '📈' },
]

// ── Organization Admin Navigation ────────────────────────────────────
export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: '📊', section: 'Overview' },
  { label: 'Live Monitor', path: '/admin/live', icon: '🔴', section: 'Overview' },
  { label: 'Employees', path: '/admin/employees', icon: '👥', section: 'Workforce' },
  { label: 'Offices', path: '/admin/offices', icon: '🏢', section: 'Workforce' },
  { label: 'Attendance', path: '/admin/attendance', icon: '📋', section: 'Operations' },
  { label: 'Leave Management', path: '/admin/leave-management', icon: '📅', section: 'Operations' },
  { label: 'Settings', path: '/admin/settings', icon: '⚙️', section: 'Configuration' },
]

// End of navigation
