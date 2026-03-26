import { apiRequest } from './client'

async function getInventoryStats() {
  return apiRequest('/inventory/stats')
}

async function getInventoryItems(search) {
  return apiRequest('/inventory/items', { query: { search: search || '' } })
}

async function updateInventoryStock(productId, stock) {
  return apiRequest(`/inventory/items/${encodeURIComponent(productId)}`, {
    method: 'PATCH',
    auth: true,
    body: { stock },
  })
}

export { getInventoryStats, getInventoryItems, updateInventoryStock }

