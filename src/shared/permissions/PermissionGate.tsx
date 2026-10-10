import { type ReactNode } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import type { UserRole } from './roles'
import { canAccess } from './roles'

interface PermissionGateProps {
  requires: UserRole
  children: ReactNode
  fallback?: ReactNode
}

export default function PermissionGate({
  requires,
  children,
  fallback = null,
}: PermissionGateProps) {
  const userRole = useSelector(
    (state: RootState) => state.auth.user?.role
  ) as UserRole | undefined

  if (!userRole || !canAccess(userRole, requires)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
