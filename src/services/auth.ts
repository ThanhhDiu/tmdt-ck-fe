const API_URL = import.meta.env.VITE_API_URL

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
  role: 'customer' | 'technician'
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
      role: userData.role,
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

