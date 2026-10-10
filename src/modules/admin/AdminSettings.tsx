import { Link } from 'react-router-dom'

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Organization Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Configure your organization's preferences and policies
        </p>
      </div>

      {/* Settings Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SettingsCard
          title="General Settings"
          description="Organization name, timezone, working hours, and general configuration"
          icon="⚙️"
          to="/admin/settings/general"
        />
        <SettingsCard
          title="Departments"
          description="Manage departments, teams, and organizational hierarchy"
          icon="🏢"
          to="/admin/settings/departments"
        />
        <SettingsCard
          title="Shifts"
          description="Define work shifts, schedules, and shift rotation policies"
          icon="🕐"
          to="/admin/settings/shifts"
        />
        <SettingsCard
          title="Leave Types"
          description="Configure leave categories, quotas, and accrual policies"
          icon="📅"
          to="/admin/settings/leave-types"
        />
      </div>
    </div>
  )
}

function SettingsCard({
  title,
  description,
  icon,
  to,
}: {
  title: string
  description: string
  icon: string
  to: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-2xl dark:bg-indigo-900/30">
          {icon}
        </span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {description}
          </p>
          <Link
            to={to}
            className="mt-4 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            Configure
          </Link>
        </div>
      </div>
    </div>
  )
}
