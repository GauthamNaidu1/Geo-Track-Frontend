import { useQuery } from 'react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect } from 'react'
import { useQueryClient } from 'react-query'
import { useSocket } from '../../hooks/useSocket'
import WorkLogs from '../../pages/WorkLogs'
import api from '../../services/api'

export default function TeamProductivity() {
  const queryClient = useQueryClient()
  const { on } = useSocket()

  const { data: trendsData, isLoading } = useQuery({
    queryKey: ['teamProductivityTrends'],
    queryFn: async () => {
      const res = await api.get('/dashboard/team-productivity-trends')
      return res.data
    },
  })

  const { data: teamStatusData } = useQuery({
    queryKey: ['teamStatus'],
    queryFn: async () => {
      const res = await api.get('/dashboard/team-status')
      return res.data
    },
  })

  useEffect(() => {
    // When someone checks out, their total hours for the day is finalized
    // We should refetch the trends
    const unsubCheckout = on('attendance:checkout', () => {
      queryClient.invalidateQueries(['teamProductivityTrends'])
      queryClient.invalidateQueries(['teamStatus'])
    })
    
    const unsubCheckin = on('attendance:checkin', () => {
      queryClient.invalidateQueries(['teamStatus'])
    })

    return () => {
      unsubCheckout()
      unsubCheckin()
    }
  }, [on, queryClient])

  const trends = trendsData?.trends || []
  const teamStatus = teamStatusData?.teamStatus || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Team Productivity
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Analytics, login times, and work logs for your direct reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Team Hours (Last 7 Days)
          </h2>
          
          {isLoading ? (
            <div className="h-72 w-full flex items-center justify-center text-gray-500">
              Loading chart data...
            </div>
          ) : trends.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.5rem' }}
                    cursor={{ fill: '#334155', opacity: 0.2 }}
                    formatter={(value: any) => [`${value} hrs`, 'Total Time']}
                  />
                  <Bar dataKey="totalHours" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 w-full flex items-center justify-center text-gray-500 dark:text-slate-400">
              No check-in data available for the last 7 days.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Today's Login Times
          </h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {teamStatus.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-400 text-center mt-10">No team data available</p>
            ) : (
              teamStatus.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs dark:bg-indigo-900/40 dark:text-indigo-300">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{member.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {member.status === 'checked-in' ? 'Active' : member.status === 'on-leave' ? 'On Leave' : member.status === 'checked-out' ? 'Checked Out' : 'Absent'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-300">
                      {member.attendance?.checkinTime ? new Date(member.attendance.checkinTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Detailed Work Logs
        </h2>
        <WorkLogs />
      </div>
    </div>
  )
}
