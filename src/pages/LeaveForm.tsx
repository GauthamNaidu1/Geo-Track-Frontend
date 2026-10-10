import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import api from '../services/api'

interface LeaveType {
  id: string
  name: string
  allowedDays: number
}

interface LeaveBalance {
  leaveTypeId: string
  leaveTypeName: string
  allowedDays: number
  usedDays: number
  pendingDays: number
  availableDays: number
}

export default function LeaveForm() {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([])
  const [balanceLoading, setBalanceLoading] = useState(true)

  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  })

  const [selectedLeaveBalance, setSelectedLeaveBalance] = useState<LeaveBalance | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchLeaveTypesAndBalance()
    }
  }, [user?.id])

  const fetchLeaveTypesAndBalance = async () => {
    try {
      setBalanceLoading(true)
      
      // Fetch leave types
      const typesResponse = await api.get('/leave-types')
      const rawTypes = typesResponse.data.leaveTypes || []
      const mappedTypes = rawTypes.map((t: any) => ({
        id: t.id,
        name: t.name,
        allowedDays: t.daysAllowed ?? t.allowedDays ?? 0,
      }))
      setLeaveTypes(mappedTypes)

      // Fetch leave balance
      if (user?.id) {
        try {
          const balanceResponse = await api.get(`/leave/balance/${user?.id}`)
          const rawBalances = balanceResponse.data.balances || []
          const mappedBalances = rawBalances.map((b: any) => ({
            leaveTypeId: b.leaveTypeId,
            leaveTypeName: b.name ?? b.leaveTypeName ?? '',
            allowedDays: b.totalDays ?? b.allowedDays ?? 0,
            usedDays: b.usedDays ?? 0,
            pendingDays: b.pendingDays ?? 0,
            availableDays: b.availableDays ?? 0,
          }))
          setLeaveBalance(mappedBalances)
        } catch (bErr) {
          console.warn('Failed to load leave balances:', bErr)
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load leave types')
    } finally {
      setBalanceLoading(false)
    }
  }

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return Math.max(0, days)
  }

  const handleLeaveTypeChange = (leaveTypeId: string) => {
    setFormData({ ...formData, leaveTypeId })
    const balance = leaveBalance.find((b) => b.leaveTypeId === leaveTypeId)
    setSelectedLeaveBalance(balance || null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate
    if (!formData.leaveTypeId || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields')
      return
    }

    const daysRequested = calculateDays(formData.startDate, formData.endDate)
    
    if (selectedLeaveBalance && daysRequested > selectedLeaveBalance.availableDays) {
      setError(
        `Insufficient leave balance. Requested: ${daysRequested}, Available: ${selectedLeaveBalance.availableDays}`
      )
      return
    }

    try {
      setLoading(true)
      await api.post('/leave/request', {
        leaveTypeId: formData.leaveTypeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      })
      setSuccess('Leave request submitted successfully!')
      setTimeout(() => {
        navigate('/leave')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit leave request')
    } finally {
      setLoading(false)
    }
  }

  if (balanceLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary dark:text-slate-400">Loading leave information...</p>
        </div>
      </div>
    )
  }

  const daysRequested = calculateDays(formData.startDate, formData.endDate)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary dark:text-white">
          Request Leave
        </h1>
        <p className="text-text-secondary dark:text-slate-400 mt-1">
          Submit a new leave request
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Leave Type */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
            Leave Type <span className="text-red-500">*</span>
          </label>
          <select
            name="leaveTypeId"
            value={formData.leaveTypeId}
            onChange={(e) => handleLeaveTypeChange(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a leave type</option>
            {leaveTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Leave Balance */}
        {selectedLeaveBalance && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-text-primary dark:text-white mb-3">Leave Balance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-text-secondary dark:text-slate-400">Total Days</p>
                <p className="text-lg font-bold text-primary">{selectedLeaveBalance.allowedDays}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary dark:text-slate-400">Used Days</p>
                <p className="text-lg font-bold text-red-600">{selectedLeaveBalance.usedDays}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary dark:text-slate-400">Pending Days</p>
                <p className="text-lg font-bold text-yellow-600">{selectedLeaveBalance.pendingDays}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary dark:text-slate-400">Available Days</p>
                <p className={`text-lg font-bold ${
                  selectedLeaveBalance.availableDays > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedLeaveBalance.availableDays}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Days Summary */}
        {daysRequested > 0 && (
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <p className="text-sm text-text-secondary dark:text-slate-300">
              Total days requested: <span className="font-bold text-text-primary dark:text-white">{daysRequested}</span>
            </p>
            {selectedLeaveBalance && (
              <p className={`text-sm mt-2 ${
                daysRequested <= selectedLeaveBalance.availableDays
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {daysRequested <= selectedLeaveBalance.availableDays
                  ? `Available: ${selectedLeaveBalance.availableDays} days ✓`
                  : `Insufficient balance. Need ${daysRequested - selectedLeaveBalance.availableDays} more days`}
              </p>
            )}
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
            Reason (Optional)
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            rows={4}
            placeholder="Provide a reason for your leave request..."
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading || balanceLoading}
            className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/leave')}
            className="flex-1 bg-slate-300 dark:bg-slate-600 text-text-primary dark:text-white py-2 rounded-lg hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
