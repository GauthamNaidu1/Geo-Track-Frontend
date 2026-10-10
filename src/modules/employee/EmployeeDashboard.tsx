import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import type { RootState } from '../../store'
import api from '../../services/api'
import UserManual from '../../shared/components/UserManual'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function EmployeeDashboard() {
  const user = useSelector((state: RootState) => state.auth.user)
  const [isManualOpen, setIsManualOpen] = useState(false)

  useEffect(() => {
    const hasSeenManual = localStorage.getItem(`hasSeenManual_${user?.id}`)
    if (!hasSeenManual && user?.id) {
      setIsManualOpen(true)
      localStorage.setItem(`hasSeenManual_${user.id}`, 'true')
    }
  }, [user?.id])

  const { data: historyData } = useQuery({
    queryKey: ['checkInHistory', user?.id],
    queryFn: async () => {
      const res = await api.get('/dashboard/history', { params: { days: 1 } })
      return res.data
    },
    enabled: !!user?.id,
  })

  const { data: leavesData } = useQuery({
    queryKey: ['leaveRequests', user?.id],
    queryFn: async () => {
      const res = await api.get('/leave/requests')
      return res.data
    },
    enabled: !!user?.id,
  })

  const { data: workLogsData } = useQuery({
    queryKey: ['workLogs', user?.id],
    queryFn: async () => {
      const res = await api.get('/work-logs')
      return res.data
    },
    enabled: !!user?.id,
  })

  let hoursToday = '0.0'
  if (historyData?.history?.length > 0) {
    const todayLog = historyData.history[0]
    if (todayLog.duration) {
      hoursToday = (todayLog.duration / 60).toFixed(1)
    } else if (todayLog.checkinTime) {
      const diffMins = Math.floor(
        (new Date().getTime() - new Date(todayLog.checkinTime).getTime()) / (1000 * 60)
      )
      hoursToday = (diffMins / 60).toFixed(1)
    }
  }

  const leavesCount = leavesData?.leaveRequests?.length ?? leavesData?.requests?.length ?? 0
  const workLogsCount = workLogsData?.logs?.length ?? 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-4xl">
      {/* Greeting Header */}
      <div
        className="rounded-xl px-6 py-5"
        style={{
          background: 'linear-gradient(160deg, #f8fafc 0%, #e2e8f0 100%)',
          border: '1px solid rgba(255,255,255,0.9)',
          borderBottom: '2px solid #94a3b8',
          boxShadow: '0 4px 12px -4px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,1)',
        }}
      >
        <h1
          className="text-2xl font-bold text-slate-800 tracking-tight"
        >
          {getGreeting()}, {user?.name ?? 'Employee'} 👋
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-600">
          Here's your daily overview
        </p>
      </div>

      {/* Check-in Banner */}
      <Link
        to="/e/attendance"
        className="block rounded-xl text-white transition-transform hover:-translate-y-0.5"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          border: '1px solid #3730a3',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 20px -4px rgba(79,70,229,0.6), 0 4px 8px -2px rgba(0,0,0,0.3)',
          padding: '20px 24px',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Attendance
            </h2>
            <p className="mt-0.5 text-sm font-medium text-indigo-100">
              Tap to check in or check out for today
            </p>
          </div>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-2xl flex-shrink-0"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            🕐
          </div>
        </div>
      </Link>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard title="Hours Today" value={hoursToday} icon="⏱️" />
        <StatsCard title="Leave Requests" value={leavesCount.toString()} icon="🏖️" />
        <StatsCard title="Total Work Logs" value={workLogsCount.toString()} icon="📝" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QuickAction
            to="/e/attendance"
            label="Check In"
            description="Record your attendance"
            icon="✅"
          />
          <QuickAction
            to="/e/leaves/request"
            label="Request Leave"
            description="Submit a leave application"
            icon="📋"
          />
          <QuickAction
            to="/e/work-logs"
            label="Write Work Log"
            description="Log your daily activities"
            icon="✏️"
          />
          <button
            onClick={() => setIsManualOpen(true)}
            className="flex items-center gap-4 rounded-xl text-left transition-transform hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 50%, #e8edf4 100%)',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow:
                '0 4px 8px -2px rgba(0,0,0,0.14), 0 2px 4px -2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)',
              padding: '14px 16px',
            }}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-lg text-xl flex-shrink-0"
              style={{
                background: 'linear-gradient(180deg, #ede9fe 0%, #ddd6fe 100%)',
                border: '1px solid #c4b5fd',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 3px rgba(0,0,0,0.1)',
              }}
            >
              📖
            </span>
            <div>
              <p className="font-bold text-slate-800">
                User Guide
              </p>
              <p className="text-xs font-medium text-slate-500">Learn how to use Geo-Track</p>
            </div>
          </button>
        </div>
      </div>

      <UserManual isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
    </div>
  )
}

function StatsCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: string
}) {
  return (
    <div
      className="rounded-xl"
      style={{
        background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 50%, #e8edf4 100%)',
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow:
          '0 6px 12px -3px rgba(0,0,0,0.14), 0 2px 4px -2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)',
        padding: '20px',
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-800 tracking-tight">
            {value}
          </p>
        </div>
        <span
          className="text-2xl"
          style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.12))' }}
        >
          {icon}
        </span>
      </div>
    </div>
  )
}

function QuickAction({
  to,
  label,
  description,
  icon,
}: {
  to: string
  label: string
  description: string
  icon: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-xl transition-transform hover:-translate-y-0.5"
      style={{
        background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 50%, #e8edf4 100%)',
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow:
          '0 4px 8px -2px rgba(0,0,0,0.14), 0 2px 4px -2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)',
        padding: '14px 16px',
      }}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-lg text-xl flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, #ede9fe 0%, #ddd6fe 100%)',
          border: '1px solid #c4b5fd',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 3px rgba(0,0,0,0.1)',
        }}
      >
        {icon}
      </span>
      <div>
        <p className="font-bold text-slate-800">
          {label}
        </p>
        <p className="text-xs font-medium text-slate-500">{description}</p>
      </div>
    </Link>
  )
}
