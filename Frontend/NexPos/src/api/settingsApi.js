import { apiRequest } from './client'

async function getSettings() {
  return apiRequest('/settings')
}

async function updateSettings(payload) {
  return apiRequest('/settings', { method: 'PUT', auth: true, body: payload })
}

export { getSettings, updateSettings }

