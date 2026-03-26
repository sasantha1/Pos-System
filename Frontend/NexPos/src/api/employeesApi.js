import { apiRequest } from './client'

async function listEmployees(search) {
  return apiRequest('/employees', { query: { search: search || '' } })
}

async function getEmployeesStats() {
  return apiRequest('/employees/stats')
}

async function createEmployee(payload) {
  return apiRequest('/employees', { method: 'POST', auth: true, body: payload })
}

async function updateEmployee(id, payload) {
  return apiRequest(`/employees/${encodeURIComponent(id)}`, { method: 'PUT', auth: true, body: payload })
}

async function deleteEmployee(id) {
  return apiRequest(`/employees/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true })
}

export { listEmployees, getEmployeesStats, createEmployee, updateEmployee, deleteEmployee }

