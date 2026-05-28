import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminHeader } from '../components/admin/AdminHeader'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import { Footer } from '../components/layout/Footer'
import {
  formatDate,
  getVerificationRequests,
  verificationStatusColor,
  verificationStatusLabel,
} from '../services/verificationService'
import type { VerificationRequest, VerificationStatus } from '../types/VerificationRequest'
import './AdminVerificationRequests.css'

const statusFilters: Array<'all' | VerificationStatus> = ['all', 'pending', 'approved', 'rejected', 'needs_resubmit']

const statusFilterLabel: Record<'all' | VerificationStatus, string> = {
  all: 'Tất cả',
  pending: 'Chờ duyệt',
  approved: 'Đã phê duyệt',
  rejected: 'Từ chối',
  needs_resubmit: 'Yêu cầu bổ sung',
}

export default function AdminVerificationRequests() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | VerificationStatus>('pending')
  const [requests, setRequests] = useState<VerificationRequest[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getVerificationRequests()
        // Axios interceptor của bạn đang trả về response.data. Do đó response có thể là mảng trực tiếp hoặc có bọc data tuỳ thuộc API BE.
        setRequests(Array.isArray(response) ? response : (response.data || []))
      } catch (error) {
        console.error('Lỗi khi lấy danh sách yêu cầu xác minh:', error)
      }
    }
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    return requests.filter((item) => {
      const statusMatched = statusFilter === 'all' ? true : item.status === statusFilter
      const keywordMatched =
        normalized.length === 0
          ? true
          : item.fullName.toLowerCase().includes(normalized) ||
            item.phone.toLowerCase().includes(normalized) ||
            item.id.toLowerCase().includes(normalized)

      return statusMatched && keywordMatched
    })
  }, [requests, statusFilter, keyword])

  const pendingCount = requests.filter((req) => req.status === 'pending').length
  const approvedCount = requests.filter((req) => req.status === 'approved').length
  const rejectedCount = requests.filter((req) => req.status === 'rejected').length

  return (
    <div className="avr-layout">
      <AdminSidebar activeItem="verification" />

      <main className="avr-main">
        <AdminHeader
          searchPlaceholder="Tìm theo tên kỹ thuật viên, số điện thoại..."
          searchValue={keyword}
          onSearchChange={setKeyword}
        />

        <div className="avr-breadcrumb">HỆ THỐNG &gt; XÁC MINH DANH TÍNH</div>

        <section className="avr-header">
          <div>
            <h1 className="avr-title">Danh sách yêu cầu xác minh</h1>
            <p className="avr-subtitle">Duyệt hồ sơ kỹ thuật viên mới đăng ký và cập nhật trạng thái về tài khoản thợ.</p>
          </div>

          <div className="avr-stats">
            <div className="avr-stat">
              <span className="avr-stat-value">{pendingCount}</span>
              <span className="avr-stat-label">Chờ duyệt</span>
            </div>
            <div className="avr-stat">
              <span className="avr-stat-value avr-green">{approvedCount}</span>
              <span className="avr-stat-label">Đã duyệt</span>
            </div>
            <div className="avr-stat">
              <span className="avr-stat-value avr-red">{rejectedCount}</span>
              <span className="avr-stat-label">Từ chối</span>
            </div>
          </div>
        </section>

        <section className="avr-panel">
          <div className="avr-filters">
            {statusFilters.map((filter) => (
              <button
                key={filter}
                className={`avr-filter ${statusFilter === filter ? 'active' : ''}`}
                onClick={() => setStatusFilter(filter)}
                type="button"
              >
                {statusFilterLabel[filter]}
              </button>
            ))}
          </div>

          <div className="avr-table-wrap">
            <table className="avr-table">
              <thead>
                <tr>
                  <th>Mã hồ sơ</th>
                  <th>Kỹ thuật viên</th>
                  <th>Dịch vụ</th>
                  <th>Gửi lúc</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const statusStyle = verificationStatusColor[item.status]
                  return (
                    <tr key={item.id}>
                      <td className="avr-id">{item.id}</td>
                      <td>
                        <div className="avr-user">
                          <img src={item.documents.portrait} alt={item.fullName} className="avr-avatar" />
                          <div>
                            <div className="avr-name">{item.fullName}</div>
                            <div className="avr-phone">{item.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td>{item.serviceCategory}</td>
                      <td>{formatDate(item.submittedAt)}</td>
                      <td>
                        <span className="avr-status" style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}>
                          {verificationStatusLabel[item.status]}
                        </span>
                      </td>
                      <td>
                        <div className="avr-actions">
                          <button
                            type="button"
                            className="avr-btn avr-btn-outline"
                            onClick={() => navigate(`/admin/verification/${item.id}`)}
                          >
                            Xem chi tiết
                          </button>
                          <button
                            type="button"
                            className="avr-btn avr-btn-primary"
                            onClick={() => navigate(`/admin/verification/${item.id}/update`)}
                          >
                            Cập nhật
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td className="avr-empty" colSpan={6}>
                      Không có yêu cầu nào phù hợp bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="avr-footer-wrap">
          <Footer />
        </div>
      </main>
    </div>
  )
}
