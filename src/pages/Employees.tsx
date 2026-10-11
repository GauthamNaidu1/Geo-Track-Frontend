import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import api from '../services/api'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { SkeletonTable } from '../components/SkeletonLoader'
import { useToast } from '../context/ToastContext'

interface Employee {
  id: string
  employeeCode: string
  name: string
  email: string
  role: string
  department?: { id: string; name: string }
  shift?: { id: string; name: string }
  manager?: { id: string; name: string }
  office?: { id: string; name: string }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function Employees() {
  const user = useSelector((state: RootState) => state.auth.user)
  const toast = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const canManageEmployees = ['super_admin', 'org_admin'].includes(user?.role || '')

  useEffect(() => {
    fetchEmployees()
  }, [pagination.page])

  const fetchEmployees = async (searchTerm = search) => {
    try {
      setLoading(true)
      const response = await api.get('/employees', {
        params: { page: pagination.page, limit: pagination.limit, search: searchTerm },
      })
      setEmployees(response.data.employees)
      setPagination(response.data.pagination)
      setError('')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message || 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((p) => ({ ...p, page: 1 }))
    fetchEmployees(search)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    const previous = employees
    setEmployees((emps) => emps.filter((e) => e.id !== id))
    setDeletingId(id)

    try {
      await api.delete(`/employees/${id}`)
      toast.success('Employee deleted', `${name} was removed successfully.`)
      setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }))
    } catch (err: unknown) {
      setEmployees(previous)
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error('Delete failed', axiosErr.response?.data?.message || 'Could not delete employee')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Employees"
        description="Manage your organization's employees"
        action={
          canManageEmployees ? (
            <Link to="/employees/new" className="btn-primary w-full sm:w-auto">
              + Add Employee
            </Link>
          ) : undefined
        }
      />

      <form onSubmit={handleSearch} className="mb-6" role="search" aria-label="Search employees">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or code..."
            className="input flex-1"
            aria-label="Search employees"
          />
          <button type="submit" className="btn-primary sm:px-8">
            Search
          </button>
        </div>
      </form>

      {error && <div className="alert-error" role="alert">{error}</div>}

      {loading ? (
        <SkeletonTable rows={6} cols={5} />
      ) : employees.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-text-secondary dark:text-slate-400">No employees found</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="md:hidden space-y-4" aria-label="Employee list">
            {employees.map((employee) => (
              <li key={employee.id} className="card p-4">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <p className="font-medium text-text-primary dark:text-white">{employee.name}</p>
                    <p className="text-sm text-text-secondary dark:text-slate-400">{employee.email}</p>
                    <p className="text-xs text-text-secondary dark:text-slate-500">{employee.employeeCode}</p>
                  </div>
                  <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 capitalize">
                    {employee.role.replace('_', ' ')}
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <dt className="text-text-secondary dark:text-slate-500 text-xs">Department</dt>
                    <dd className="text-text-primary dark:text-white">{employee.department?.name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary dark:text-slate-500 text-xs">Manager</dt>
                    <dd className="text-text-primary dark:text-white">{employee.manager?.name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary dark:text-slate-500 text-xs">Office</dt>
                    <dd className="text-text-primary dark:text-white">{employee.office?.name || '—'}</dd>
                  </div>
                </dl>
                {canManageEmployees && (
                  <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <Link to={`/employees/${employee.id}/edit`} className="btn-secondary flex-1 text-center">
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(employee.id, employee.name)}
                      disabled={deletingId === employee.id}
                      className="btn-danger flex-1"
                      aria-label={`Delete ${employee.name}`}
                    >
                      {deletingId === employee.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden md:block skeuo-table-wrap">
            <table className="w-full" aria-label="Employees table">
              <thead className="skeuo-thead">
                <tr>
                  <th scope="col">Employee</th>
                  <th scope="col">Role</th>
                  <th scope="col">Department</th>
                  <th scope="col">Shift</th>
                  <th scope="col">Office</th>
                  <th scope="col">Manager</th>
                  {canManageEmployees && (
                    <th scope="col" className="px-6 py-3 text-right text-xs uppercase tracking-widest font-black text-slate-600 dark:text-slate-300">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="skeuo-tbody">
                {employees.map((employee) => (
                  <tr key={employee.id} className="skeuo-row">
                    <td className="skeuo-td">
                      <div className="font-black text-slate-800 dark:text-white">{employee.name}</div>
                      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{employee.email}</div>
                      <div className="text-xs font-bold text-slate-400 dark:text-slate-500">{employee.employeeCode}</div>
                    </td>
                    <td className="skeuo-td">
                      <span className="badge-blue capitalize">
                        {employee.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="skeuo-td">{employee.department?.name || '—'}</td>
                    <td className="skeuo-td">{employee.shift?.name || '—'}</td>
                    <td className="skeuo-td">{employee.office?.name || '—'}</td>
                    <td className="skeuo-td">{employee.manager?.name || '—'}</td>
                    {canManageEmployees && (
                      <td className="skeuo-td text-right">
                        <Link to={`/employees/${employee.id}/edit`} className="btn-ghost min-h-0 min-w-0 px-3 py-2 text-blue-700 font-black inline-flex">
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(employee.id, employee.name)}
                          disabled={deletingId === employee.id}
                          className="btn-ghost min-h-0 min-w-0 px-3 py-2 text-red-600 font-black inline-flex"
                          aria-label={`Delete ${employee.name}`}
                        >
                          {deletingId === employee.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4" aria-label="Pagination">
            <p className="text-sm text-text-secondary dark:text-slate-400 text-center sm:text-left">
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="btn-secondary flex-1 sm:flex-none"
                aria-label="Previous page"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="btn-secondary flex-1 sm:flex-none"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </nav>
        </>
      )}
    </div>
  )
}
