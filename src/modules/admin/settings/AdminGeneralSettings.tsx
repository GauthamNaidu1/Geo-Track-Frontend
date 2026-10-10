import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import api from '../../../services/api'
import { useToast } from '../../../context/ToastContext'

export default function AdminGeneralSettings() {
  const { success, error } = useToast()
  const queryClient = useQueryClient()
  
  const [name, setName] = useState('')

  const { data: settings, isLoading } = useQuery({
    queryKey: ['orgSettings'],
    queryFn: async () => {
      const res = await api.get('/organizations/settings')
      return res.data.organization
    },
  })

  useEffect(() => {
    if (settings) {
      setName(settings.name || '')
    }
  }, [settings])

  const mutation = useMutation({
    mutationFn: async (updatedData: { name: string }) => {
      const res = await api.put('/organizations/settings', updatedData)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries('orgSettings')
      success('Settings updated successfully')
    },
    onError: () => {
      error('Failed to update settings')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({ name })
  }

  if (isLoading) return <div className="p-4 text-gray-500">Loading settings...</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link to="/admin/settings" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          ← Back
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            General Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Configure your organization's general information
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
              Organization Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
            >
              {mutation.isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
