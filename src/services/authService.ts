import api from './api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'org_admin' | 'manager' | 'employee'
  employeeCode: string
  organizationId: string
  departmentName?: string
  officeName?: string
}

export interface LoginResponse {
  message: string
  user: User
  accessToken: string
  refreshToken: string
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    
    if (response.data?.user?.role) {
      response.data.user.role = (response.data.user.role as string).toLowerCase() as any
    }

    // Store tokens
    localStorage.setItem('accessToken', response.data.accessToken)
    localStorage.setItem('refreshToken', response.data.refreshToken)
    
    return response.data
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      await api.post('/auth/logout', { refreshToken })
    } finally {
      // Clear tokens regardless of API response
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    if (response.data?.role) {
      response.data.role = (response.data.role as string).toLowerCase() as any
    }
    return response.data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    })
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken')
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken')
  },
}
