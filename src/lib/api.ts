export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    if (response.status === 401) {
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login'
      }
      throw new ApiError('Please login to continue', 401, data)
    }
    throw new ApiError(
      data.error || 'An error occurred',
      response.status,
      data
    )
  }

  return response.json()
}

export async function fetchApi<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const defaultOptions: RequestInit = {
    credentials: 'include', // Always include credentials
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, mergedOptions)
    return handleApiResponse<T>(response)
  } catch (error) {
    console.error('API request failed:', error)
    throw new ApiError(
      error instanceof Error ? error.message : 'Network request failed',
      500
    )
  }
}

// Helper function to check authentication status
export async function checkAuth(): Promise<boolean> {
  try {
    await fetchApi('/api/auth/me')
    return true
  } catch (error) {
    return false
  }
}

// Helper function for authenticated requests
export async function withAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const isAuthenticated = await checkAuth()
  
  if (!isAuthenticated) {
    if (!window.location.pathname.includes('/auth/login')) {
      window.location.href = '/auth/login'
    }
    throw new ApiError('Authentication required', 401)
  }

  return fetchApi<T>(url, options)
}