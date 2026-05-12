import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setSocket(null)
      return
    }

    const token = localStorage.getItem('accessToken')

    if (!token) {
      return
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
    const nextSocket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket'],
    })

    nextSocket.on('connect', () => {
      nextSocket.emit('authenticate', { token })
    })

    setSocket(nextSocket)

    return () => {
      nextSocket.disconnect()
    }
  }, [isAuthenticated])

  const value = useMemo(() => ({ socket }), [socket])

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export const useSocket = () => {
  const context = useContext(SocketContext)

  if (!context) {
    throw new Error('useSocket must be used inside SocketProvider')
  }

  return context
}
