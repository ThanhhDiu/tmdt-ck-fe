import { API_URL, fetchWithAuth } from './auth'

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    code?: string
    message?: string
  }
}

interface PagedResponseApi<T> {
  content?: T[]
  items?: T[]
  pagination?: {
    page?: number
    limit?: number
    size?: number
    total?: number
    totalPages?: number
  }
  page?: number
  limit?: number
  size?: number
  totalElements?: number
  totalPages?: number
}

interface CommissionSettingsApi {
  fixedCommissionFee?: number | string | null
  minimumCommissionBalance?: number | string | null
  autoLockEnabled?: boolean | null
  updatedAt?: string | null
}

interface CommissionUpdateApi {
  fixedCommissionFee?: number | string | null
  minimumCommissionBalance?: number | string | null
  updatedBy?: string | null
  updatedAt?: string | null
}

interface CommissionWalletItemApi {
  technicianId?: number | string | null
  technicianName?: string | null
  walletBalance?: number | string | null
  walletStatus?: string | null
  totalCommissionPaid?: number | string | null
  lastOrderAt?: string | null
  locked?: boolean | null
}

interface CommissionTransactionItemApi {
  id?: string | null
  transactionCode?: string | null
  transactionType?: string | null
  amount?: number | string | null
  technicianName?: string | null
  createdAt?: string | null
  time?: string | null
  date?: string | null
  partner?: {
    name?: string | null
    area?: string | null
  } | null
  type?: string | null
  status?: string | null
  note?: string | null
}

export type AdminCommissionWalletStatus = 'normal' | 'low' | 'locked'

export type AdminCommissionTransactionType = 'commission' | 'withdraw' | 'topup'

export interface AdminCommissionSettings {
  fixedCommissionFee: string
  minimumCommissionBalance: string
  autoLockEnabled: boolean
  updatedAtLabel: string
}

export interface AdminCommissionUpdateResult extends AdminCommissionSettings {
  updatedBy: string
}

export interface AdminCommissionWalletItem {
  technicianId: string
  technicianName: string
  walletBalance: number
  walletBalanceLabel: string
  walletStatus: AdminCommissionWalletStatus
  walletStatusLabel: string
  totalCommissionPaid: number
  totalCommissionPaidLabel: string
  lastOrderAtLabel: string
  locked: boolean
}

export interface AdminCommissionWalletListResult {
  items: AdminCommissionWalletItem[]
  page: number
  limit: number
  totalElements: number
  totalPages: number
}

export interface AdminCommissionTransactionItem {
  id: string
  transactionCode: string
  time: string
  date: string
  partnerName: string
  partnerArea: string
  type: AdminCommissionTransactionType
  typeLabel: string
  amount: number
  amountLabel: string
  status: 'done' | 'pending'
  statusLabel: string
}

export interface AdminCommissionTransactionListResult {
  items: AdminCommissionTransactionItem[]
  page: number
  limit: number
  totalElements: number
  totalPages: number
  totalBalance: number
}

export interface AdminCommissionTransactionFilters {
  type?: 'all' | AdminCommissionTransactionType
  date?: string
  page?: number
  limit?: number
}

export interface AdminCommissionWalletFilters {
  status?: 'all' | AdminCommissionWalletStatus
  keyword?: string
  page?: number
  size?: number
}

const walletStatusLabelMap: Record<AdminCommissionWalletStatus, string> = {
  normal: 'Bình thường',
  low: 'Sắp hết',
  locked: 'Đã khóa',
}

const transactionTypeLabelMap: Record<AdminCommissionTransactionType, string> = {
  commission: 'HOA HỒNG',
  withdraw: 'RÚT TIỀN',
  topup: 'NẠP TIỀN',
}

const parseNumber = (value: number | string | null | undefined): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

const formatCurrency = (value: number): string => `${value.toLocaleString('vi-VN')}đ`

const formatSignedCurrency = (value: number): string => `${value > 0 ? '+' : ''}${formatCurrency(value)}`

const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return '--'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const formatDate = (value?: string | null): string => {
  if (!value) {
    return '--'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('vi-VN')
}

const formatTime = (value?: string | null): string => {
  if (!value) {
    return '--'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const readPagedResult = <T>(payload: PagedResponseApi<T>) => {
  const items = payload.content || payload.items || []
  const pagination = payload.pagination

  return {
    items,
    page: pagination?.page ?? payload.page ?? 1,
    limit: pagination?.limit ?? pagination?.size ?? payload.limit ?? payload.size ?? 10,
    totalElements: pagination?.total ?? payload.totalElements ?? items.length,
    totalPages: pagination?.totalPages ?? payload.totalPages ?? 1,
  }
}

const requestApi = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetchWithAuth(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })

  const payload: ApiResponse<T> = await response.json()

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message || 'Không thể tải dữ liệu hoa hồng')
  }

  return payload.data
}

const toWalletStatus = (status?: string | null): AdminCommissionWalletStatus => {
  const normalized = (status || '').trim().toLowerCase()

  if (normalized === 'low_balance' || normalized === 'low') {
    return 'low'
  }

  if (normalized === 'locked') {
    return 'locked'
  }

  return 'normal'
}

