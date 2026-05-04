import api from './axios'

export const getLoans = () => api.get('/api/loans')
export const getLoan = (id) => api.get(`/api/loans/${id}`)
export const createLoan = (data) => api.post('/api/loans', data)
export const markLoanAsPaid = (id) => api.patch(`/api/loans/${id}/pay`)
export const deleteLoan = (id) => api.delete(`/api/loans/${id}`)

export const getPayments = (loanId) => api.get(`/api/loans/${loanId}/payments`)
export const registerPayment = (loanId, data) => api.post(`/api/loans/${loanId}/payments`, data)
export const deletePayment = (loanId, paymentId) => api.delete(`/api/loans/${loanId}/payments/${paymentId}`)
