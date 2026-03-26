const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000/api/v1'

function getToken() {
  try {
    return localStorage.getItem('token')
  } catch {
    return null
  }
}

function buildUrl(endpoint, query) {
  const url = new URL(API_BASE_URL + endpoint)
  if (query && typeof query === 'object') {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue
      url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    query,
    body,
    auth = false,
    headers: customHeaders = {},
  } = options

  const token = auth ? getToken() : null

  const headers = {
    Accept: 'application/json',
    ...customHeaders,
  }
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const url = buildUrl(endpoint, query)
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let message = `Request failed: ${res.status}`
    try {
      const data = await res.json()
      message = data?.message || message
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  // Some endpoints may return empty body.
  const text = await res.text()
  if (!text) return null
  return JSON.parse(text)
}

export { apiRequest, API_BASE_URL }

