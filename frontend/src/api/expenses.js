import api from './axios'

export const getExpenses = (month) =>
  api.get('/api/expenses', { params: { month } })

export const createExpense = (data) =>
  api.post('/api/expenses', data)

export const updateExpense = (id, data) =>
  api.put(`/api/expenses/${id}`, data)

export const deleteExpense = (id) =>
  api.delete(`/api/expenses/${id}`)

export const getMonthlySummary = (month) =>
  api.get('/api/expenses/summary', { params: { month } })
