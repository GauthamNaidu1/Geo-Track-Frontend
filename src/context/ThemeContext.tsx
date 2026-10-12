import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'geotrack-theme'

interface ThemeContextType {
  isDark: boolean
  toggle: () => void
  setIsDark: (dark: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDarkState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark') return true
    if (stored === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const applyTheme = useCallback((dark: boolean) => {
    const root = document.documentElement
    const body = document.body
    if (dark) {
      root.classList.add('dark')
      body.classList.add('dark')
    } else {
      root.classList.remove('dark')
      body.classList.remove('dark')
    }
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    applyTheme(isDark)
  }, [isDark, applyTheme])

  const toggle = useCallback(() => {
    setIsDarkState((prev) => !prev)
  }, [])

  const setIsDark = useCallback((dark: boolean) => {
    setIsDarkState(dark)
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, toggle, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
