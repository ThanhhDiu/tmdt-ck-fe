import { API_URL, fetchWithAuth } from './auth'

// ============================================================================
// TYPES / INTERFACES
// ============================================================================

export interface UserResponse {
  id: number
  code: string
  fullName: string
  email: string
  phone: string
  role: 'customer' | 'technician'
  status: 'active' | 'pending' | 'locked' | 'inactive'
  avatar: string | null
  district: string | null
  address: string | null
  bio: string | null
  averageRating: number | null
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PagedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface UpdateUserRequest {
  fullName?: string
  email?: string
  phone?: string
  address?: string
  district?: string
  bio?: string
  avatar?: string
}

export interface UpdateUserStatusRequest {
  status: 'active' | 'pending' | 'locked' | 'inactive'
  reason?: string
}

// ============================================================================
// QUERY BUILDER
// ============================================================================

interface GetAdminUsersFilters {
  role?: 'customer' | 'technician'
  status?: 'active' | 'pending' | 'locked' | 'inactive'
  district?: string
  keyword?: string
  page?: number
  limit?: number
}

const buildAdminUsersQuery = (filters: GetAdminUsersFilters): string => {
  const params = new URLSearchParams()

  if (filters.role) params.append('role', filters.role)
  if (filters.status) params.append('status', filters.status)
  if (filters.district) params.append('district', filters.district)
  if (filters.keyword) params.append('keyword', filters.keyword)
  if (filters.page) params.append('page', String(filters.page))
  if (filters.limit) params.append('limit', String(filters.limit))

  const query = params.toString()
  return query ? `?${query}` : ''
}

// ============================================================================
// ADMIN USER API FUNCTIONS
// ============================================================================

/**
 * Lấy danh sách người dùng với bộ lọc (admin)
 * GET /api/users?role=&status=&district=&keyword=&page=&limit=
 */
export const getAdminUsers = async (
  filters: GetAdminUsersFilters = {}
): Promise<PagedResponse<UserResponse>> => {
  const query = buildAdminUsersQuery({
    page: filters.page || 1,
    limit: filters.limit || 10,
    ...filters,
  })

  const url = `${API_URL}/users${query}`
  
  try {
    const response = await fetchWithAuth(url)
    
    if (!response.ok) {
      // Handle specific HTTP errors
      if (response.status === 401) {
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')
      }
      if (response.status === 403) {
        throw new Error('Bạn không có quyền truy cập trang này.')
      }
      if (response.status === 404) {
        throw new Error('Endpoint không tồn tại.')
      }

      const errorBody = await response.text()
      console.error(`API Error (${response.status}):`, errorBody)
      throw new Error(`Lỗi HTTP ${response.status}: ${response.statusText}`)
    }

    const result: ApiResponse<PagedResponse<UserResponse>> = await response.json()

    if (!result.success) {
      throw new Error(result.message || 'Lỗi không xác định')
    }

    return result.data
  } catch (error: any) {
    console.error('getAdminUsers error:', {
      url,
      message: error.message,
      stack: error.stack
    })
    throw error
  }
}

/**
 * Lấy thông tin chi tiết một người dùng
 * GET /api/users/{id}
 */
export const getAdminUserById = async (userId: number): Promise<UserResponse> => {
  try {
    const response = await fetchWithAuth(`${API_URL}/users/${userId}`)

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')
      }
      if (response.status === 403) {
        throw new Error('Bạn không có quyền truy cập thông tin này.')
      }
      if (response.status === 404) {
        throw new Error('Người dùng không tồn tại.')
      }
      throw new Error(`Lỗi HTTP ${response.status}: ${response.statusText}`)
    }

    const result: ApiResponse<UserResponse> = await response.json()

    if (!result.success) {
      throw new Error(result.message || 'Lỗi không xác định')
    }

    return result.data
  } catch (error: any) {
    console.error('getAdminUserById error:', error)
    throw error
  }
}

/**
 * Cập nhật thông tin hồ sơ người dùng
 * PATCH /api/users/{id}
 */
export const updateAdminUser = async (
  userId: number,
  request: UpdateUserRequest
): Promise<UserResponse> => {
  try {
    const response = await fetchWithAuth(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')
      }
      if (response.status === 403) {
        throw new Error('Bạn không có quyền thực hiện hành động này.')
      }
      if (response.status === 404) {
        throw new Error('Người dùng không tồn tại.')
      }
      throw new Error(`Lỗi lúc cập nhật: ${response.statusText}`)
    }

    const result: ApiResponse<UserResponse> = await response.json()

    if (!result.success) {
      throw new Error(result.message || 'Lỗi không xác định')
    }

    return result.data
  } catch (error: any) {
    console.error('updateAdminUser error:', error)
    throw error
  }
}

/**
 * Cập nhật trạng thái người dùng (admin only)
 * PATCH /api/users/{id}/status
 */
export const updateAdminUserStatus = async (
  userId: number,
  request: UpdateUserStatusRequest
): Promise<UserResponse> => {
  try {
    const response = await fetchWithAuth(`${API_URL}/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')
      }
      if (response.status === 403) {
        throw new Error('Bạn không có quyền thay đổi trạng thái người dùng.')
      }
      if (response.status === 404) {
        throw new Error('Người dùng không tồn tại.')
      }
      throw new Error(`Lỗi lúc cập nhật: ${response.statusText}`)
    }

    const result: ApiResponse<UserResponse> = await response.json()

    if (!result.success) {
      throw new Error(result.message || 'Lỗi không xác định')
    }

    return result.data
  } catch (error: any) {
    console.error('updateAdminUserStatus error:', error)
    throw error
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map UserResponse (backend) sang User (frontend)
 */
export const mapUserResponseToFrontend = (user: UserResponse) => ({
  id: String(user.id),
  name: user.fullName,
  avatar: user.avatar || 'https://i.pravatar.cc/150?img=default',
  phone: user.phone,
  district: (user.district as any) || 'Quận 1',
  role: user.role as 'customer' | 'technician',
  status: user.status,
  orderCount: 0, // Backend không cung cấp, FE sẽ lấy từ nơi khác
  joinedAt: new Date(user.createdAt).toLocaleDateString('vi-VN'),
  isVerified: user.status === 'active',
  email: user.email,
  code: user.code,
})

/**
 * Map User (frontend) sang UpdateUserRequest (backend)
 */
export const mapFrontendToUpdateUserRequest = (user: any): UpdateUserRequest => ({
  fullName: user.name,
  email: user.email,
  phone: user.phone,
  district: user.district,
  address: user.address,
  bio: user.bio,
  avatar: user.avatar,
})
