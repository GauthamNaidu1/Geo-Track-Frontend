import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import { SkeletonStatCards, SkeletonPanel } from '../components/SkeletonLoader'
import { useSocket } from '../hooks/useSocket'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

interface DashboardStats {
  totalEmployees: number
  checkedIn: number
  checkedOut: number
  onLeave: number
  absent: number
}

interface LiveAttendance {
  logId: string
  employee: { id: string; name: string }
  office: string
  checkinTime: string
  status: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<LiveAttendance[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const { on, subscribe } = useSocket()
  const user = useSelector((state: RootState) => state.auth.user)

  // Subscribe to organization room for socket events
  useEffect(() => {
    if (user?.organizationId) {
      subscribe(user.organizationId)
    }
  }, [user?.organizationId, subscribe])

  // Listen for socket events
  useEffect(() => {
    const unsubStats = on('dashboard:stats-updated', (newStats: any) => {
      setStats((prev) => prev ? { ...prev, ...newStats } as DashboardStats : newStats as DashboardStats)
    })

    const unsubCheckin = on('attendance:checkin', (data) => {
      setActivity((prev) => {
        const newActivity = {
          logId: `live-${Date.now()}`,
          employee: { id: data.employeeId, name: data.employeeName },
          office: data.officeName,
          checkinTime: data.checkinTime,
          status: 'checked-in'
        }
        return [newActivity, ...prev].slice(0, 5)
      })
    })

    return () => {
      unsubStats()
      unsubCheckin()
    }
  }, [on])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsRes, liveRes, auditRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/live-attendance'),
          (user?.role === 'org_admin')
            ? api.get('/dashboard/audit-logs?limit=5').catch(() => ({ data: { logs: [] } }))
            : Promise.resolve({ data: { logs: [] } })
        ])
        setStats(statsRes.data)
        setActivity((liveRes.data.liveAttendance || []).slice(0, 5))
        setAuditLogs(auditRes.data.logs || [])
        setError('')
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } } }
        setError(axiosErr.response?.data?.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = stats
    ? [
        { label: 'Present Today', value: stats.checkedIn, className: 'stat-card-green border' },
        { label: 'Absent Today', value: stats.absent, className: 'stat-card-red border' },
        { label: 'On Leave', value: stats.onLeave, className: 'stat-card-yellow border' },
        { label: 'Checked Out', value: stats.checkedOut, className: 'stat-card-orange border' },
      ]
    : []

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return new Date(dateString).toLocaleDateString()
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/analytics/export?type=attendance', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `org-attendance-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Export failed', error)
    }
  }

  return (
    <div className="page-container">
      <div className="skeuo-page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Dashboard"
          description="Overview of today's attendance and activity"
        />
        <button
          onClick={handleExport}
          className="btn-secondary inline-flex items-center gap-2 h-10"
        >
          <span className="text-lg">📥</span>
          Export CSV
        </button>
      </div>

      {error && (
        <div className="alert-error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <>
          <SkeletonStatCards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <SkeletonPanel />
            </div>
            <SkeletonPanel />
          </div>
        </>
      ) : (
        <>
          <section aria-label="Today's statistics">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {statCards.map((stat) => (
                <article
                  key={stat.label}
                  className={`${stat.className} rounded-xl p-5 sm:p-6 transition-transform hover:-translate-y-1 duration-200`}
                >
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">{stat.label}</p>
                  <p className="text-4xl font-black text-slate-800 dark:text-white">{stat.value}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 skeuo-panel overflow-hidden" aria-label="Recent activity">
              <div className="skeuo-panel-header">🕐 Recent Activity</div>
              <div className="p-5 sm:p-6">
              {activity.length === 0 ? (
                <p className="text-sm font-semibold text-slate-500 py-4">
                  No check-ins recorded today yet.
                </p>
              ) : (
                <ul className="space-y-4">
                  {activity.map((item) => (
                    <li
                      key={item.logId}
                  className="flex items-center justify-between gap-4 pb-4 last:pb-0"
                  style={{ borderBottom: '1px solid #cbd5e1' }}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {item.employee.name} checked in
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                          {item.office} · {formatTimeAgo(item.checkinTime)}
                        </p>
                      </div>
                      <span className="badge-success flex-shrink-0">Check-in</span>
                    </li>
                  ))}
                </ul>
              )}
              </div>
            </section>

            <section className="skeuo-panel overflow-hidden" aria-label="Quick actions">
              <div className="skeuo-panel-header">⚡ Quick Actions</div>
              <div className="p-5 sm:p-6 space-y-3">
                <Link to="/admin/live" className="btn-primary w-full">
                  Live Monitor
                </Link>
                <Link to="/admin/attendance" className="btn-secondary w-full">
                  View Attendance
                </Link>
                <Link to="/admin/employees/new" className="btn-secondary w-full">
                  Add Employee
                </Link>
              </div>
            </section>
            
            {(user?.role === 'org_admin') && (
              <section className="lg:col-span-3 skeuo-panel overflow-hidden mt-6" aria-label="Platform Activity">
                <div className="skeuo-panel-header">📋 Platform Activity</div>
                <div className="p-5 sm:p-6">
                {auditLogs.length === 0 ? (
                  <p className="text-sm text-text-secondary dark:text-slate-400 py-4">
                    No recent platform activity.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {auditLogs.map((log) => (
                      <li
                        key={log.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary dark:text-white truncate">
                            <span className="font-bold">{log.employee?.name || 'System'}</span> performed <span className="text-indigo-600 dark:text-indigo-400 font-bold">{log.action}</span> on <span className="font-semibold">{log.entityType}</span>
                          </p>
                          <p className="text-xs text-text-secondary dark:text-slate-400 mt-1">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                          {log.details && (
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded">
                              {log.details}
                            </p>
                          )}
                        </div>
                        <span className="badge-primary flex-shrink-0">Audit Log</span>
                      </li>
                    ))}
                  </ul>
                )}
                </div>
              </section>
            )}
          </div>
        </>
      )}
    </div>
  )
}
