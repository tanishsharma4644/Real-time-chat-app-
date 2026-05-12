import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, setAuthToken } from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const hydrateSession = async () => {
    const token = localStorage.getItem('accessToken')

    if (!token) {
      setLoading(false)
      return
    }

    try {
      setAuthToken(token)
      const { data } = await api.get('/auth/me')
      setUser(data.data)
    } catch {
      localStorage.removeItem('accessToken')
      setAuthToken(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    hydrateSession()
  }, [])

  const persistSession = (payload) => {
    localStorage.setItem('accessToken', payload.accessToken)
    setAuthToken(payload.accessToken)
    setUser({
      _id: payload._id,
      name: payload.name || payload.username,
      email: payload.email,
      avatar: payload.avatar,
    })
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    persistSession(data.data)
  }

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    persistSession(data.data)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      setUser(null)
      setAuthToken(null)
      localStorage.removeItem('accessToken')
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
