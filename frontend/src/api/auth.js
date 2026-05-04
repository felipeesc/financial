import axios from 'axios'

// Auth usa instância separada — sem interceptor de token (endpoints públicos)
const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
})

export const login = (username, password) =>
  authApi.post('/api/auth/login', { username, password })

export const register = (username, password) =>
  authApi.post('/api/auth/register', { username, password })
