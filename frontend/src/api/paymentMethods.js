import api from './axios'

export const getPaymentMethods = () =>
  api.get('/api/payment-methods')

export const createPaymentMethod = (data) =>
  api.post('/api/payment-methods', data)

export const deletePaymentMethod = (id) =>
  api.delete(`/api/payment-methods/${id}`)
