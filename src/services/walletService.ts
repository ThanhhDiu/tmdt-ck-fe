import { API_URL, fetchWithAuth } from './auth'

type ApiResponse<T> = {
  success: boolean
  data: T
  error?: {
    code?: string
    message?: string
    fields?: Record<string, string>
  }
}

type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type WalletPocketType = 'credit' | 'personal'
export type WalletTransactionType = 'topup' | 'withdraw' | 'commission' | 'payment' | 'refund' | 'all'
export type WalletPaymentMethod = 'momo' | 'zalopay' | 'vietqr' | 'vnpay'

export type WalletPocket = {
  type: WalletPocketType
  balance: number
  pendingBalance: number
  status: string
}

export type WalletSummary = {
  userId: string
  totalBalance: number
  creditWallet: WalletPocket
  personalWallet: WalletPocket
  totalEarned: number
  totalWithdrawn: number
  currency: string
  updatedAt: string | null
}

export type WalletTransaction = {
  id: string
  type: Exclude<WalletTransactionType, 'all'>
  walletType: WalletPocketType
  title: string
  category: string
  amount: number
  afterBalance: number | null
  note: string
  actor: string
  relatedOrderCode: string | null
  status: string
  createdAt: string | null
}

export type WalletTransactionList = {
  items: WalletTransaction[]
  pagination: PaginationMeta
}

export type WalletTopUpResult = {
  transactionId: string
  amount: number
  walletType: WalletPocketType
  method: WalletPaymentMethod
  checkoutUrl: string | null
  deepLink: string | null
  qrCodeUrl: string | null
  paymentInfo: {
    bankName: string
    accountName: string
    accountNumber: string
    transferContent: string
    qrCode: string | null
  } | null
  expiredAt: string | null
  status: string
}

export type WalletTopUpConfirmResult = {
  transactionId: string
  status: string
  message: string
}

export type BankAccount = {
  id: string
  bankName: string
  accountNumber: string
  accountOwner: string
  isDefault: boolean
  createdAt: string | null
}

export type WalletWithdrawResult = {
  transactionId: string
  amount: number
  fee: number
  netAmount: number
  walletType: WalletPocketType
  remainingBalance: number
  bankAccount: {
    bankName: string
    accountNumber: string
    owner: string
  } | null
  status: string
}

const parseNumber = (value?: number | string | null): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
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
    throw new Error(payload.error?.message || 'Không thể xử lý yêu cầu ví')
  }

  return payload.data
}

const toWalletPocketType = (value?: string | null): WalletPocketType =>
  value?.toLowerCase() === 'personal' ? 'personal' : 'credit'

const toWalletPaymentMethod = (value?: string | null): WalletPaymentMethod => {
  const normalized = value?.toLowerCase()
  if (normalized === 'momo' || normalized === 'zalopay' || normalized === 'vietqr') {
    return normalized
  }
  return 'vnpay'
}

export const getWalletSummary = async (): Promise<WalletSummary> => {
  const payload = await requestApi<{
    userId?: string
    totalBalance?: number | string | null
    creditWallet?: {
      type?: string
      balance?: number | string | null
      pendingBalance?: number | string | null
      status?: string
    } | null
    personalWallet?: {
      type?: string
      balance?: number | string | null
      pendingBalance?: number | string | null
      status?: string
    } | null
    totalEarned?: number | string | null
    totalWithdrawn?: number | string | null
    currency?: string
    updatedAt?: string | null
  }>('/wallet')

  return {
    userId: payload.userId || '',
    totalBalance: parseNumber(payload.totalBalance),
    creditWallet: {
      type: toWalletPocketType(payload.creditWallet?.type),
      balance: parseNumber(payload.creditWallet?.balance),
      pendingBalance: parseNumber(payload.creditWallet?.pendingBalance),
      status: payload.creditWallet?.status || 'normal',
    },
    personalWallet: {
      type: toWalletPocketType(payload.personalWallet?.type || 'personal'),
      balance: parseNumber(payload.personalWallet?.balance),
      pendingBalance: parseNumber(payload.personalWallet?.pendingBalance),
      status: payload.personalWallet?.status || 'normal',
    },
    totalEarned: parseNumber(payload.totalEarned),
    totalWithdrawn: parseNumber(payload.totalWithdrawn),
    currency: payload.currency || 'VND',
    updatedAt: payload.updatedAt || null,
  }
}

export const getWalletTransactions = async (
  type: WalletTransactionType = 'all',
  walletType: WalletPocketType | 'all' = 'all',
  page: number = 1,
  limit: number = 20,
): Promise<WalletTransactionList> => {
  const query = new URLSearchParams({
    type,
    walletType,
    page: String(page),
    limit: String(limit),
  })

  const payload = await requestApi<{
    items?: Array<{
      id?: string
      type?: string
      walletType?: string
      title?: string
      category?: string
      amount?: number | string | null
      afterBalance?: number | null
      note?: string
      actor?: string
      relatedOrderCode?: string | null
      status?: string
      createdAt?: string | null
    }>
    pagination?: Partial<PaginationMeta>
  }>(`/wallet/transactions?${query.toString()}`)

  const items = (payload.items || []).map((item) => ({
    id: item.id || '',
    type: ((item.type || 'payment').toLowerCase() as Exclude<WalletTransactionType, 'all'>),
    walletType: toWalletPocketType(item.walletType),
    title: item.title || 'Giao dịch ví',
    category: item.category || '--',
    amount: parseNumber(item.amount),
    afterBalance: typeof item.afterBalance === 'number' ? item.afterBalance : null,
    note: item.note || '',
    actor: item.actor || '',
    relatedOrderCode: item.relatedOrderCode || null,
    status: item.status || 'pending',
    createdAt: item.createdAt || null,
  }))

  return {
    items,
    pagination: {
      page: payload.pagination?.page || page,
      limit: payload.pagination?.limit || limit,
      total: payload.pagination?.total || items.length,
      totalPages: payload.pagination?.totalPages || 1,
    },
  }
}

