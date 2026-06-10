import { API_URL, fetchWithAuth } from './auth'

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    code?: string
    message?: string
  }
}

interface PaginationApi {
  page?: number
  limit?: number
  size?: number
  total?: number
  totalPages?: number
}

interface PagedResponseApi<T> {
  items?: T[]
  content?: T[]
  page?: number
  limit?: number
  size?: number
  totalElements?: number
  totalPages?: number
  pagination?: PaginationApi
}

interface WalletApi {
  userId?: string | null
  balance?: number | string | null
  creditBalance?: number | string | null
  personalBalance?: number | string | null
  status?: string | null
  pendingBalance?: number | string | null
  totalEarned?: number | string | null
  totalWithdrawn?: number | string | null
  currency?: string | null
  updatedAt?: string | null
}

interface WalletTransactionApi {
  id?: string | null
  type?: string | null
  title?: string | null
  category?: string | null
  amount?: number | string | null
  afterBalance?: number | null
  note?: string | null
  actor?: string | null
  relatedOrderCode?: string | null
  status?: string | null
  createdAt?: string | null
}

interface BankAccountApi {
  id?: string | null
  bankName?: string | null
  accountNumber?: string | null
  accountOwner?: string | null
  isDefault?: boolean | null
  createdAt?: string | null
}

interface BankAccountListApi {
  items?: BankAccountApi[] | null
}

interface TopUpApi {
  transactionId?: string | null
  amount?: number | string | null
  method?: string | null
  checkoutUrl?: string | null
  deepLink?: string | null
  qrCodeUrl?: string | null
  paymentInfo?: {
    bankName?: string | null
    accountName?: string | null
    accountNumber?: string | null
    transferContent?: string | null
    qrCode?: string | null
  } | null
  expiredAt?: string | null
  status?: string | null
}

interface WithdrawApi {
  transactionId?: string | null
  amount?: number | string | null
  fee?: number | string | null
  netAmount?: number | string | null
  bankAccount?: {
    bankName?: string | null
    accountNumber?: string | null
    owner?: string | null
  } | null
  status?: string | null
}

export type WalletStatus = 'normal' | 'low_balance' | 'locked'
export type WalletGroup = 'credit' | 'personal'

export interface TechnicianWalletSummary {
  userId: string
  creditBalance: number
  personalBalance: number
  pendingBalance: number
  totalEarned: number
  totalWithdrawn: number
  currency: string
  status: WalletStatus
  updatedAt: string
}

export interface TechnicianWalletHistoryItem {
  id: string
  type: string
  title: string
  category: string
  amount: number
  afterBalance: number | null
  note: string
  actor: string
  relatedOrderCode: string
  status: 'success' | 'pending'
  createdAt: string
  walletGroup: WalletGroup
}

export interface TechnicianBankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountOwner: string
  isDefault: boolean
  createdAt: string
}

export interface WalletTopUpResult {
  transactionId: string
  amount: number
  method: string
  checkoutUrl: string
  deepLink: string
  qrCodeUrl: string
  expiredAt: string
  status: string
}

export interface WalletWithdrawResult {
  transactionId: string
  amount: number
  fee: number
  netAmount: number
  status: string
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

const requestApi = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetchWithAuth(`${API_URL}${path}`, init)
  const payload: ApiResponse<T> = await response.json()

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message || 'Không thể tải dữ liệu ví')
  }

  return payload.data
}

const readPagedItems = <T>(payload: PagedResponseApi<T>): T[] => payload.items || payload.content || []

const toWalletStatus = (value?: string | null): WalletStatus => {
  const normalized = (value || '').trim().toLowerCase()

  if (normalized === 'locked') {
    return 'locked'
  }

  if (normalized === 'low' || normalized === 'low_balance') {
    return 'low_balance'
  }

  return 'normal'
}

const mapWalletGroup = (transaction: WalletTransactionApi): WalletGroup => {
  const type = (transaction.type || '').trim().toLowerCase()
  const category = (transaction.category || '').trim().toLowerCase()
  const amount = parseNumber(transaction.amount)

  if (type === 'topup') {
    return 'credit'
  }

  if (type === 'withdraw') {
    return 'personal'
  }

  if (type === 'commission') {
    if (category === 'commission_deduction' || amount < 0) {
      return 'credit'
    }

    return 'personal'
  }

  return amount >= 0 ? 'personal' : 'credit'
}

