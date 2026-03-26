import { apiRequest } from './client'

async function checkout(payload) {
  return apiRequest('/orders/checkout', { method: 'POST', auth: true, body: payload })
}

export { checkout }

