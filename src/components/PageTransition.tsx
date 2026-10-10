import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation()

  return (
    <div key={location.pathname} className="page-enter min-h-full">
      {children}
    </div>
  )
}
