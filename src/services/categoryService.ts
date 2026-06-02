import { API_URL, fetchWithAuth } from './auth'

export interface Category {
  id: string
  title: string
  description: string
  iconUrl?: string | null
  priority?: string | null
  status?: string | null
}

export interface CategoryListResponse {
  items: Category[]
}

export interface CategoryUpsertRequest {
  title: string
  description?: string
  priority?: 'low' | 'normal' | 'high'
  status?: 'active' | 'inactive'
  icon?: File | null
}

export interface CategoryStatusRequest {
  status: 'active' | 'inactive'
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

const parseCategoryResponse = (category: Category): Category => ({
  ...category,
  priority: category.priority?.toLowerCase() || 'normal',
  status: category.status?.toLowerCase() || 'active',
})

const buildCategoryFormData = (request: CategoryUpsertRequest): FormData => {
  const formData = new FormData()

  formData.append('title', request.title)

  if (request.description !== undefined) {
    formData.append('description', request.description)
  }

  if (request.priority) {
    formData.append('priority', request.priority)
  }

  if (request.status) {
    formData.append('status', request.status)
  }

  if (request.icon) {
    formData.append('icon', request.icon)
  }

  return formData
}

export const getCategories = async (status?: string): Promise<Category[]> => {
  const params = new URLSearchParams()
  if (status) {
    params.append('status', status)
  }

  const response = await fetchWithAuth(
    `${API_URL}/categories${params.toString() ? `?${params.toString()}` : ''}`,
    {
      method: 'GET',
    }
  )

  const data: ApiResponse<CategoryListResponse> = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Lấy danh sách danh mục thất bại')
  }

  return (data.data.items || []).map(parseCategoryResponse)
}

export const createCategory = async (request: CategoryUpsertRequest): Promise<Category> => {
  const response = await fetchWithAuth(`${API_URL}/categories`, {
    method: 'POST',
    body: buildCategoryFormData(request),
  })

  const data: ApiResponse<Category> = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Tạo danh mục thất bại')
  }

  return parseCategoryResponse(data.data)
}

export const updateCategory = async (id: string, request: CategoryUpsertRequest): Promise<Category> => {
  const response = await fetchWithAuth(`${API_URL}/categories/${id}`, {
    method: 'PUT',
    body: buildCategoryFormData(request),
  })

  const data: ApiResponse<Category> = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Cập nhật danh mục thất bại')
  }

  return parseCategoryResponse(data.data)
}

export const deleteCategory = async (id: string): Promise<string> => {
  const response = await fetchWithAuth(`${API_URL}/categories/${id}`, {
    method: 'DELETE',
  })

  const data: ApiResponse<{ id: string; message: string }> = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Xóa danh mục thất bại')
  }

  return data.data.id
}

export const updateCategoryStatus = async (id: string, status: 'active' | 'inactive'): Promise<Category> => {
  const response = await fetchWithAuth(`${API_URL}/categories/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

  const data: ApiResponse<Category> = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Cập nhật trạng thái danh mục thất bại')
  }

  return parseCategoryResponse(data.data)
}