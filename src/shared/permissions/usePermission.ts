import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import type { UserRole } from './roles'
import { canAccess } from './roles'

export function usePermission() {
  const user = useSelector((state: RootState) => state.auth.user)
  const role = (user?.role ?? 'employee') as UserRole

  // Role identity booleans
  const isEmployee = role === 'employee'
  const isManager = role === 'manager'
  const isAdmin = role === 'org_admin'

  // Capability booleans
  const canManageEmployees = canAccess(role, 'org_admin')
  const canApproveLeaves = canAccess(role, 'manager')
  const canManageOffices = canAccess(role, 'org_admin')
  const canViewLiveDashboard = canAccess(role, 'org_admin')

  return {
    role,
    isEmployee,
    isManager,
    isAdmin,
    canManageEmployees,
    canApproveLeaves,
    canManageOffices,
    canViewLiveDashboard,
  } as const
}