const toTransactionType = (type?: string | null): AdminCommissionTransactionType => {
  const normalized = (type || '').trim().toLowerCase()

  if (normalized === 'withdraw') {
    return 'withdraw'
  }

  if (normalized === 'topup') {
    return 'topup'
  }

  return 'commission'
}

const toTransactionStatus = (status?: string | null): 'done' | 'pending' => {
  const normalized = (status || '').trim().toLowerCase()

  if (['done', 'success', 'approved', 'completed'].includes(normalized)) {
    return 'done'
  }

  return 'pending'
}

const mapSettings = (payload: CommissionSettingsApi): AdminCommissionSettings => ({
  fixedCommissionFee: String(parseNumber(payload.fixedCommissionFee)),
  minimumCommissionBalance: String(parseNumber(payload.minimumCommissionBalance)),
  autoLockEnabled: Boolean(payload.autoLockEnabled),
  updatedAtLabel: formatDateTime(payload.updatedAt),
})

export const getAdminCommissionSettings = async (): Promise<AdminCommissionSettings> => {
  const payload = await requestApi<CommissionSettingsApi>('/admin/commission-settings')
  return mapSettings(payload)
}

export const updateAdminCommission = async (payload: {
  fixedCommissionFee: number
  minimumCommissionBalance: number
}): Promise<AdminCommissionUpdateResult> => {
  const data = await requestApi<CommissionUpdateApi>('/admin/commission', {
    method: 'PATCH',
    body: JSON.stringify({
      fixedCommissionFee: payload.fixedCommissionFee,
      minimumCommissionBalance: payload.minimumCommissionBalance,
    }),
  })

  return {
    ...mapSettings(data),
    updatedBy: data.updatedBy || 'Admin',
  }
}

export const getAdminCommissionWallets = async (filters: AdminCommissionWalletFilters = {}): Promise<AdminCommissionWalletListResult> => {
  const query = new URLSearchParams()

  if (filters.status && filters.status !== 'all') {
    query.set('status', filters.status === 'low' ? 'low_balance' : filters.status)
  }

  if (filters.keyword?.trim()) {
    query.set('keyword', filters.keyword.trim())
  }

  query.set('page', String(filters.page || 1))
  query.set('size', String(filters.size || 10))

  const payload = await requestApi<PagedResponseApi<CommissionWalletItemApi>>(`/admin/commission-wallets?${query.toString()}`)
  const page = readPagedResult(payload)

  return {
    items: page.items.map((item) => {
      const walletStatus = toWalletStatus(item.walletStatus)
      const walletBalance = parseNumber(item.walletBalance)
      const totalCommissionPaid = parseNumber(item.totalCommissionPaid)

      return {
        technicianId: String(item.technicianId ?? '--'),
        technicianName: item.technicianName || '--',
        walletBalance,
        walletBalanceLabel: formatCurrency(walletBalance),
        walletStatus,
        walletStatusLabel: walletStatusLabelMap[walletStatus],
        totalCommissionPaid,
        totalCommissionPaidLabel: formatCurrency(totalCommissionPaid),
        lastOrderAtLabel: formatDateTime(item.lastOrderAt),
        locked: Boolean(item.locked),
      }
    }),
    page: page.page,
    limit: page.limit,
    totalElements: page.totalElements,
    totalPages: page.totalPages,
  }
}

export const getAdminCommissionTransactions = async (filters: AdminCommissionTransactionFilters = {}): Promise<AdminCommissionTransactionListResult> => {
  const query = new URLSearchParams()

  query.set('type', filters.type || 'all')

  if (filters.date?.trim()) {
    query.set('date', filters.date.trim())
  }

  query.set('page', String(filters.page || 1))
  query.set('limit', String(filters.limit || 10))

  const payload = await requestApi<PagedResponseApi<CommissionTransactionItemApi>>(`/admin/transactions?${query.toString()}`)
  const page = readPagedResult(payload)

  const items = page.items.map((item) => {
    const transactionType = toTransactionType(item.transactionType || item.type)
    const amount = parseNumber(item.amount)
    const transactionStatus = toTransactionStatus(item.status)

    return {
      id: item.id || item.transactionCode || '--',
      transactionCode: item.transactionCode || item.id || '--',
      time: item.time || formatTime(item.createdAt),
      date: item.date || formatDate(item.createdAt),
      partnerName: item.partner?.name || item.technicianName || '--',
      partnerArea: item.partner?.area || item.note || '--',
      type: transactionType,
      typeLabel: transactionTypeLabelMap[transactionType],
      amount,
      amountLabel: formatSignedCurrency(amount),
      status: transactionStatus,
      statusLabel: transactionStatus === 'done' ? 'Hoàn tất' : 'Chờ duyệt',
    }
  })

  return {
    items,
    page: page.page,
    limit: page.limit,
    totalElements: page.totalElements,
    totalPages: page.totalPages,
    totalBalance: parseNumber((payload as PagedResponseApi<CommissionTransactionItemApi> & { totalBalance?: number | string }).totalBalance),
  }
}
