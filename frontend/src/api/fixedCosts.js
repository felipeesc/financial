import api from './axios'

export const getFixedCosts = () =>
  api.get('/api/fixed-costs')

export const createFixedCost = (data) =>
  api.post('/api/fixed-costs', data)

export const updateFixedCost = (id, data) =>
  api.put(`/api/fixed-costs/${id}`, data)

export const deleteFixedCost = (id) =>
  api.delete(`/api/fixed-costs/${id}`)
