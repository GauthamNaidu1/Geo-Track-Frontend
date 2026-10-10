import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import api from '../../../services/api'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/Modal'

interface LeaveType {
  id: string
  name: string
  description?: string
  daysAllowed: number
  requiresApproval: boolean
}

export default function AdminLeaveTypes() {
  const { success, error } = useToast()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null)
  
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [daysAllowed, setDaysAllowed] = useState(0)
  const [requiresApproval, setRequiresApproval] = useState(true)

  const { data: leaveTypes, isLoading } = useQuery<LeaveType[]>({
    queryKey: ['leaveTypes'],
    queryFn: async () => {
      const res = await api.get('/leave-types')
      return res.data.leaveTypes
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<LeaveType>) => {
      if (editingLeaveType) {
        return api.put(`/leave-types/${editingLeaveType.id}`, data)
      } else {
        return api.post('/leave-types', data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries('leaveTypes')
      success(editingLeaveType ? 'Leave Type updated' : 'Leave Type created')
      handleCloseModal()
    },
    onError: () => {
      error('Failed to save leave type')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/leave-types/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries('leaveTypes')
      success('Leave Type deleted')
    },
    onError: () => {
      error('Failed to delete leave type')
    },
  })

  const handleOpenModal = (leaveType?: LeaveType) => {
    if (leaveType) {
      setEditingLeaveType(leaveType)
      setName(leaveType.name)
      setDescription(leaveType.description || '')
      setDaysAllowed(leaveType.daysAllowed)
      setRequiresApproval(leaveType.requiresApproval)
    } else {
      setEditingLeaveType(null)
      setName('')
      setDescription('')
      setDaysAllowed(0)
      setRequiresApproval(true)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLeaveType(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate({ 
      name, 
      description, 
      daysAllowed: Number(daysAllowed),
      requiresApproval 
    })
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this leave type?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/settings" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            ← Back
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Leave Types
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Configure leave categories and quotas
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          + Add Leave Type
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">
                  Quota (Days)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">
                  Approval Needed
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                </tr>
              ) : leaveTypes?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No leave types found</td>
                </tr>
              ) : (
                leaveTypes?.map((lt) => (
                  <tr key={lt.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {lt.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      {lt.daysAllowed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      {lt.requiresApproval ? (
                        <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-500 dark:ring-yellow-500/20">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                          Auto-Approve
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(lt)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(lt.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingLeaveType ? 'Edit Leave Type' : 'Add Leave Type'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Days Allowed (Quota)</label>
            <input
              type="number"
              min="0"
              required
              value={daysAllowed}
              onChange={(e) => setDaysAllowed(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div className="flex items-center">
            <input
              id="requiresApproval"
              type="checkbox"
              checked={requiresApproval}
              onChange={(e) => setRequiresApproval(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:ring-offset-slate-800"
            />
            <label htmlFor="requiresApproval" className="ml-2 block text-sm text-gray-900 dark:text-slate-300">
              Requires Manager Approval
            </label>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="submit"
              disabled={saveMutation.isLoading}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:bg-indigo-400"
            >
              {saveMutation.isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
