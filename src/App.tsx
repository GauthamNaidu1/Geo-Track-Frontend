import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { useEffect, useState, lazy, Suspense } from 'react'
import store, { RootState } from './store'
import { setUser, setToken } from './store/authSlice'
import { authService } from './services/authService'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import RoleRedirect from './shared/components/RoleRedirect'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import ErrorBoundary from './shared/components/ErrorBoundary'

// Lazy-loaded layouts (code-split by role)
const EmployeeLayout = lazy(() => import('./layouts/EmployeeLayout'))
const ManagerLayout = lazy(() => import('./layouts/ManagerLayout'))
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))

// Lazy-loaded Employee module pages
const EmployeeDashboard = lazy(() => import('./modules/employee/EmployeeDashboard'))
const EmployeeAttendance = lazy(() => import('./modules/employee/EmployeeAttendance'))
const EmployeeLeaves = lazy(() => import('./modules/employee/EmployeeLeaves'))
const EmployeeWorkLogs = lazy(() => import('./modules/employee/EmployeeWorkLogs'))
const EmployeeProfile = lazy(() => import('./modules/employee/EmployeeProfile'))

// Lazy-loaded Manager module pages
const ManagerDashboard = lazy(() => import('./modules/manager/ManagerDashboard'))
const TeamAttendance = lazy(() => import('./modules/manager/TeamAttendance'))
const LeaveApprovals = lazy(() => import('./modules/manager/LeaveApprovals'))
const TeamProductivity = lazy(() => import('./modules/manager/TeamProductivity'))

// Lazy-loaded Admin module pages
const AdminDashboard = lazy(() => import('./modules/admin/AdminDashboard'))
const AdminEmployees = lazy(() => import('./modules/admin/AdminEmployees'))
const AdminOffices = lazy(() => import('./modules/admin/AdminOffices'))
const AdminAttendance = lazy(() => import('./modules/admin/AdminAttendance'))
const AdminLeaveManagement = lazy(() => import('./modules/admin/AdminLeaveManagement'))
const AdminSettings = lazy(() => import('./modules/admin/AdminSettings'))
const AdminGeneralSettings = lazy(() => import('./modules/admin/settings/AdminGeneralSettings'))
const AdminDepartments = lazy(() => import('./modules/admin/settings/AdminDepartments'))
const AdminShifts = lazy(() => import('./modules/admin/settings/AdminShifts'))
const AdminLeaveTypes = lazy(() => import('./modules/admin/settings/AdminLeaveTypes'))

// Shared pages (used across modules, eagerly imported)
import LeaveForm from './pages/LeaveForm'
import LeaveApproval from './pages/LeaveApproval'
import EmployeeForm from './pages/EmployeeForm'
import OfficeForm from './pages/OfficeForm'

const queryClient = new QueryClient()

import { useParams } from 'react-router-dom'

function EmployeeEditRedirect() {
  const { id } = useParams()
  return <Navigate to={`/admin/employees/${id}/edit`} replace />
}

function OfficeEditRedirect() {
  const { id } = useParams()
  return <Navigate to={`/admin/offices/${id}/edit`} replace />
}

function LeaveApprovalRedirect() {
  const { id } = useParams()
  return <Navigate to={`/m/approvals/${id}`} replace />
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary dark:text-slate-400">Loading...</p>
      </div>
    </div>
  )
}

function AppContent() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated on mount
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const user = await authService.getCurrentUser()
          dispatch(setUser(user))
          const token = authService.getAccessToken()
          if (token) {
            dispatch(setToken(token))
          }
        } catch (error) {
          console.error('Failed to load user:', error)
          // Token might be expired, will redirect to login
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [dispatch])

  if (loading) {
    return <LoadingFallback />
  }

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* ─── Public ─────────────────────────────────────── */}
          <Route
            path="/login"
            element={isAuthenticated ? <RoleRedirect /> : <Login />}
          />

          {/* ─── Employee Routes (/e/*) ─────────────────────── */}
          <Route
            path="/e"
            element={
              <ProtectedRoute allowedRoles={['employee', 'manager', 'org_admin', 'super_admin']}>
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmployeeDashboard />} />
            <Route path="attendance" element={<EmployeeAttendance />} />
            <Route path="leaves" element={<EmployeeLeaves />} />
            <Route path="leaves/request" element={<LeaveForm />} />
            <Route path="work-logs" element={<EmployeeWorkLogs />} />
            <Route path="profile" element={<EmployeeProfile />} />
          </Route>

          {/* ─── Manager Routes (/m/*) ──────────────────────── */}
          <Route
            path="/m"
            element={
              <ProtectedRoute allowedRoles={['manager', 'org_admin', 'super_admin']}>
                <ManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ManagerDashboard />} />
            <Route path="team-attendance" element={<TeamAttendance />} />
            <Route path="approvals" element={<LeaveApprovals />} />
            <Route path="approvals/:id" element={<LeaveApproval />} />
            <Route path="productivity" element={<TeamProductivity />} />
          </Route>

          {/* ─── Org Admin Routes (/admin/*) ─────────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['org_admin', 'super_admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="employees/new" element={<EmployeeForm />} />
            <Route path="employees/:id/edit" element={<EmployeeForm />} />
            <Route path="offices" element={<AdminOffices />} />
            <Route path="offices/new" element={<OfficeForm />} />
            <Route path="offices/:id/edit" element={<OfficeForm />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="live" element={<AdminAttendance />} />
            <Route path="leave-management" element={<AdminLeaveManagement />} />
            <Route path="leave-management/:id" element={<LeaveApproval />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="settings/general" element={<AdminGeneralSettings />} />
            <Route path="settings/departments" element={<AdminDepartments />} />
            <Route path="settings/shifts" element={<AdminShifts />} />
            <Route path="settings/leave-types" element={<AdminLeaveTypes />} />
          </Route>

          {/* ─── Legacy Route Redirects ──────────────────────── */}
          {/* Redirect old flat routes to role-based paths */}
          <Route path="/" element={
            isAuthenticated ? <RoleRedirect /> : <Navigate to="/login" replace />
          } />
          <Route path="/attendance" element={<Navigate to="/e/attendance" replace />} />
          <Route path="/dashboard/live" element={<Navigate to="/admin/live" replace />} />
          <Route path="/employees" element={<Navigate to="/admin/employees" replace />} />
          <Route path="/employees/new" element={<Navigate to="/admin/employees/new" replace />} />
          <Route path="/employees/:id/edit" element={<EmployeeEditRedirect />} />
          <Route path="/offices" element={<Navigate to="/admin/offices" replace />} />
          <Route path="/offices/new" element={<Navigate to="/admin/offices/new" replace />} />
          <Route path="/offices/:id/edit" element={<OfficeEditRedirect />} />
          <Route path="/leave" element={<Navigate to="/e/leaves" replace />} />
          <Route path="/leave/request" element={<Navigate to="/e/leaves/request" replace />} />
          <Route path="/leave/approval/:id" element={<LeaveApprovalRedirect />} />
          <Route path="/work-logs" element={<Navigate to="/e/work-logs" replace />} />

          {/* ─── 404 ─────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}

export default App
