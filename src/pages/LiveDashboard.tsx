import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { useSocket } from '../hooks/useSocket'
import api from '../services/api'

interface DashboardStats {
  totalEmployees: number
  checkedIn: number
  checkedOut: number
  onLeave: number
  absent: number
}

interface LiveAttendanceItem {
  logId: string
  employee: {
    id: string
    name: string
    email: string
    employeeCode: string
    department?: {
      name: string
    }
  }
  office: string
  checkinTime: string
  checkoutTime?: string
  status: 'checked-in' | 'checked-out'
  distance?: number
  duration: number
}

interface CheckInEvent {
  employeeId: string
  employeeName: string
  officeName: string
  checkinTime: string
  distance: number
}

interface CheckOutEvent {
  employeeId: string
  employeeName: string
  officeName: string
  checkoutTime: string
  duration: number
}

interface Notification {
  id: string
  type: 'checkin' | 'checkout' | 'notification'
  message: string
  timestamp: Date
  cleared?: boolean
}

export default function LiveDashboard() {
  const user = useSelector((state: RootState) => state.auth.user)
  const { isConnected, on, subscribe } = useSocket()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [liveAttendance, setLiveAttendance] = useState<LiveAttendanceItem[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [error, setError] = useState('')
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-clear notifications after 5 seconds
  useEffect(() => {
    if (notifications.length > 0 && !notifications[notifications.length - 1].cleared) {
      notificationTimeoutRef.current = setTimeout(() => {
        setNotifications((prev) =>
          prev.map((n, i) => (i === prev.length - 1 ? { ...n, cleared: true } : n))
        )
      }, 5000)
    }
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
    }
  }, [notifications])

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsRes, attendanceRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/live-attendance'),
        ])
        setStats(statsRes.data)
        setLiveAttendance(attendanceRes.data.liveAttendance)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Setup Socket.IO listeners
  useEffect(() => {
    if (!user) return

    // Subscribe to dashboard events
    subscribe(user.organizationId || '')

    // Handle check-in events
    const unsubCheckIn = on('attendance:checkin', (data: CheckInEvent) => {
      setNotifications((prev) => [
        ...prev,
        {
          id: `${Date.now()}-checkin`,
          type: 'checkin',
          message: `${data.employeeName} checked in at ${data.officeName}`,
          timestamp: new Date(),
        },
      ])

      // Update stats
      setStats((prev) =>
        prev
          ? {
              ...prev,
              checkedIn: prev.checkedIn + 1,
            }
          : null
      )
    })

    // Handle check-out events
    const unsubCheckOut = on('attendance:checkout', (data: CheckOutEvent) => {
      setNotifications((prev) => [
        ...prev,
        {
          id: `${Date.now()}-checkout`,
          type: 'checkout',
          message: `${data.employeeName} checked out after ${data.duration} minutes`,
          timestamp: new Date(),
        },
      ])

      // Update stats
      setStats((prev) =>
        prev
          ? {
              ...prev,
              checkedIn: Math.max(0, prev.checkedIn - 1),
              checkedOut: prev.checkedOut + 1,
            }
          : null
      )
    })

    return () => {
      unsubCheckIn()
      unsubCheckOut()
    }
  }, [user, on, subscribe])

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary dark:text-white">
              Live Dashboard
            </h1>
            <p className="text-text-secondary dark:text-slate-400 mt-1">
              Real-time attendance monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            ></span>
            <span className="text-sm text-text-secondary dark:text-slate-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Real-time Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6 space-y-2">
          {notifications
            .filter((n) => !n.cleared)
            .slice(-3)
            .map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-lg border ${
                  notif.type === 'checkin'
                    ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
                    : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
                }`}
                style={{
                  animation: 'slideIn 0.3s ease-out',
                }}
              >
                <div className="flex justify-between items-start">
                  <span>{notif.message}</span>
                  <span className="text-xs opacity-70">{formatTime(notif.timestamp.toISOString())}</span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
            <p className="text-xs text-text-secondary dark:text-slate-400 mb-1">Total Employees</p>
            <p className="text-2xl font-bold text-text-primary dark:text-white">
              {stats.totalEmployees}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 shadow-sm border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-600 dark:text-green-300 mb-1">Checked In</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-200">
              {stats.checkedIn}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-600 dark:text-blue-300 mb-1">Checked Out</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">
              {stats.checkedOut}
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 shadow-sm border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-600 dark:text-yellow-300 mb-1">On Leave</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-200">
              {stats.onLeave}
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 shadow-sm border border-red-200 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-300 mb-1">Absent</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-200">
              {stats.absent}
            </p>
          </div>
        </div>
      )}

      {/* Live Attendance List */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary dark:text-white mb-4">
          Live Attendance ({liveAttendance.length})
        </h2>

        {liveAttendance.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
            <p className="text-text-secondary dark:text-slate-400">No attendance records for today</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-slate-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-slate-400 uppercase tracking-wider">
                    Office
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-slate-400 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-slate-400 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-slate-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {liveAttendance.map((item) => (
                  <tr
                    key={item.logId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-text-primary dark:text-white">
                          {item.employee.name}
                        </div>
                        <div className="text-sm text-text-secondary dark:text-slate-400">
                          {item.employee.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary dark:text-white">
                      {item.office}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary dark:text-white">
                      {formatTime(item.checkinTime)}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary dark:text-white">
                      {item.checkoutTime ? formatTime(item.checkoutTime) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary dark:text-white">
                      {item.duration} min
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.status === 'checked-in'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.status === 'checked-in' ? 'Active' : 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
