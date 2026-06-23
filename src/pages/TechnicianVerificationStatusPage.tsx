import React, { useState } from 'react'
import { Clock, CheckCircle, AlertCircle, Lock, Phone, MessageCircle, Mail, Shield } from 'lucide-react'
import './TechnicianVerificationStatusPage.css'

type VerificationStatus = 'pending' | 'processing' | 'completed' | 'rejected'

interface VerificationStatusData {
  status: VerificationStatus
  submittedAt: string
  documents: {
    idFront: {
      type: string
      status: 'approved' | 'pending' | 'rejected'
      image?: string
    }
    idBack: {
      type: string
      status: 'approved' | 'pending' | 'rejected'
      image?: string
    }
    faceSelfie: {
      type: string
      status: 'approved' | 'pending' | 'rejected'
      image?: string
    }
  }
}

export const TechnicianVerificationStatusPage: React.FC = () => {
  const [verificationData] = useState<VerificationStatusData>({
    status: 'processing',
    submittedAt: '24/05/2026 16:30',
    documents: {
      idFront: {
        type: 'CCCD mặt trước',
        status: 'approved',
        image: 'https://i.pravatar.cc/150?img=1',
      },
      idBack: {
        type: 'CCCD mặt sau',
        status: 'approved',
        image: 'https://i.pravatar.cc/150?img=2',
      },
      faceSelfie: {
        type: 'Xác thực khuôn mặt',
        status: 'approved',
        image: 'https://i.pravatar.cc/150?img=3',
      },
    },
  })

  const getDocumentStatusLabel = (status: 'approved' | 'pending' | 'rejected') => {
    switch (status) {
      case 'approved':
        return 'ĐÃ NHẬN'
      case 'pending':
        return 'CHỜ DUYỆT'
      case 'rejected':
        return 'BỊ TỪ CHỐI'
      default:
        return 'CHỜ DUYỆT'
    }
  }

  return (
    <div className="verification-status-page">
      <div className="status-container">
        {/* Header */}
        <div className="status-header">
          <h1 className="status-title">Xác minh danh tính</h1>
        </div>

        <div className="status-main-content">
          {/* Left Content */}
          <div className="status-left">
            {/* Timeline Progress */}
            <div className="timeline-section">
              <div className="timeline-progress">
                {/* Step 1: Submitted */}
                <div className="timeline-step completed">
                  <div className="step-circle">
                    <CheckCircle size={24} />
                  </div>
                  <div className="step-content">
                    <p className="step-label">Gửi hồ sơ</p>
                    <p className="step-date">{verificationData.submittedAt}</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="timeline-connector completed"></div>

                {/* Step 2: Processing */}
                <div className={`timeline-step ${verificationData.status === 'processing' ? 'active' : ''}`}>
                  <div className={`step-circle ${verificationData.status === 'processing' ? 'active' : ''}`}>
                    <Clock size={24} />
                  </div>
                  <div className="step-content">
                    <p className="step-label">ĐANG PHÊ DUYỆT</p>
                    <p className="step-description">Dự kiến 24h làm việc</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="timeline-connector"></div>

                {/* Step 3: Complete */}
                <div className="timeline-step">
                  <div className="step-circle">
                    <Shield size={24} />
                  </div>
                  <div className="step-content">
                    <p className="step-label">HOÀN TẤT</p>
                    <p className="step-description">Chờ phê duyệt</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Processing Message */}
            <div className="processing-message">
              <div className="message-icon">
                <Clock size={32} />
              </div>
              <div className="message-content">
                <h3 className="message-title">Hồ sơ của bạn đang được xử lý</h3>
                <p className="message-text">
                  Chúng tôi đang kiểm tra thông tin và tài liệu bạn đã cung cấp. Khi quá số tối đa 24h làm việc sẽ có thông báo đến hộp thư...
                </p>
                <p className="message-info">
                  <AlertCircle size={16} />
                  Bạn sẽ nhận được thông báo qua ứng dụng khi có kết quả.
                </p>
              </div>
            </div>

            {/* Document Details */}
            <div className="document-details">
              <h3 className="details-title">Chi tiết hồ sơ số</h3>
              <p className="details-subtitle">Các giấy tờ bạn đã cung cấp</p>

              <div className="documents-list">
                {/* Document 1 */}
                <div className="document-item">
                  <img src={verificationData.documents.idFront.image} alt="CCCD mặt trước" className="document-image" />
                  <div className="document-info">
                    <p className="document-type">LOẠI GIẤY TỜ</p>
                    <p className="document-name">{verificationData.documents.idFront.type}</p>
                  </div>
                  <div className="document-status">
                    <p className="status-label">TRẠNG THÁI</p>
                    <p className={`status-value ${verificationData.documents.idFront.status}`}>
                      {getDocumentStatusLabel(verificationData.documents.idFront.status)}
                    </p>
                  </div>
                </div>

                {/* Document 2 */}
                <div className="document-item">
                  <img src={verificationData.documents.idBack.image} alt="CCCD mặt sau" className="document-image" />
                  <div className="document-info">
                    <p className="document-type">LOẠI GIẤY TỜ</p>
                    <p className="document-name">{verificationData.documents.idBack.type}</p>
                  </div>
                  <div className="document-status">
                    <p className="status-label">TRẠNG THÁI</p>
                    <p className={`status-value ${verificationData.documents.idBack.status}`}>
                      {getDocumentStatusLabel(verificationData.documents.idBack.status)}
                    </p>
                  </div>
                </div>

                {/* Document 3 */}
                <div className="document-item">
                  <img src={verificationData.documents.faceSelfie.image} alt="Xác thực khuôn mặt" className="document-image" />
                  <div className="document-info">
                    <p className="document-type">LOẠI GIẤY TỜ</p>
                    <p className="document-name">{verificationData.documents.faceSelfie.type}</p>
                  </div>
                  <div className="document-status">
                    <p className="status-label">TRẠNG THÁI</p>
                    <p className={`status-value ${verificationData.documents.faceSelfie.status}`}>
                      {getDocumentStatusLabel(verificationData.documents.faceSelfie.status)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="notes-section">
              <h3 className="notes-title">Một vài lưu ý</h3>
              <div className="notes-list">
                <div className="note-item">
                  <AlertCircle size={20} />
                  <div className="note-content">
                    <p className="note-text">Không gửi lại hồ sơ nếu như chưa lâu</p>
                    <p className="note-description">Hồ sơ của bạn đang được xử lý.</p>
                  </div>
                </div>

                <div className="note-item">
                  <Mail size={20} />
                  <div className="note-content">
                    <p className="note-text">Kết quả sẽ được thông báo qua email</p>
                    <p className="note-description">Chúng tôi sẽ gửi thông báo qua email và ứng dụng.</p>
                  </div>
                </div>

                <div className="note-item">
                  <Lock size={20} />
                  <div className="note-content">
                    <p className="note-text">Thông tin được bảo mật</p>
                    <p className="note-description">Một cơ sở dữ liệu bảo mật cao nhất tuyệt đối.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="security-footer">
              <div className="security-icon">
                <Shield size={24} />
              </div>
              <div className="security-content">
                <p className="security-title">Thông tin của bạn được bảo mật tuyệt đối</p>
                <p className="security-description">
                  GlowUp cam kết bảo mật thông tin cá nhân cao nhất. Dữ liệu của bạn được bảo vệ theo tiêu chuẩn an ninh cao nhất. Mã hóa dữ liệu • Không chứa aiệm • Xóa khi không cần thiết
                </p>
              </div>
              <div className="security-links">
                <a href="#" className="security-link">Mã hóa dữ liệu</a>
                <a href="#" className="security-link">Không chứa aiệm</a>
                <a href="#" className="security-link">Xóa khi không cần thiết</a>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="status-right">
            <div className="support-card">
              <div className="support-header">
                <AlertCircle size={20} />
                <p className="support-title">Cần hỗ trợ?</p>
              </div>

              <div className="support-content">
                <p className="support-subtitle">Đường dây nóng hỗ trợ tha đổi tác</p>

                <div className="support-phone">
                  <Phone size={24} />
                  <div className="phone-info">
                    <p className="phone-number">1900 8888 (24/7)</p>
                  </div>
                </div>

                <button className="chat-button">
                  <MessageCircle size={20} />
                  <span>Chat với nhân viên</span>
                </button>

                <div className="support-hours">
                  <p className="hours-label">24h làm việc</p>
                  <p className="hours-time">Từ 09:00-22:00, 05/2025 16:30</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechnicianVerificationStatusPage
