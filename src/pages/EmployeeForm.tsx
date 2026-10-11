import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

interface Department {
  id: string
  name: string
}

interface Shift {
  id: string
  name: string
  startTime: string
  endTime: string
}

interface Office {
  id: string
  name: string
}

interface Manager {
  id: string
  name: string
  email: string
}

export default function EmployeeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    employeeCode: '',
    name: '',
    email: '',
    departmentId: '',
    managerId: '',
    shiftId: '',
    officeId: '',
    role: 'employee',
    password: '',
  })

  const [departments, setDepartments] = useState<Department[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [offices, setOffices] = useState<Office[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFormData()
    if (isEdit) {
      fetchEmployee()
    }
  }, [id])

  const fetchFormData = async () => {
    try {
      // Fetch departments, shifts, offices, and potential managers
      const [deptRes, shiftRes, officeRes, managerRes] = await Promise.all([
        api.get('/departments'),
        api.get('/shifts'),
        api.get('/offices'),
        api.get('/employees?role=manager'),
      ])
      setDepartments(deptRes.data.departments || [])
      setShifts(shiftRes.data.shifts || [])
      setOffices(officeRes.data.offices || [])
      const allEmps: any[] = managerRes.data.employees || []
      const mgrList = allEmps.filter((e: any) => e.role === 'manager' || e.role === 'org_admin')
      setManagers(mgrList.length > 0 ? mgrList : allEmps)
    } catch (err) {
      console.error('Failed to load form data:', err)
    }
  }

  const fetchEmployee = async () => {
    try {
      const response = await api.get(`/employees/${id}`)
      const employee = response.data.employee
      setFormData({
        employeeCode: employee.employeeCode,
        name: employee.name,
        email: employee.email,
        departmentId: employee.departmentId || '',
        managerId: employee.managerId || '',
        shiftId: employee.shiftId || '',
        officeId: employee.officeId || '',
        role: employee.role,
        password: '',
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load employee')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const parts = formData.name.trim().split(' ')
      const payload = {
        ...formData,
        role: formData.role.toUpperCase(),
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || parts[0] || '',
        departmentId: formData.departmentId || null,
        shiftId: formData.shiftId || null,
        managerId: formData.managerId || null,
        officeId: formData.officeId || null
      }

      if (isEdit) {
        await api.put(`/employees/${id}`, payload)
        alert('Employee updated successfully!')
        navigate('/employees')
      } else {
        await api.post('/employees', payload)
        alert('Employee created successfully!')
        navigate('/employees')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save employee')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">
            {isEdit ? 'Edit Employee' : 'Add New Employee'}
          </h1>
          <p className="text-text-secondary dark:text-slate-400 mt-1">
            {isEdit ? 'Update employee information' : 'Create a new employee account'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                Employee Code *
              </label>
              <input
                type="text"
                name="employeeCode"
                value={formData.employeeCode}
                onChange={handleChange}
                required
                disabled={isEdit}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                placeholder="EMP001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isEdit}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              placeholder="john@example.com"
            />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Secure password"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                Department
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{departments.length === 0 ? 'No departments created yet' : 'Select Department'}</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                Shift
              </label>
              <select
                name="shiftId"
                value={formData.shiftId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{shifts.length === 0 ? 'No shifts created yet' : 'Select Shift'}</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.startTime} - {shift.endTime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                Manager
              </label>
              <select
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{managers.length === 0 ? 'No managers available (Optional)' : 'Select Manager (Optional)'}</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="org_admin">Organization Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                Primary Office
              </label>
              <select
                name="officeId"
                value={formData.officeId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{offices.length === 0 ? 'No offices created yet' : 'Select Office'}</option>
                {offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="flex-1 bg-slate-200 dark:bg-slate-700 text-text-primary dark:text-white py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
