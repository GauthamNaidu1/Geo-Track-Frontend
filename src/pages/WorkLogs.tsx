import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import { SkeletonCards } from '../components/SkeletonLoader'
import { useToast } from '../context/ToastContext'
import { useSocket } from '../hooks/useSocket'

interface WorkLog {
  id: string
  workSummary: string
  blockers: string | null
  filesUrl: string | null
  createdAt: string
  employee?: {
    id: string
    name: string
    email: string
    employeeCode: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function WorkLogs() {
  const user = useSelector((state: RootState) => state.auth.user)
  const toast = useToast()

  const [activeTab, setActiveTab] = useState<'submit' | 'my' | 'team'>('submit')
  const [workSummary, setWorkSummary] = useState('')
  const [blockers, setBlockers] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  const [myLogs, setMyLogs] = useState<WorkLog[]>([])
  const [teamLogs, setTeamLogs] = useState<WorkLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const { on } = useSocket()

  useEffect(() => {
    if (activeTab === 'my') {
      fetchMyLogs()
    } else if (activeTab === 'team') {
      fetchTeamLogs()
    }
  }, [activeTab, pagination.page])

  useEffect(() => {
    const unsubNewLog = on('worklog:new' as any, (_data: any) => {
      if (activeTab === 'team' && pagination.page === 1) {
        fetchTeamLogs()
      }
    })

    return () => {
      unsubNewLog()
    }
  }, [on, activeTab, pagination.page])

  const fetchMyLogs = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/work-logs/my', {
        params: { page: pagination.page, limit: pagination.limit },
      })
      setMyLogs(response.data.workLogs)
      setPagination(response.data.pagination)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message || 'Failed to load work logs')
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamLogs = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/work-logs/team', {
        params: { page: pagination.page, limit: pagination.limit },
      })
      setTeamLogs(response.data.workLogs)
      setPagination(response.data.pagination)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message || 'Failed to load team work logs')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess('')

    if (!workSummary.trim()) {
      setSubmitError('Work summary is required')
      return
    }

    try {
      setSubmitting(true)
      await api.post('/work-logs', {
        workSummary: workSummary.trim(),
        blockers: blockers.trim() || undefined,
      })
      toast.success('Work log submitted', 'Your daily summary has been recorded.')
      setWorkSummary('')
      setBlockers('')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setSubmitError(axiosErr.response?.data?.message || 'Failed to submit work log')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderLogCard = (log: WorkLog, showEmployee = false) => (
    <div
      key={log.id}
      className="bg-white dark:bg-[#0c121e] rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm transition-all"
    >
      {showEmployee && log.employee && (
        <div className="mb-3 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
          <div>
            <p className="font-bold text-slate-900 dark:text-white">
              {log.employee.name} {user?.email === log.employee.email ? '(You)' : ''}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {log.employee.employeeCode} · {log.employee.email}
            </p>
          </div>
          {user?.email === log.employee.email && (
            <span className="badge bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800 text-xs font-bold">
              Your Log
            </span>
          )}
        </div>
      )}
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{log.workSummary}</p>
      {log.blockers && (
        <div className="mt-3 p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 rounded-lg">
          <p className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">Blockers</p>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mt-0.5">{log.blockers}</p>
        </div>
      )}
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 font-semibold">{formatDate(log.createdAt)}</p>
    </div>
  )

  const logs = activeTab === 'team' ? teamLogs : myLogs

  return (
    <div className="page-container">
      <PageHeader
        title="Work Logs"
        description="Submit daily work summaries and track productivity"
      />

      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('submit')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'submit'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Submit Log
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('my')
            setPagination((p) => ({ ...p, page: 1 }))
          }}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'my'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          My History
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('team')
            setPagination((p) => ({ ...p, page: 1 }))
          }}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'team'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Team Logs
        </button>
      </div>

      {activeTab === 'submit' && (
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0c121e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
            {submitError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
                {submitSuccess}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                Work Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                value={workSummary}
                onChange={(e) => setWorkSummary(e.target.value)}
                rows={5}
                placeholder="What did you accomplish today?"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                Blockers (optional)
              </label>
              <textarea
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                rows={3}
                placeholder="Any obstacles or issues?"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full sm:w-auto px-6 py-2.5 disabled:opacity-50 font-bold"
            >
              {submitting ? 'Submitting...' : 'Submit Work Log'}
            </button>
          </form>
        </div>
      )}

      {(activeTab === 'my' || activeTab === 'team') && (
        <div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <SkeletonCards count={3} />
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-text-secondary dark:text-slate-400">
              No work logs found
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl">
              {logs.map((log) => renderLogCard(log, activeTab === 'team'))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-text-secondary dark:text-slate-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
