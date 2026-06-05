import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

const UserSessionContext = createContext(null)

export function UserSessionProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const path = window.location.pathname || '/'
    const shouldCheckUser = path.startsWith('/user')
    if (!shouldCheckUser) {
      setSession(null)
      setLoading(false)
      return
    }
    api.userMe().then((r) => setSession(r.user)).catch(() => setSession(null)).finally(() => setLoading(false))
  }, [])

  const login = async ({ identifier, password, otp }) => {
    const r = await api.userLogin(identifier, password, otp)
    setSession(r.user)
    return r
  }
  const logout = async () => {
    await api.userLogout()
    setSession(null)
  }

  const value = useMemo(() => ({ session, loading, isAuthenticated: Boolean(session), login, logout }), [session, loading])
  return <UserSessionContext.Provider value={value}>{children}</UserSessionContext.Provider>
}

export function useUserSession() {
  const c = useContext(UserSessionContext)
  if (!c) throw new Error('useUserSession must be used inside UserSessionProvider')
  return c
}
