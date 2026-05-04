import api from './axios'

export const getCategories = () =>
  api.get('/api/categories')

export const createCategory = (data) =>
  api.post('/api/categories', data)

export const updateCategory = (id, data) =>
  api.put(`/api/categories/${id}`, data)

export const deleteCategory = (id) =>
  api.delete(`/api/categories/${id}`)