const mapTransactionStatus = (status?: string | null): 'success' | 'pending' => {
  const normalized = (status || '').trim().toLowerCase()
  return normalized === 'success' ? 'success' : 'pending'
}

export const getTechnicianWalletSummary = async (): Promise<TechnicianWalletSummary> => {
  const wallet = await requestApi<WalletApi>('/wallet', { method: 'GET' })

  return {
    userId: wallet.userId || '',
    creditBalance: parseNumber(wallet.creditBalance ?? wallet.balance),
    personalBalance: parseNumber(wallet.personalBalance),
    pendingBalance: parseNumber(wallet.pendingBalance),
    totalEarned: parseNumber(wallet.totalEarned),
    totalWithdrawn: parseNumber(wallet.totalWithdrawn),
    currency: wallet.currency || 'VND',
    status: toWalletStatus(wallet.status),
    updatedAt: wallet.updatedAt || '',
  }
}

export const getTechnicianWalletHistory = async (): Promise<TechnicianWalletHistoryItem[]> => {
  const payload = await requestApi<PagedResponseApi<WalletTransactionApi>>('/wallet/transactions?type=all&page=1&limit=50', {
    method: 'GET',
  })

  return readPagedItems(payload).map((item) => ({
    id: item.id || '',
    type: item.type || '',
    title: item.title || 'Giao dịch ví',
    category: item.category || '',
    amount: parseNumber(item.amount),
    afterBalance: item.afterBalance ?? null,
    note: item.note || '',
    actor: item.actor || '',
    relatedOrderCode: item.relatedOrderCode || '',
    status: mapTransactionStatus(item.status),
    createdAt: item.createdAt || '',
    walletGroup: mapWalletGroup(item),
  }))
}

export const getTechnicianBankAccounts = async (): Promise<TechnicianBankAccount[]> => {
  const payload = await requestApi<BankAccountListApi>('/wallet/bank-accounts', { method: 'GET' })

  return (payload.items || []).map((item) => ({
    id: item.id || '',
    bankName: item.bankName || '',
    accountNumber: item.accountNumber || '',
    accountOwner: item.accountOwner || '',
    isDefault: Boolean(item.isDefault),
    createdAt: item.createdAt || '',
  }))
}

export const createTechnicianBankAccount = async (input: {
  bankName: string
  accountNumber: string
  accountOwner: string
}): Promise<TechnicianBankAccount> => {
  const payload = await requestApi<BankAccountApi>('/wallet/bank-accounts', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return {
    id: payload.id || '',
    bankName: payload.bankName || '',
    accountNumber: payload.accountNumber || '',
    accountOwner: payload.accountOwner || '',
    isDefault: Boolean(payload.isDefault),
    createdAt: payload.createdAt || '',
  }
}

export const createTechnicianWalletTopUp = async (amount: number): Promise<WalletTopUpResult> => {
  const payload = await requestApi<TopUpApi>('/wallet/topup', {
    method: 'POST',
    body: JSON.stringify({
      amount,
      method: 'vnpay',
    }),
  })

  return {
    transactionId: payload.transactionId || '',
    amount: parseNumber(payload.amount),
    method: payload.method || 'vnpay',
    checkoutUrl: payload.checkoutUrl || '',
    deepLink: payload.deepLink || '',
    qrCodeUrl: payload.qrCodeUrl || '',
    expiredAt: payload.expiredAt || '',
    status: payload.status || '',
  }
}

export const createTechnicianWalletWithdraw = async (input: {
  amount: number
  bankAccountId: string
}): Promise<WalletWithdrawResult> => {
  const payload = await requestApi<WithdrawApi>('/wallet/withdraw', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return {
    transactionId: payload.transactionId || '',
    amount: parseNumber(payload.amount),
    fee: parseNumber(payload.fee),
    netAmount: parseNumber(payload.netAmount),
    status: payload.status || '',
  }
}
