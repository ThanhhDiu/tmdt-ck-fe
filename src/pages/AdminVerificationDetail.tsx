import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminHeader } from '../components/admin/AdminHeader'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import { Footer } from '../components/layout/Footer'
import {
  formatDate,
  getVerificationRequestById,
  verificationStatusColor,
  verificationStatusLabel,
} from '../services/verificationService'
import type { VerificationRequest } from '../types/VerificationRequest'
import { resolveMediaUrl } from '../utils/mediaUrl'
import './AdminVerificationDetail.css'

export default function AdminVerificationDetail() {
  const navigate = useNavigate()
  const { requestId } = useParams()
  const [request, setRequest] = useState<VerificationRequest | null>(null)

  useEffect(() => {
    if (requestId) {
      const fetchDetail = async () => {
        try {
          const response = await getVerificationRequestById(requestId)
          setRequest(response ?? null)
        } catch (error) {
          console.error('Lỗi khi lấy chi tiết hồ sơ xác minh:', error)
        }
      }
      fetchDetail()
    }
  }, [requestId])

  if (!request) {
    return (
      <div className="avd-empty-page">
        <h2>Không tìm thấy hồ sơ xác minh</h2>
        <button onClick={() => navigate('/admin/verification')} type="button">Quay lại danh sách</button>
      </div>
    )
  }

  const statusStyle = verificationStatusColor[request.status]

  return (
    <div className="avd-layout">
      <AdminSidebar activeItem="verification" />

      <main className="avd-main">
        <AdminHeader searchPlaceholder="Tìm trong hồ sơ..." />

        <div className="avd-breadcrumb">
          <button className="avd-link" onClick={() => navigate('/admin/verification')} type="button">
            Danh sách xác minh
          </button>
          <span>›</span>
          <span>Hồ sơ {request.id}</span>
        </div>

        <div className="avd-header-row">
          <h1 className="avd-title">Chi tiết hồ sơ xác minh</h1>
          <span className="avd-status" style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}>
            {verificationStatusLabel[request.status]}
          </span>
        </div>

        <section className="avd-grid">
          <div className="avd-docs-card">
            <h3>Tài liệu định danh</h3>
            <p>Cần đối soát rõ thông tin, ảnh chụp và độ hợp lệ.</p>

            <div className="avd-doc-grid">
              <figure>
                <img src={resolveMediaUrl(request.documents.idFront) || ''} alt="CCCD mặt trước" />
                <figcaption>CCCD mặt trước</figcaption>
              </figure>
              <figure>
                <img src={resolveMediaUrl(request.documents.idBack) || ''} alt="CCCD mặt sau" />
                <figcaption>CCCD mặt sau</figcaption>
              </figure>
              <figure>
                <img src={resolveMediaUrl(request.documents.portrait) || ''} alt="Ảnh chân dung" />
                <figcaption>Ảnh chân dung</figcaption>
              </figure>
              {request.documents.certificate && (
                <figure>
                  <img src={resolveMediaUrl(request.documents.certificate) || ''} alt="Chứng chỉ nghề" />
                  <figcaption>Chứng chỉ nghề</figcaption>
                </figure>
              )}
            </div>
          </div>

          <aside className="avd-profile-card">
            <div className="avd-tech">
              <img src={resolveMediaUrl(request.documents.portrait) || ''} alt={request.fullName} />
              <div>
                <h3>{request.fullName}</h3>
                <p>ID thợ: {request.technicianId}</p>
              </div>
            </div>

            <div className="avd-meta">
              <div><span>Điện thoại</span><strong>{request.phone}</strong></div>
              <div><span>Email</span><strong>{request.email}</strong></div>
              <div><span>Khu vực</span><strong>{request.district}</strong></div>
              <div><span>Dịch vụ</span><strong>{request.serviceCategory}</strong></div>
              <div><span>Kinh nghiệm</span><strong>{request.yearsExperience} năm</strong></div>
              <div><span>Gửi hồ sơ</span><strong>{formatDate(request.submittedAt)}</strong></div>
            </div>

            {request.note && (
              <div className="avd-note">
                <h4>Ghi chú kiểm duyệt</h4>
                <p>{request.note}</p>
              </div>
            )}

            <div className="avd-actions">
              <button
                className="avd-btn avd-btn-green"
                type="button"
                onClick={() => navigate(`/admin/verification/${request.id}/update?decision=approved`)}
              >
                Phê duyệt hồ sơ
              </button>
              <button
                className="avd-btn avd-btn-red"
                type="button"
                onClick={() => navigate(`/admin/verification/${request.id}/update?decision=rejected`)}
              >
                Từ chối hồ sơ
              </button>
              <button
                className="avd-btn avd-btn-outline"
                type="button"
                onClick={() => navigate(`/admin/verification/${request.id}/update?decision=needs_resubmit`)}
              >
                Yêu cầu bổ sung
              </button>
            </div>
          </aside>
        </section>

        <div className="avd-footer-wrap">
          <Footer />
        </div>
      </main>
    </div>
  )
}
