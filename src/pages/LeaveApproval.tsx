import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import api from '../services/api'

interface LeaveRequest {
  id: string
  startDate: string
  endDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  leaveType: {
    id?: string
    name: string
  }
  employee: {
    id?: string
    name: string
    email: string
    employeeCode?: string
    manager?: {
      id?: string
      name: string
    }
  }
}

export default function LeaveApproval() {
  const navigate = useNavigate()
  const { id: requestId } = useParams()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [leaveRequest, setLeaveRequest] = useState<LeaveRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  const user = useSelector((state: RootState) => state.auth.user)

  const getReturnPath = () => {
    if (user?.role === 'manager') return '/m/approvals'
    if (user?.role === 'org_admin' || user?.role === 'super_admin') return '/admin/leave-management'
    return '/leave'
  }

  useEffect(() => {
    if (requestId) {
      fetchLeaveRequest()
    }
  }, [requestId])

  const fetchLeaveRequest = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/leave/requests/${requestId}`)
      const data = response.data.leaveRequest || response.data
      setLeaveRequest(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load leave request')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return days
  }

  const handleApprove = async () => {
    if (!requestId) return

    try {
      setSubmitting(true)
      setError('')
      await api.put(`/leave/requests/${requestId}/approve`)
      setSuccess('Leave request approved successfully!')
      setTimeout(() => {
        navigate(getReturnPath())
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve leave request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!requestId) return

    try {
      setSubmitting(true)
      setError('')
      await api.put(`/leave/requests/${requestId}/reject`, {
        reason: rejectionReason,
      })
      setSuccess('Leave request rejected successfully!')
      setTimeout(() => {
        navigate(getReturnPath())
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject leave request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading leave request...</p>
        </div>
      </div>
    )
  }

  if (!leaveRequest) {
    return (
      <div className="w-full flex justify-center p-8">
        <div className="text-center py-12 max-w-md w-full skeuo-panel p-8">
          <p className="text-red-600 font-bold text-lg mb-2">Leave request not found</p>
          <p className="text-slate-500 text-sm mb-6">The requested leave application may have been removed or does not exist.</p>
          <button
            onClick={() => navigate(getReturnPath())}
            className="btn-primary w-full"
          >
            Back to Leave Requests
          </button>
        </div>
      </div>
    )
  }

  if (leaveRequest.status !== 'pending') {
    return (
      <div className="w-full flex justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="text-center py-12 skeuo-panel p-8">
            <p className="text-slate-800 font-bold text-lg mb-2">
              This leave request has already been{' '}
              <span className={
                leaveRequest.status === 'approved'
                  ? 'text-emerald-600 font-extrabold uppercase'
                  : 'text-red-600 font-extrabold uppercase'
              }>
                {leaveRequest.status}
              </span>
            </p>
            <p className="text-slate-500 text-sm mb-6">No further action is required for this request.</p>
            <button
              onClick={() => navigate(getReturnPath())}
              className="btn-primary"
            >
              Back to Leave Requests
            </button>
          </div>
        </div>
      </div>
    )
  }

  const daysRequested = calculateDays(leaveRequest.startDate, leaveRequest.endDate)

  return (
    <div className="w-full flex justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl space-y-6">
        {/* Embossed Page Header */}
        <div className="skeuo-page-header">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Review Leave Request
          </h1>
          <p className="text-slate-600 font-medium mt-1 text-sm">
            Review employee details and approve or reject the leave application
          </p>
        </div>

        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert-success">
            {success}
          </div>
        )}

        {/* Leave Request Details Panel */}
        <div className="skeuo-panel overflow-hidden">
          {/* Header */}
          <div className="skeuo-panel-header">
            Employee Information
          </div>
          
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/60">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee Name</p>
              <p className="font-bold text-slate-800 text-base mt-0.5">
                {leaveRequest.employee.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee Code</p>
              <p className="font-bold text-slate-800 text-base mt-0.5">
                {leaveRequest.employee.employeeCode || 'EMP-001'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</p>
              <p className="font-medium text-slate-700 text-sm mt-0.5">
                {leaveRequest.employee.email}
              </p>
            </div>
            {leaveRequest.employee.manager && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reporting Manager</p>
                <p className="font-medium text-slate-700 text-sm mt-0.5">
                  {leaveRequest.employee.manager.name}
                </p>
              </div>
            )}
          </div>

          {/* Leave Details Sub-header */}
          <div className="skeuo-panel-header border-t border-slate-300">
            Leave Details
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/60">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leave Type</p>
              <p className="font-bold text-blue-700 text-base mt-0.5">
                {leaveRequest.leaveType.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</p>
              <p className="font-bold text-slate-800 text-base mt-0.5">
                {daysRequested} {daysRequested === 1 ? 'day' : 'days'}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Period</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                {formatDate(leaveRequest.startDate)} — {formatDate(leaveRequest.endDate)}
              </p>
            </div>
            {leaveRequest.reason && (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason Provided</p>
                <p className="mt-1 p-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-sm font-medium whitespace-pre-wrap">
                  {leaveRequest.reason}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rejection Form (if showing) */}
        {showRejectForm && (
          <div className="p-5 rounded-xl border border-red-300 bg-red-50/80 shadow-sm space-y-3">
            <h3 className="font-bold text-red-900 text-sm">
              Reason for Rejection
            </h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State the reason why this leave cannot be approved..."
              rows={3}
              className="w-full px-4 py-2.5 border border-red-300 rounded-lg bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleApprove}
            disabled={submitting}
            className="btn flex-1 text-white bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 border-emerald-900 font-bold text-base py-3"
          >
            {submitting ? 'Processing...' : '✓ Approve Leave'}
          </button>
          {!showRejectForm ? (
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={submitting}
              className="btn-danger flex-1 font-bold text-base py-3"
            >
              ✗ Reject Leave
            </button>
          ) : (
            <>
              <button
                onClick={handleReject}
                disabled={submitting || !rejectionReason.trim()}
                className="btn-danger flex-1 font-bold text-base py-3"
              >
                {submitting ? 'Processing...' : 'Confirm Rejection'}
              </button>
              <button
                onClick={() => {
                  setShowRejectForm(false)
                  setRejectionReason('')
                }}
                disabled={submitting}
                className="btn-secondary font-bold text-base py-3 px-6"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate(getReturnPath())}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← Back to Leave Requests
          </button>
        </div>
      </div>
    </div>
  )
}
