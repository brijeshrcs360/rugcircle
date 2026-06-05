import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

const AdminSessionContext = createContext(null)

export function AdminSessionProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const path = window.location.pathname || '/'
    const shouldCheckAdmin = path.startsWith('/admin')
    if (!shouldCheckAdmin) {
      setSession(null)
      setLoading(false)
      return
    }
    api.me()
      .then((res) => setSession(res.user))
      .catch(() => setSession(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async ({ email, password }) => {
    const res = await api.login(email, password)
    setSession(res.user)
    return res
  }

  const logout = async () => {
    try { await api.logout() } catch { /* noop */ }
    setSession(null)
  }

  const value = useMemo(
    () => ({ session, isAuthenticated: Boolean(session), loading, login, logout }),
    [session, loading],
  )

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>
}

export function useAdminSession() {
  const ctx = useContext(AdminSessionContext)
  if (!ctx) throw new Error('useAdminSession must be used inside AdminSessionProvider')
  return ctx
}

