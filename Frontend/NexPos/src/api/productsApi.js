import { apiRequest } from './client'

async function listProducts(search) {
  return apiRequest('/products', { query: { search: search || '' } })
}

async function createProduct(payload) {
  return apiRequest('/products', { method: 'POST', auth: true, body: payload })
}

async function updateProduct(id, payload) {
  return apiRequest(`/products/${encodeURIComponent(id)}`, { method: 'PUT', auth: true, body: payload })
}

async function deleteProduct(id) {
  return apiRequest(`/products/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true })
}

export { listProducts, createProduct, updateProduct, deleteProduct }

