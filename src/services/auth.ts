import axiosClient from '../api/axiosClient';

// Removed export API_URL since axiosClient handles the base URL

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
      const data: any = await axiosClient.post('/auth/register', {
        fullName,
        email,
        phone,
        password,
        role: accountType,
      })
  
      setSuccessMessage('Đăng ký thành công. Vui lòng quay lại trang Đăng nhập.')
    } catch (error: any) {
      console.error('Lỗi đăng ký:', error)
      throw error;
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
  try {
    const data: any = await axiosClient.post('/auth/login', {
      identifier: userData.identifier,
      password: userData.password,
      role: userData.role,
    });
  
    const { user, accessToken, refreshToken } = data.data
      localStorage.setItem('user', JSON.stringify({ user }))
      localStorage.setItem('accessToken',  accessToken )
      localStorage.setItem('refreshToken', refreshToken )
    return data as LoginResponse;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
  }
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

export const forgotPassword = async (email: string) => {
  return await axiosClient.post('/auth/forgot-password', { email });
}

export const changePassword = async (payload: { oldPassword?: string, newPassword: string }) => {
  return await axiosClient.post('/auth/change-password', payload);
}
