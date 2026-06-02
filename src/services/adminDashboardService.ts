import { API_URL, fetchWithAuth } from './auth'
import type { DashboardTimeFilter } from '../types/DashboardTimeFilter.ts'

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    code?: string
    message?: string
  }
}

interface AdminMetricApi {
  value: number | string
  change: number | string
  changeDirection: 'up' | 'down' | 'neutral' | string
}

interface AdminStatsApi {
  totalRevenue: AdminMetricApi
  totalProfit: AdminMetricApi
  activeTechnicians: AdminMetricApi
  totalOrders: AdminMetricApi
}

interface RevenueItemApi {
  label: string
  value: number | string
  date: string
}

interface RevenueStatsApi {
  range: string
  items: RevenueItemApi[]
}

interface ServiceDistributionItemApi {
  name: string
  percentage: number | string
  color: string
}

interface ServiceDistributionApi {
  items: ServiceDistributionItemApi[]
}

interface RecentOrderPersonApi {
  fullName: string
}

interface RecentOrderItemApi {
  id: string
  customer: RecentOrderPersonApi
  technician: RecentOrderPersonApi | null
  serviceName: string
  status: string
  scheduledAt: string
  amount: number | string
}

interface RecentOrdersApi {
  items: RecentOrderItemApi[]
}

export interface DashboardStatCardData {
  title: string
  value: string
  change: string
  changeDirection: 'up' | 'down' | 'neutral'
}

export interface RevenueChartDataPoint {
  day: string
  value: number
  max: number
}

export interface ServiceDistributionDataPoint {
  name: string
  percentage: number
  color: string
}

export interface RecentOrderTableItem {
  id: string
  customer: string
  service: string
  provider: string
  status: 'Đã hoàn thành' | 'Đang xử lý' | 'Chờ xác nhận'
  date: string
  amount: string
}

export interface AdminDashboardData {
  stats: DashboardStatCardData[]
  revenue: RevenueChartDataPoint[]
  services: ServiceDistributionDataPoint[]
  recentOrders: RecentOrderTableItem[]
}

const formatCurrency = (value: number): string => {
  return `${Math.round(value).toLocaleString('vi-VN')}₫`
}

const formatPercent = (value: number): string => {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
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

const normalizeDirection = (direction: string): 'up' | 'down' | 'neutral' => {
  if (direction === 'up' || direction === 'down' || direction === 'neutral') {
    return direction
  }
  return 'neutral'
}

const buildDashboardQuery = (filter: DashboardTimeFilter, includeLimit = false): string => {
  const params = new URLSearchParams()

  params.set('mode', filter.mode)

  if (filter.mode === 'year' || filter.mode === 'quarter' || filter.mode === 'month') {
    params.set('year', String(filter.year))
  }

  if (filter.mode === 'quarter') {
    params.set('quarter', String(filter.quarter))
  }

  if (filter.mode === 'month') {
    params.set('month', String(filter.month))
  }

  if (includeLimit) {
    params.set('limit', '5')
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

const mapMetric = (title: string, metric?: AdminMetricApi): DashboardStatCardData => {
  const value = parseNumber(metric?.value)
  const change = parseNumber(metric?.change)
  const direction = normalizeDirection(metric?.changeDirection || 'neutral')

  const valueText = title === 'Số thợ hoạt động' || title === 'Tổng đơn hàng'
    ? Math.round(value).toLocaleString('vi-VN')
    : formatCurrency(value)

  return {
    title,
    value: valueText,
    change: formatPercent(change),
    changeDirection: direction,
  }
}

const mapStats = (stats: AdminStatsApi): DashboardStatCardData[] => {
  return [
    mapMetric('Tổng doanh thu', stats.totalRevenue),
    mapMetric('Tổng lợi nhuận', stats.totalProfit),
    mapMetric('Số thợ hoạt động', stats.activeTechnicians),
    mapMetric('Tổng đơn hàng', stats.totalOrders),
  ]
}

const mapRevenue = (revenue: RevenueStatsApi): RevenueChartDataPoint[] => {
  const sortedItems = [...(revenue.items || [])].sort((a, b) => a.date.localeCompare(b.date))

  if (sortedItems.length === 0) {
    return []
  }

  const maxValue = Math.max(...sortedItems.map((item) => parseNumber(item.value)), 1)

  return sortedItems.map((item) => ({
    day: item.label,
    value: Math.round((parseNumber(item.value) / maxValue) * 100),
    max: 100,
  }))
}

const mapServices = (services: ServiceDistributionApi): ServiceDistributionDataPoint[] => {
  return (services.items || []).map((item) => ({
    name: item.name,
    percentage: parseNumber(item.percentage),
    color: item.color || '#3b82f6',
  }))
}

const mapOrderStatus = (status: string): 'Đã hoàn thành' | 'Đang xử lý' | 'Chờ xác nhận' => {
  const normalized = (status || '').toLowerCase().replace(/_/g, '-')

  if (normalized === 'completed') {
    return 'Đã hoàn thành'
  }

  if (['in-progress', 'processing', 'accepted', 'assigned', 'scheduled'].includes(normalized)) {
    return 'Đang xử lý'
  }

  return 'Chờ xác nhận'
}

const formatOrderDate = (dateTime: string): string => {
  if (!dateTime) {
    return '--'
  }

  const date = new Date(dateTime)
  if (Number.isNaN(date.getTime())) {
    return dateTime
  }

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })
}

const mapRecentOrders = (orders: RecentOrdersApi): RecentOrderTableItem[] => {
  return (orders.items || []).map((item) => ({
    id: item.id,
    customer: item.customer?.fullName || 'N/A',
    service: item.serviceName || 'N/A',
    provider: item.technician?.fullName || 'N/A',
    status: mapOrderStatus(item.status),
    date: formatOrderDate(item.scheduledAt),
    amount: formatCurrency(parseNumber(item.amount)),
  }))
}

const requestApi = async <T>(path: string): Promise<T> => {
  const response = await fetchWithAuth(`${API_URL}${path}`, { method: 'GET' })
  const data: ApiResponse<T> = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || 'Không thể tải dữ liệu dashboard')
  }

  return data.data
}

export const getAdminDashboardData = async (timeFilter: DashboardTimeFilter): Promise<AdminDashboardData> => {
  const query = buildDashboardQuery(timeFilter)
  const recentOrdersQuery = buildDashboardQuery(timeFilter, true)

  const [stats, revenue, services, recentOrders] = await Promise.all([
    requestApi<AdminStatsApi>(`/admin/dashboard/stats${query}`),
    requestApi<RevenueStatsApi>(`/admin/dashboard/revenue${query}`),
    requestApi<ServiceDistributionApi>(`/admin/stats/service-distribution${query}`),
    requestApi<RecentOrdersApi>(`/admin/dashboard/recent-orders${recentOrdersQuery}`),
  ])

  return {
    stats: mapStats(stats),
    revenue: mapRevenue(revenue),
    services: mapServices(services),
    recentOrders: mapRecentOrders(recentOrders),
  }
}
