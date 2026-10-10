import { useEffect, useRef, useCallback, useState } from 'react'
// @ts-ignore
import io, { Socket } from 'socket.io-client'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

interface SocketEvents {
  'attendance:checkin': {
    employeeId: string
    employeeName: string
    officeName: string
    checkinTime: string
    distance: number
  }
  'attendance:checkout': {
    employeeId: string
    employeeName: string
    officeName: string
    checkoutTime: string
    duration: number
  }
  'leave:status-changed': {
    leaveRequestId: string
    employeeId: string
    status: 'approved' | 'rejected'
    leaveType: string
  }
  'dashboard:stats-updated': {
    totalEmployees: number
    checkedIn: number
    checkedOut: number
    onLeave: number
  }
  notification: {
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
  }
}

type EventListener<T extends keyof SocketEvents> = (data: SocketEvents[T]) => void

/**
 * Custom hook for Socket.IO connection and event handling
 */
export const useSocket = () => {
  const user = useSelector((state: RootState) => state.auth.user)
  const token = useSelector((state: RootState) => state.auth.token)
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Initialize socket connection
  useEffect(() => {
    if (!user || !token) return

    // Create socket connection with auth
    const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
      auth: {
        token,
        user: {
          id: user.id,
          organizationId: user.organizationId,
          role: user.role,
        },
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error)
    })

    newSocket.on('error', (error: any) => {
      console.error('Socket error:', error)
    })

    socketRef.current = newSocket

    // Cleanup on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [user, token])

  // Add event listener
  const on = useCallback(
    <T extends keyof SocketEvents>(event: T, callback: EventListener<T>) => {
      if (socketRef.current) {
        socketRef.current.on(event, callback as any)
        return () => {
          socketRef.current?.off(event, callback as any)
        }
      }
      return () => {}
    },
    []
  )

  // Subscribe to specific events
  const subscribe = useCallback((organizationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('subscribe:dashboard', { organizationId })
    }
  }, [])

  // Emit event
  const emit = useCallback(<T extends keyof SocketEvents>(event: T, data: SocketEvents[T]) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data)
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    on,
    subscribe,
    emit,
  }
}
