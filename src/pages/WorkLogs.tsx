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
  const isManagerView = ['manager', 'org_admin', 'super_admin'].includes(user?.role || '')

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
    } else if (activeTab === 'team' && isManagerView) {
      fetchTeamLogs()
    }
  }, [activeTab, pagination.page])

  useEffect(() => {
    const unsubNewLog = on('worklog:new' as any, (_data: any) => {
      if (activeTab === 'team' && isManagerView && pagination.page === 1) {
        fetchTeamLogs()
      }
    })

    return () => {
      unsubNewLog()
    }
  }, [on, activeTab, isManagerView, pagination.page])

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
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4"
    >
      {showEmployee && log.employee && (
        <div className="mb-2 pb-2 border-b border-slate-100 dark:border-slate-700">
          <p className="font-medium text-text-primary dark:text-white">{log.employee.name}</p>
          <p className="text-xs text-text-secondary dark:text-slate-400">
            {log.employee.employeeCode} · {log.employee.email}
          </p>
        </div>
      )}
      <p className="text-sm text-text-primary dark:text-white whitespace-pre-wrap">{log.workSummary}</p>
      {log.blockers && (
        <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-200">Blockers</p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">{log.blockers}</p>
        </div>
      )}
      <p className="text-xs text-text-secondary dark:text-slate-500 mt-3">{formatDate(log.createdAt)}</p>
    </div>
  )

  const logs = activeTab === 'team' ? teamLogs : myLogs

  return (
    <div className="page-container">
      <PageHeader
        title="Work Logs"
        description="Submit daily work summaries and track productivity"
      />

      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('submit')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'submit'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary dark:text-slate-400 hover:text-text-primary'
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
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'my'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary dark:text-slate-400 hover:text-text-primary'
          }`}
        >
          My History
        </button>
        {isManagerView && (
          <button
            type="button"
            onClick={() => {
              setActiveTab('team')
              setPagination((p) => ({ ...p, page: 1 }))
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'team'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary dark:text-slate-400 hover:text-text-primary'
            }`}
          >
            Team Logs
          </button>
        )}
      </div>

      {activeTab === 'submit' && (
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            {submitError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm">
                {submitSuccess}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-white mb-1">
                Work Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                value={workSummary}
                onChange={(e) => setWorkSummary(e.target.value)}
                rows={5}
                placeholder="What did you accomplish today?"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-white mb-1">
                Blockers (optional)
              </label>
              <textarea
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                rows={3}
                placeholder="Any obstacles or issues?"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-text-primary dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
