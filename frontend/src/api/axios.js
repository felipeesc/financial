import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
})

// Anexa o token JWT e o workspace ativo em toda requisição autenticada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  const workspaceId = localStorage.getItem('workspaceId')
  if (workspaceId) {
    config.headers['X-Workspace-Id'] = workspaceId
  }
  return config
})

// Redireciona para login quando o token expirar ou for inválido
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('workspaceId')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
