const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000/api').replace(/\/$/, '')

type ApiFailure = { error?: string; message?: string }
type CsrfResponse = { csrfToken: string }

let currentCsrfToken: string | null = null

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function getCsrfToken() {
  const response = await fetch(`${apiBase}/auth/csrf-token`, { credentials: 'include' })
  const payload = await response.json() as CsrfResponse & ApiFailure
  if (!response.ok || !payload.csrfToken) {
    throw new ApiError(payload.error || 'Unable to prepare a secure request.', response.status)
  }
  currentCsrfToken = payload.csrfToken
  return currentCsrfToken
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    headers.set('x-csrf-token', await getCsrfToken())
  }

  let response: Response
  try {
    response = await fetch(`${apiBase}${path}`, {
      ...init,
      method,
      headers,
      credentials: 'include',
    })
  } catch {
    throw new ApiError('Can’t reach the server. Check that the backend is running, then try again.', 0)
  }

  const payload = await response.json().catch(() => ({})) as T & ApiFailure & CsrfResponse
  if (!response.ok) {
    throw new ApiError(payload.error || payload.message || `Request failed (${response.status}).`, response.status)
  }
  if (payload.csrfToken) currentCsrfToken = payload.csrfToken
  return payload
}

