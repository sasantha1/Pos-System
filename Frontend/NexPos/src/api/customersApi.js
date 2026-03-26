import { apiRequest } from './client'

async function listCustomers(search) {
  return apiRequest('/customers', { query: { search: search || '' } })
}

async function getCustomersStats() {
  return apiRequest('/customers/stats')
}

async function createCustomer(payload) {
  return apiRequest('/customers', { method: 'POST', auth: true, body: payload })
}

async function updateCustomer(id, payload) {
  return apiRequest(`/customers/${encodeURIComponent(id)}`, { method: 'PUT', auth: true, body: payload })
}

async function deleteCustomer(id) {
  return apiRequest(`/customers/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true })
}

export { listCustomers, getCustomersStats, createCustomer, updateCustomer, deleteCustomer }

