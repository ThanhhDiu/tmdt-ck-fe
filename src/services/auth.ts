export const API_URL = 'http://localhost:8080/api'

interface RegisterUserData {
  fullName: string
  email: string
  phone: string
  password: string
  accountType: 'customer' | 'technician'
}

export const registerUser = async (userData: RegisterUserData, setSuccessMessage: (message: string) => void) => {
    setSuccessMessage('')
    const { fullName, email, phone, password, accountType } = userData
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          role: accountType,
        }),
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại')
      }
  
      setSuccessMessage('Đăng ký thành công')
      console.log(data)
    } catch (error) {
      console.error(error)
      setSuccessMessage('Có lỗi xảy ra')
    }
  }

export interface LoginUserData {
  identifier: string
  password: string
}

export interface User {
  id: number
  code: string
  fullName: string
  email: string
  phone: string
  role: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
    user: User
  }
}

export interface RefreshTokenResponse {
  success: boolean
  data: {
    accessToken: string
  }
}

interface AuthMeResponse {
  success: boolean
  data: User
}

type FetchWithAuthOptions = RequestInit & {
  skipAuth?: boolean
}

export const loginUser = async (
  userData: LoginUserData
): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identifier: userData.identifier,
      password: userData.password,
    }),
  })

  const data: LoginResponse = await response.json()
  
  if (!response.ok) {
    throw new Error('Đăng nhập thất bại')
  }
  const { user, accessToken, refreshToken } = data.data
    localStorage.setItem('user', JSON.stringify({ user }))
    localStorage.setItem('accessToken',  accessToken )
    localStorage.setItem('refreshToken', refreshToken )
  return data
}

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refreshToken')

  if (!refreshToken) {
    return null
  }

  const response = await fetch(`${API_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  })

  const data: RefreshTokenResponse = await response.json()

  if (!response.ok) {
    throw new Error('Làm mới token thất bại')
  }

  localStorage.setItem('accessToken', data.data.accessToken)
  return data.data.accessToken
}

export const fetchWithAuth = async (
  input: RequestInfo | URL,
  init: FetchWithAuthOptions = {},
  retryOnUnauthorized: boolean = true
): Promise<Response> => {
  const { skipAuth, headers, ...rest } = init
  const nextHeaders = new Headers(headers || undefined)
  const isFormDataBody = rest.body instanceof FormData

  if (!nextHeaders.has('Content-Type') && !isFormDataBody) {
    nextHeaders.set('Content-Type', 'application/json')
  }

  if (!skipAuth) {
    const accessToken = getAccessToken()
    if (accessToken) {
      nextHeaders.set('Authorization', `Bearer ${accessToken}`)
    }
  }

  const response = await fetch(input, {
    ...rest,
    headers: nextHeaders,
  })

  if (response.status !== 401 || !retryOnUnauthorized || skipAuth) {
    return response
  }

  const refreshedAccessToken = await refreshAccessToken()
  if (!refreshedAccessToken) {
    logoutUser()
    return response
  }

  const retryHeaders = new Headers(nextHeaders)
  retryHeaders.set('Authorization', `Bearer ${refreshedAccessToken}`)

  return fetch(input, {
    ...rest,
    headers: retryHeaders,
  })
}

export const logoutUser = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

export const isAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem('accessToken')
  return !!accessToken
}
export const getAccessToken = (): string | null => {
    if (!isAuthenticated()) {
        return null
    }
  return localStorage.getItem('accessToken')
}

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken')
}

export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem('user')
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as { user?: User } | User
    if ('user' in parsed && parsed.user) {
      return parsed.user
    }
    return parsed as User
  } catch {
    return null
  }
}

export const fetchCurrentUser = async (): Promise<User> => {
  const response = await fetchWithAuth(`${API_URL}/auth/me`, {
    method: 'GET',
  })

  const payload: AuthMeResponse = await response.json()

  if (!response.ok || !payload.success) {
    throw new Error('Không thể lấy thông tin người dùng')
  }

  localStorage.setItem('user', JSON.stringify({ user: payload.data }))
  return payload.data
}
