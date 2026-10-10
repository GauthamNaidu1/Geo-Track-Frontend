import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { authService } from '../services/authService'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  // Check if user has valid token
  if (!isAuthenticated && !authService.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  // Check role-based access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-primary mb-4">403</h1>
          <p className="text-2xl text-text-primary dark:text-white mb-2">
            Access Denied
          </p>
          <p className="text-text-secondary dark:text-slate-400 mb-8">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
