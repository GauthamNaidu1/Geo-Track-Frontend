import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import type { UserRole } from '../permissions/roles'
import { ROLE_HOME } from '../permissions/roles'

export default function RoleRedirect() {
  const user = useSelector((state: RootState) => state.auth.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const homePath = ROLE_HOME[user.role as UserRole] ?? '/e'
  return <Navigate to={homePath} replace />
}