export const createWalletTopUp = async (
  amount: number,
  method: WalletPaymentMethod,
): Promise<WalletTopUpResult> => {
  const payload = await requestApi<{
    transactionId?: string
    amount?: number | string | null
    walletType?: string
    method?: string
    checkoutUrl?: string | null
    deepLink?: string | null
    qrCodeUrl?: string | null
    paymentInfo?: {
      bankName?: string
      accountName?: string
      accountNumber?: string
      transferContent?: string
      qrCode?: string | null
    } | null
    expiredAt?: string | null
    status?: string
  }>('/wallet/topup', {
    method: 'POST',
    body: JSON.stringify({
      amount,
      method,
    }),
  })

  return {
    transactionId: payload.transactionId || '',
    amount: parseNumber(payload.amount),
    walletType: toWalletPocketType(payload.walletType),
    method: toWalletPaymentMethod(payload.method),
    checkoutUrl: payload.checkoutUrl || null,
    deepLink: payload.deepLink || null,
    qrCodeUrl: payload.qrCodeUrl || null,
    paymentInfo: payload.paymentInfo
      ? {
          bankName: payload.paymentInfo.bankName || '--',
          accountName: payload.paymentInfo.accountName || '--',
          accountNumber: payload.paymentInfo.accountNumber || '--',
          transferContent: payload.paymentInfo.transferContent || '--',
          qrCode: payload.paymentInfo.qrCode || null,
        }
      : null,
    expiredAt: payload.expiredAt || null,
    status: payload.status || 'awaiting_payment',
  }
}

export const confirmWalletTopUp = async (transactionId: string): Promise<WalletTopUpConfirmResult> => {
  const payload = await requestApi<{
    transactionId?: string
    status?: string
    message?: string
  }>('/wallet/topup/confirm', {
    method: 'POST',
    body: JSON.stringify({ transactionId }),
  })

  return {
    transactionId: payload.transactionId || transactionId,
    status: payload.status || 'pending_verification',
    message: payload.message || 'Yêu cầu đang được xác minh',
  }
}

export const getWalletBankAccounts = async (): Promise<BankAccount[]> => {
  const payload = await requestApi<{
    items?: Array<{
      id?: string
      bankName?: string
      accountNumber?: string
      accountOwner?: string
      isDefault?: boolean
      createdAt?: string | null
    }>
  }>('/wallet/bank-accounts')

  return (payload.items || []).map((item) => ({
    id: item.id || '',
    bankName: item.bankName || '--',
    accountNumber: item.accountNumber || '--',
    accountOwner: item.accountOwner || '--',
    isDefault: Boolean(item.isDefault),
    createdAt: item.createdAt || null,
  }))
}

export const createWalletBankAccount = async (payload: {
  bankName: string
  accountNumber: string
  accountOwner: string
}): Promise<BankAccount> => {
  const data = await requestApi<{
    id?: string
    bankName?: string
    accountNumber?: string
    accountOwner?: string
    isDefault?: boolean
    createdAt?: string | null
  }>('/wallet/bank-accounts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return {
    id: data.id || '',
    bankName: data.bankName || '--',
    accountNumber: data.accountNumber || '--',
    accountOwner: data.accountOwner || '--',
    isDefault: Boolean(data.isDefault),
    createdAt: data.createdAt || null,
  }
}

export const deleteWalletBankAccount = async (id: string): Promise<void> => {
  await requestApi(`/wallet/bank-accounts/${id}`, {
    method: 'DELETE',
  })
}

export const createWalletWithdraw = async (payload: {
  amount: number
  bankAccountId: string
}): Promise<WalletWithdrawResult> => {
  const data = await requestApi<{
    transactionId?: string
    amount?: number | string | null
    fee?: number | string | null
    netAmount?: number | string | null
    walletType?: string
    remainingBalance?: number | string | null
    bankAccount?: {
      bankName?: string
      accountNumber?: string
      owner?: string
    } | null
    status?: string
  }>('/wallet/withdraw', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return {
    transactionId: data.transactionId || '',
    amount: parseNumber(data.amount),
    fee: parseNumber(data.fee),
    netAmount: parseNumber(data.netAmount),
    walletType: toWalletPocketType(data.walletType || 'personal'),
    remainingBalance: parseNumber(data.remainingBalance),
    bankAccount: data.bankAccount
      ? {
          bankName: data.bankAccount.bankName || '--',
          accountNumber: data.bankAccount.accountNumber || '--',
          owner: data.bankAccount.owner || '--',
        }
      : null,
    status: data.status || 'pending',
  }
}
