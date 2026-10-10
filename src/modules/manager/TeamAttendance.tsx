import { useState } from 'react'
import { useQuery } from 'react-query'
import { useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'
import { SkeletonCards } from '../../components/SkeletonLoader'
import { useSocket } from '../../hooks/useSocket'
import { useEffect } from 'react'
import { useQueryClient } from 'react-query'

export default function TeamAttendance() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filterParam = searchParams.get('filter') || 'all'
  const [filter, setFilter] = useState(filterParam)
  
  const queryClient = useQueryClient()
  const { on } = useSocket()

  useEffect(() => {
    // Listen for live attendance events
    const unsubCheckin = on('attendance:checkin', () => {
      queryClient.invalidateQueries(['teamStatus'])
    })
    const unsubCheckout = on('attendance:checkout', () => {
      queryClient.invalidateQueries(['teamStatus'])
    })
    const unsubLeave = on('leave:status-changed', () => {
      queryClient.invalidateQueries(['teamStatus'])
    })

    return () => {
      unsubCheckin()
      unsubCheckout()
      unsubLeave()
    }
  }, [on, queryClient])

  // Update URL search params when filter changes
  useEffect(() => {
    if (filter === 'all') {
      searchParams.delete('filter')
    } else {
      searchParams.set('filter', filter)
    }
    setSearchParams(searchParams, { replace: true })
  }, [filter, searchParams, setSearchParams])

  const { data, isLoading, error } = useQuery({
    queryKey: ['teamStatus'],
    queryFn: async () => {
      const res = await api.get('/dashboard/team-status')
      return res.data
    },
  })

  if (error) {
    return (
      <div className="page-container">
        <PageHeader title="Team Attendance" description="Today's team roster and status" />
        <div className="alert-error" role="alert">Failed to load team status</div>
      </div>
    )
  }

  const teamStatus = data?.teamStatus || []
  
  const filteredTeam = teamStatus.filter((member: any) => {
    if (filter === 'present') return member.status === 'checked-in' || member.status === 'checked-out'
    if (filter === 'leave') return member.status === 'on-leave'
    if (filter === 'absent') return member.status === 'absent'
    return true
  })

  const formatTime = (isoString?: string) => {
    if (!isoString) return '-'
    return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Team Attendance Roster"
        description="Monitor your team's real-time check-in status and login times."
      />

      {/* Filters */}
      <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-slate-700 pb-4">
        {[
          { id: 'all', label: 'All Team' },
          { id: 'present', label: 'Present Today' },
          { id: 'absent', label: 'Absent' },
          { id: 'leave', label: 'On Leave' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              filter === f.id
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SkeletonCards count={4} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Employee
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Login Time
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Logout Time
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Office / Leave
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
                {filteredTeam.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-slate-400">
                      No team members found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredTeam.map((member: any) => (
                    <tr key={member.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/30">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold dark:bg-indigo-900/40 dark:text-indigo-300">
                            {member.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">
                              {member.employeeCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            member.status === 'checked-in'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : member.status === 'checked-out'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : member.status === 'on-leave'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {member.status === 'checked-in' ? 'Present (Active)' : 
                           member.status === 'checked-out' ? 'Checked Out' : 
                           member.status === 'on-leave' ? 'On Leave' : 'Absent'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-slate-300 font-medium">
                        {member.attendance?.checkinTime ? formatTime(member.attendance.checkinTime) : '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                        {member.attendance?.checkoutTime ? formatTime(member.attendance.checkoutTime) : '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                        {member.attendance?.office && (
                          <span className="flex items-center gap-1"><span className="text-xs">🏢</span> {member.attendance.office}</span>
                        )}
                        {member.leave?.type && (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><span className="text-xs">🏖️</span> {member.leave.type}</span>
                        )}
                        {!member.attendance?.office && !member.leave?.type && '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
