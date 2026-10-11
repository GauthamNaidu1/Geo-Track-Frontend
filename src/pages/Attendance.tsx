import { useState, useEffect } from 'react'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import { SkeletonPanel } from '../components/SkeletonLoader'
import Spinner from '../components/Spinner'
import { useToast } from '../context/ToastContext'

interface Office {
  id: string
  name: string
}

export default function Attendance() {
  const toast = useToast()
  const [offices, setOffices] = useState<Office[]>([])
  const [selectedOffice, setSelectedOffice] = useState('')
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchOffices(), checkStatus()])
      setInitialLoading(false)
    }
    init()
    getCurrentLocation()
  }, [])

  const fetchOffices = async () => {
    try {
      const response = await api.get('/offices')
      setOffices(response.data.offices)
      if (response.data.offices.length > 0) {
        setSelectedOffice(response.data.offices[0].id)
      }
    } catch {
      toast.error('Failed to load offices')
    }
  }

  const checkStatus = async () => {
    try {
      const response = await api.get('/attendance/status')
      setIsCheckedIn(response.data.isCheckedIn)
    } catch {
      /* non-critical */
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      setLocating(false)
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLocating(false)
        setError('')
      },
      () => {
        setError('Unable to get your location. Please enable GPS.')
        setLocating(false)
      }
    )
  }

  const handleCheckIn = async () => {
    if (!location) {
      setError('Location not available. Please enable GPS.')
      return
    }

    setLoading(true)
    setError('')
    const previous = isCheckedIn
    setIsCheckedIn(true)

    try {
      const response = await api.post('/attendance/checkin', {
        officeId: selectedOffice,
        latitude: location.latitude,
        longitude: location.longitude,
      })
      toast.success('Checked in', response.data.message)
    } catch (err: unknown) {
      setIsCheckedIn(previous)
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg = axiosErr.response?.data?.message || 'Check-in failed'
      setError(msg)
      toast.error('Check-in failed', msg)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true)
    setError('')
    const previous = isCheckedIn
    setIsCheckedIn(false)

    try {
      const response = await api.post('/attendance/checkout', {
        latitude: location?.latitude,
        longitude: location?.longitude,
      })
      toast.success('Checked out', response.data.message)
    } catch (err: unknown) {
      setIsCheckedIn(previous)
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg = axiosErr.response?.data?.message || 'Check-out failed'
      setError(msg)
      toast.error('Check-out failed', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Attendance"
        description="Check in and out using GPS verification"
      />

      {error && <div className="alert-error" role="alert">{error}</div>}

      {initialLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonPanel />
          <SkeletonPanel />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="card p-5 sm:p-6" aria-labelledby="checkin-heading">
            <h2 id="checkin-heading" className="text-xl font-semibold text-text-primary dark:text-white mb-4">
              {isCheckedIn ? 'Check Out' : 'Check In'}
            </h2>

            {!isCheckedIn && (
              <div className="mb-4">
                <label htmlFor="office-select" className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                  Select Office
                </label>
                <select
                  id="office-select"
                  value={selectedOffice}
                  onChange={(e) => setSelectedOffice(e.target.value)}
                  className="input"
                >
                  {offices.length === 0 ? (
                    <option value="">No offices configured</option>
                  ) : (
                    <>
                      <option value="">Select an office</option>
                      {offices.map((office) => (
                        <option key={office.id} value={office.id}>
                          {office.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm text-text-secondary dark:text-slate-400 mb-2">Current Location</p>
              {locating ? (
                <Spinner size="sm" label="Getting GPS location…" />
              ) : location ? (
                <p className="text-sm font-mono text-text-primary dark:text-white break-all">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              ) : (
                <p className="text-sm text-red-600 dark:text-red-400">Location not available</p>
              )}
              <button
                type="button"
                onClick={getCurrentLocation}
                className="mt-2 text-sm text-primary hover:underline focus-ring rounded min-h-[44px]"
              >
                Refresh location
              </button>
            </div>

            <button
              type="button"
              onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
              disabled={loading || !location || (!isCheckedIn && !selectedOffice)}
              className={`w-full btn ${isCheckedIn ? 'btn-danger' : 'btn-primary'}`}
              aria-busy={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                  Processing…
                </span>
              ) : isCheckedIn ? (
                'Check Out'
              ) : (
                'Check In'
              )}
            </button>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="status-heading">
            <h2 id="status-heading" className="text-xl font-semibold text-text-primary dark:text-white mb-4">
              Status
            </h2>
            <dl className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-text-secondary dark:text-slate-400">Attendance</dt>
                <dd>
                  <span className={isCheckedIn ? 'badge-success' : 'badge-neutral'}>
                    {isCheckedIn ? 'Checked In' : 'Not Checked In'}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-text-secondary dark:text-slate-400">GPS</dt>
                <dd>
                  <span className={location ? 'badge-success' : 'badge-danger'}>
                    {locating ? 'Locating…' : location ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </div>
  )
}
