import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser, setToken } from '../store/authSlice'
import { authService } from '../services/authService'
import DarkModeToggle from '../components/DarkModeToggle'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    if (sessionStorage.getItem('sessionExpired')) {
      setError('Your session has expired. Please log in again.')
      sessionStorage.removeItem('sessionExpired')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authService.login({ email, password })
      dispatch(setUser(response.user))
      dispatch(setToken(response.accessToken))
      navigate('/')
    } catch (err: any) {
      console.error('Login failed:', err)
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)',
      }}
    >
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      <div className="absolute top-4 right-4 z-10">
        <DarkModeToggle />
      </div>

      {/* Login card */}
      <div
        className="relative w-full max-w-md animate-fade-in"
        style={{
          background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 40%, #e2e8f0 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow:
            '0 30px 60px -12px rgba(0,0,0,0.4), 0 18px 36px -18px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,1)',
        }}
      >
        {/* Card header band */}
        <div
          className="rounded-t-2xl px-8 pt-8 pb-6"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
            borderBottom: '1px solid #cbd5e1',
            boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.05)',
          }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold text-lg"
              style={{
                background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                border: '1px solid #1e40af',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 8px rgba(0,0,0,0.3)',
                textShadow: '0 -1px 1px rgba(0,0,0,0.5)',
              }}
            >
              GT
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                GeoTrack
              </h1>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">GPS Attendance System</p>
            </div>
          </div>
        </div>

        {/* Form area */}
        <div className="px-8 py-7">
          {error && (
            <div className="alert-error mb-5" role="alert">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" aria-label="Sign in form">
            <div>
              <label
                htmlFor="email"
                className="block text-sm mb-2 font-medium text-slate-700 dark:text-slate-300"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm mb-2 font-medium text-slate-700 dark:text-slate-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base"
              aria-busy={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                '🔐 Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
