import { apiRequest } from './client'

async function getReportsSummary(range) {
  return apiRequest('/reports/summary', { query: { range: range || '' } })
}

export { getReportsSummary }

