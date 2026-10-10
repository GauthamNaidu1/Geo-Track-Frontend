import { useSelector } from 'react-redux'
import type { RootState } from '../../store'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatRole(role: string): string {
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function EmployeeProfile() {
  const user = useSelector((state: RootState) => state.auth.user)

  return (
    <div className="w-full flex justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl space-y-6">
        {/* Embossed Header Banner */}
        <div className="skeuo-page-header">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            My Profile
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Your personal information and company role
          </p>
        </div>

        {/* Tactile Skeuomorphic Card */}
        <div className="skeuo-panel overflow-hidden">
          {/* Avatar & Identity Header */}
          <div
            className="flex flex-col items-center px-6 py-8 border-b border-slate-300"
            style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)' }}
          >
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: '2px solid rgba(255,255,255,0.85)',
                boxShadow: '0 4px 12px rgba(29,78,216,0.35), inset 0 1px 1px rgba(255,255,255,0.6)',
              }}
            >
              {user?.name ? getInitials(user.name) : '??'}
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-800">
              {user?.name ?? 'Unknown User'}
            </h2>
            <span className="mt-2 badge-blue">
              {user?.role ? formatRole(user.role) : 'Employee'}
            </span>
          </div>

          {/* Detailed Info Fields */}
          <div className="divide-y divide-slate-200">
            <ProfileField label="Full Name" value={user?.name ?? '—'} />
            <ProfileField label="Email Address" value={user?.email ?? '—'} />
            <ProfileField
              label="Role"
              value={user?.role ? formatRole(user.role) : '—'}
            />
            <ProfileField label="Employee ID" value={user?.employeeCode ?? (user?.id ? 'EMP-' + user.id.slice(0, 6).toUpperCase() : '—')} />
            <ProfileField label="Department" value={user?.departmentName ?? '—'} />
            <ProfileField label="Primary Office" value={user?.officeName ?? '—'} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between bg-white/60">
      <dt className="text-sm font-semibold text-slate-600">
        {label}
      </dt>
      <dd className="text-sm font-bold text-slate-800">{value}</dd>
    </div>
  )
}
