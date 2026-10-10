import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import api from '../services/api'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { SkeletonTable } from '../components/SkeletonLoader'

interface LeaveRequest {
  id: string
  startDate: string
  endDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  leaveType: { id: string; name: string }
  employee: { id: string; name: string; email: string; employeeCode: string }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function Leave() {
  const user = useSelector((state: RootState) => state.auth.user)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const canApproveLeave = ['org_admin', 'super_admin', 'manager'].includes(user?.role || '')
  const showEmployeeColumn = user?.role !== 'employee'

  const getReviewUrl = (requestId: string) => {
    if (user?.role === 'manager') return `/m/approvals/${requestId}`
    if (user?.role === 'org_admin' || user?.role === 'super_admin') return `/admin/leave-management/${requestId}`
    return `/leave/approval/${requestId}`
  }

  useEffect(() => {
    fetchLeaveRequests()
  }, [pagination.page, statusFilter])

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true)
      const response = await api.get('/leave/requests', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: statusFilter,
        },
      })
      setLeaveRequests(response.data.leaveRequests)
      setPagination(response.data.pagination)
      setError('')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message || 'Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }

  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleQuickApprove = async (id: string) => {
    try {
      setActionLoading(id)
      await api.put(`/leave/requests/${id}/approve`)
      fetchLeaveRequests()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve leave request')
    } finally {
      setActionLoading(null)
    }
  }

  const handleQuickReject = async (id: string) => {
    try {
      setActionLoading(id)
      await api.put(`/leave/requests/${id}/reject`, { reason: 'Rejected by administrator' })
      fetchLeaveRequests()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject leave request')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
    }
    return map[status] || 'badge-neutral'
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Leave Management"
        description={
          user?.role === 'employee'
            ? 'Request and track your leaves'
            : 'Manage and approve leave requests'
        }
        action={
          <Link to="/leave/request" className="btn-primary w-full sm:w-auto">
            + Request Leave
          </Link>
        }
      />

      <div className="mb-6">
        <label htmlFor="status-filter" className="block text-sm font-medium text-text-primary dark:text-white mb-2">
          Filter by status
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPagination((p) => ({ ...p, page: 1 }))
          }}
          className="input max-w-xs"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && <div className="alert-error" role="alert">{error}</div>}

      {loading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : leaveRequests.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-text-secondary dark:text-slate-400">No leave requests found</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="md:hidden space-y-4 mb-6" aria-label="Leave requests">
            {leaveRequests.map((request) => (
              <li key={request.id} className="card p-4">
                {showEmployeeColumn && (
                  <p className="font-medium text-text-primary dark:text-white mb-1">{request.employee.name}</p>
                )}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="text-sm text-text-secondary dark:text-slate-400">{request.leaveType.name}</span>
                  <span className={statusBadge(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-text-primary dark:text-white">
                  {formatDate(request.startDate)} – {formatDate(request.endDate)}
                </p>
                {request.reason && (
                  <p className="text-sm text-text-secondary dark:text-slate-400 mt-2 line-clamp-2">{request.reason}</p>
                )}
                {canApproveLeave && request.status === 'pending' && (
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <Link
                      to={getReviewUrl(request.id)}
                      className="btn-primary flex-1 text-center text-xs py-2"
                    >
                      Review Request
                    </Link>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickApprove(request.id)}
                        disabled={actionLoading === request.id}
                        className="px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:translate-y-px rounded-lg flex-1 text-center"
                      >
                        {actionLoading === request.id ? '...' : '✓ Approve'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickReject(request.id)}
                        disabled={actionLoading === request.id}
                        className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 hover:bg-rose-100 rounded-lg flex-1 text-center"
                      >
                        {actionLoading === request.id ? '...' : '✕ Reject'}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden md:block card overflow-x-auto">
            <table className="w-full" aria-label="Leave requests">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  {showEmployeeColumn && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-slate-400 uppercase">Employee</th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-slate-400 uppercase">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-slate-400 uppercase">Dates</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-slate-400 uppercase">Reason</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-slate-400 uppercase">Status</th>
                  {canApproveLeave && (
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary dark:text-slate-400 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {leaveRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    {showEmployeeColumn && (
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-text-primary dark:text-white">{request.employee.name}</div>
                        <div className="text-sm text-text-secondary dark:text-slate-400">{request.employee.email}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-text-primary dark:text-white">{request.leaveType.name}</td>
                    <td className="px-6 py-4 text-sm text-text-primary dark:text-white">
                      {formatDate(request.startDate)}
                      <span className="block text-xs text-text-secondary dark:text-slate-400">to {formatDate(request.endDate)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary dark:text-white max-w-xs truncate">{request.reason || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={statusBadge(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    {canApproveLeave && (
                      <td className="px-6 py-4 text-right">
                        {request.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={getReviewUrl(request.id)}
                              className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg shadow-xs hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 transition-all inline-flex items-center gap-1"
                            >
                              <span>Review</span>
                              <span>→</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleQuickApprove(request.id)}
                              disabled={actionLoading === request.id}
                              className="px-2.5 py-1.5 text-xs font-bold text-white bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:translate-y-px rounded-lg shadow-[0_2px_4px_rgba(16,185,129,0.3)] border border-emerald-600 disabled:opacity-50 inline-flex items-center gap-1 transition-all"
                              title="Quick Approve"
                            >
                              {actionLoading === request.id ? '...' : '✓'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickReject(request.id)}
                              disabled={actionLoading === request.id}
                              className="px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900 active:translate-y-px rounded-lg disabled:opacity-50 inline-flex items-center gap-1 transition-all"
                              title="Quick Reject"
                            >
                              {actionLoading === request.id ? '...' : '✕'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-text-secondary dark:text-slate-500 text-sm font-medium">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4" aria-label="Pagination">
            <p className="text-sm text-text-secondary dark:text-slate-400">
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="btn-secondary flex-1 sm:flex-none"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="btn-secondary flex-1 sm:flex-none"
              >
                Next
              </button>
            </div>
          </nav>
        </>
      )}
    </div>
  )
}
