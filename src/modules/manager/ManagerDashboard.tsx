import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import api from '../../services/api'
import { useSocket } from '../../hooks/useSocket'
import { useEffect, useState } from 'react'
import AddEmployeeModal from '../../shared/components/AddEmployeeModal'

export default function ManagerDashboard() {
  const queryClient = useQueryClient()
  const { on } = useSocket()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    // Listen for events that should invalidate team data
    const unsubCheckin = on('attendance:checkin', () => {
      queryClient.invalidateQueries(['teamStatus'])
    })
    
    const unsubCheckout = on('attendance:checkout', () => {
      queryClient.invalidateQueries(['teamStatus'])
    })

    const unsubLeave = on('leave:status-changed', () => {
      queryClient.invalidateQueries(['teamStatus'])
      queryClient.invalidateQueries(['pendingLeaves'])
    })

    return () => {
      unsubCheckin()
      unsubCheckout()
      unsubLeave()
    }
  }, [on, queryClient])

  const { data: teamStatusData } = useQuery({
    queryKey: ['teamStatus'],
    queryFn: async () => {
      const res = await api.get('/dashboard/team-status')
      return res.data
    },
  })

  const { data: pendingLeavesData } = useQuery({
    queryKey: ['pendingLeaves'],
    queryFn: async () => {
      const res = await api.get('/leave/requests?status=pending')
      return res.data
    },
  })

  const { data: teamWorkLogsData } = useQuery({
    queryKey: ['teamWorkLogs'],
    queryFn: async () => {
      const res = await api.get('/work-logs/team?limit=5')
      return res.data
    },
  })

  const handleExport = async () => {
    try {
      const response = await api.get('/analytics/export?type=attendance', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `team-attendance-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Export failed', error)
    }
  }

  const summary = teamStatusData?.summary || { checkedIn: 0, checkedOut: 0, onLeave: 0, absent: 0 }
  const totalTeam = teamStatusData?.total || 0
  const pendingLeavesCount = pendingLeavesData?.requests?.length || 0
  const recentWorkLogs = teamWorkLogsData?.workLogs || []
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Team Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Monitor your team's activity
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            <span className="text-lg">➕</span>
            Add Team Member
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <span className="text-lg">📥</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard title="Team Present" value={summary.checkedIn.toString()} color="green" icon="✅" to="/m/team-attendance?filter=present" />
        <StatsCard title="Pending Approvals" value={pendingLeavesCount.toString()} color="amber" icon="⏳" to="/m/approvals" />
        <StatsCard title="On Leave" value={summary.onLeave.toString()} color="blue" icon="🏖️" to="/m/team-attendance?filter=leave" />
        <StatsCard title="Total Team" value={totalTeam.toString()} color="slate" icon="👥" to="/m/team-attendance" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending Leave Approvals */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Leave Approvals
            </h2>
            <Link
              to="/m/approvals"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              View All →
            </Link>
          </div>
          <div className="px-6 py-6 text-center">
            {pendingLeavesCount > 0 ? (
              <div className="space-y-4">
                <span className="text-3xl">📝</span>
                <p className="mt-3 text-sm text-amber-600 dark:text-amber-400 font-medium">
                  You have {pendingLeavesCount} pending leave {pendingLeavesCount === 1 ? 'request' : 'requests'}
                </p>
                <Link
                  to="/m/approvals"
                  className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  Review Approvals
                </Link>
              </div>
            ) : (
              <div>
                <span className="text-3xl">📋</span>
                <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
                  No pending leave requests
                </p>
                <Link
                  to="/m/approvals"
                  className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  View Leave History
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Team Activity */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Team Activity
            </h2>
            <Link
              to="/m/productivity"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              View Analytics →
            </Link>
          </div>
          <div className="px-6 py-4">
            {recentWorkLogs.length > 0 ? (
              <div className="space-y-4">
                {recentWorkLogs.map((log: any) => (
                  <div key={log.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0 dark:border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.employee.name}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2 dark:text-slate-300">
                      {log.workSummary}
                    </p>
                    {log.blockers && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        <span className="font-semibold">Blocker:</span> {log.blockers}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <span className="text-3xl">📊</span>
                <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
                  No recent team activity
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddEmployeeModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          queryClient.invalidateQueries(['teamStatus'])
        }} 
      />
    </div>
  )
}

function StatsCard({
  title,
  value,
  color,
  icon,
  to,
}: {
  title: string
  value: string
  color: 'green' | 'amber' | 'blue' | 'slate'
  icon: string
  to: string
}) {
  const bgMap = {
    green: 'bg-green-50 dark:bg-green-900/20',
    amber: 'bg-amber-50 dark:bg-amber-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    slate: 'bg-slate-50 dark:bg-slate-700/30',
  }

  const textMap = {
    green: 'text-green-700 dark:text-green-400',
    amber: 'text-amber-700 dark:text-amber-400',
    blue: 'text-blue-700 dark:text-blue-400',
    slate: 'text-slate-700 dark:text-slate-300',
  }

  return (
    <Link
      to={to}
      className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${bgMap[color]}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 transition-colors group-hover:text-gray-700 dark:group-hover:text-slate-300">
            {title}
          </p>
          <p className={`text-xl font-bold ${textMap[color]}`}>{value}</p>
        </div>
      </div>
    </Link>
  )
}
