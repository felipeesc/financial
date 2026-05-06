import { createContext, useContext, useState, useCallback } from 'react'
import { login as apiLogin } from '../api/auth'
import { getWorkspaces } from '../api/workspaces'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [workspaceId, setWorkspaceId] = useState(() => localStorage.getItem('workspaceId'))

  const isAuthenticated = Boolean(token)

  const login = useCallback(async (username, password) => {
    const { data } = await apiLogin(username, password)
    localStorage.setItem('token', data.token)
    setToken(data.token)

    // Load first (owner) workspace after login
    try {
      const { data: workspaces } = await getWorkspaces()
      const ownerWs = workspaces.find((w) => w.ownerUsername === username) ?? workspaces[0]
      if (ownerWs) {
        localStorage.setItem('workspaceId', ownerWs.id)
        setWorkspaceId(ownerWs.id)
      }
    } catch (_) {
      // workspace load failure should not block login
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('workspaceId')
    setToken(null)
    setWorkspaceId(null)
  }, [])

  const switchWorkspace = useCallback((id) => {
    localStorage.setItem('workspaceId', id)
    setWorkspaceId(id)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, workspaceId, login, logout, switchWorkspace }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
