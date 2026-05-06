import api from './axios'

export const getWorkspaces = () => api.get('/api/workspaces')

export const createWorkspace = (name) => api.post('/api/workspaces', { name })

export const addMember = (workspaceId, username, role) =>
  api.post(`/api/workspaces/${workspaceId}/members`, { username, role })

export const removeMember = (workspaceId, memberId) =>
  api.delete(`/api/workspaces/${workspaceId}/members/${memberId}`)
