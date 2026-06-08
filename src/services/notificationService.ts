import { API_URL, fetchWithAuth } from './auth'

type ApiResponse<T> = {
  success: boolean
  data: T
}

export type NotificationItem = {
  id: string
  type: string
  title: string
  body: string
  data?: Record<string, unknown>
  isRead: boolean
  createdAt: string
}

export type NotificationListData = {
  unreadCount: number
  items: NotificationItem[]
}

export const getMyNotifications = async (
  page = 1,
  limit = 10
): Promise<NotificationListData> => {
  const response = await fetchWithAuth(
    `${API_URL}/notifications?page=${page}&limit=${limit}`
  )
  const payload = (await response.json()) as ApiResponse<NotificationListData>

  if (!response.ok || !payload.success) {
    throw new Error('Không thể tải thông báo')
  }

  return payload.data
}

export const markNotificationAsRead = async (id: string): Promise<void> => {
  const response = await fetchWithAuth(`${API_URL}/notifications/${id}/read`, {
    method: 'PATCH',
  })
  const payload = (await response.json()) as ApiResponse<unknown>

  if (!response.ok || !payload.success) {
    throw new Error('Không thể đánh dấu đã đọc')
  }
}

export const markAllNotificationsAsRead = async (): Promise<void> => {
  const response = await fetchWithAuth(`${API_URL}/notifications/read-all`, {
    method: 'PATCH',
  })
  const payload = (await response.json()) as ApiResponse<unknown>

  if (!response.ok || !payload.success) {
    throw new Error('Không thể đánh dấu tất cả đã đọc')
  }
}
