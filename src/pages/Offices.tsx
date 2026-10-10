import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import api from '../services/api'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { SkeletonCards } from '../components/SkeletonLoader'
import { useToast } from '../context/ToastContext'

interface Office {
  id: string
  name: string
  latitude: number
  longitude: number
  radiusMeters: number
  timezone: string
  _count?: { attendanceLogs: number }
}

export default function Offices() {
  const user = useSelector((state: RootState) => state.auth.user)
  const toast = useToast()
  const [offices, setOffices] = useState<Office[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const canManageOffices = ['super_admin', 'org_admin'].includes(user?.role || '')

  useEffect(() => {
    fetchOffices()
  }, [])

  const fetchOffices = async () => {
    try {
      setLoading(true)
      const response = await api.get('/offices')
      setOffices(response.data.offices)
      setError('')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message || 'Failed to load offices')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    const previous = offices
    setOffices((list) => list.filter((o) => o.id !== id))
    setDeletingId(id)

    try {
      await api.delete(`/offices/${id}`)
      toast.success('Office deleted', `${name} was removed.`)
    } catch (err: unknown) {
      setOffices(previous)
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error('Delete failed', axiosErr.response?.data?.message || 'Could not delete office')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Offices"
        description="Manage office locations and geofences"
        action={
          canManageOffices ? (
            <Link to="/offices/new" className="btn-primary w-full sm:w-auto">
              + Add Office
            </Link>
          ) : undefined
        }
      />

      {error && <div className="alert-error" role="alert">{error}</div>}

      {loading ? (
        <SkeletonCards count={6} />
      ) : offices.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-text-secondary dark:text-slate-400 mb-4">No offices found</p>
          {canManageOffices && (
            <Link to="/offices/new" className="btn-primary inline-flex">
              Add Your First Office
            </Link>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" aria-label="Office list">
          {offices.map((office) => (
            <li
              key={office.id}
              className="card p-5 sm:p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start gap-2 mb-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-text-primary dark:text-white truncate">
                    {office.name}
                  </h3>
                  <p className="text-sm text-text-secondary dark:text-slate-400">{office.timezone}</p>
                </div>
                <span className="badge-success flex-shrink-0">Active</span>
              </div>

              <dl className="space-y-2 mb-4 text-sm">
                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <dt className="text-text-secondary dark:text-slate-400 sm:w-24">Location</dt>
                  <dd className="text-text-primary dark:text-white font-mono text-xs break-all">
                    {office.latitude.toFixed(6)}, {office.longitude.toFixed(6)}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-text-secondary dark:text-slate-400 w-24">Geofence</dt>
                  <dd className="text-text-primary dark:text-white">{office.radiusMeters}m radius</dd>
                </div>
                {office._count && (
                  <div className="flex gap-2">
                    <dt className="text-text-secondary dark:text-slate-400 w-24">Logs</dt>
                    <dd className="text-text-primary dark:text-white">
                      {office._count.attendanceLogs} records
                    </dd>
                  </div>
                )}
              </dl>

              {canManageOffices && (
                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Link
                    to={`/offices/${office.id}/edit`}
                    className="btn-secondary flex-1 text-center"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(office.id, office.name)}
                    disabled={deletingId === office.id}
                    className="btn-danger flex-1"
                    aria-label={`Delete ${office.name}`}
                  >
                    {deletingId === office.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
