import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'org_admin' | 'manager' | 'employee'
  organizationId?: string
  employeeCode?: string
  departmentName?: string
  officeName?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      const u = action.payload
      if (u && u.role) {
        u.role = (u.role as string).toLowerCase() as any
      }
      state.user = u
      state.isAuthenticated = true
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
    },
  },
})

export const { setUser, setToken, logout } = authSlice.actions
export default authSlice.reducer
