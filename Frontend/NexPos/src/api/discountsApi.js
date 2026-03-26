import { apiRequest } from './client'

async function listDiscounts(search) {
  return apiRequest('/discounts', { query: { search: search || '' } })
}

async function createDiscount(payload) {
  return apiRequest('/discounts', { method: 'POST', auth: true, body: payload })
}

async function updateDiscount(id, payload) {
  return apiRequest(`/discounts/${encodeURIComponent(id)}`, { method: 'PUT', auth: true, body: payload })
}

async function toggleDiscountActive(id, active) {
  return apiRequest(`/discounts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    auth: true,
    body: { active },
  })
}

async function deleteDiscount(id) {
  return apiRequest(`/discounts/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true })
}

async function resolveDiscountByCode(code) {
  const data = await apiRequest('/discounts/resolve', { query: { code: code || '' } })
  return data?.discount || null
}

export { listDiscounts, createDiscount, updateDiscount, toggleDiscountActive, deleteDiscount, resolveDiscountByCode }

