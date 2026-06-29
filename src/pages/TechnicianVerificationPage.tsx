import React, { useState, useEffect } from 'react'
import { ArrowLeft, Check, Upload, Phone, Mail, MapPin, Grid, Image } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '../contexts/UserProfileContext'
import { 
  submitVerificationRequest, 
  getLatestVerificationRequest, 
  verificationStatusColor, 
  verificationStatusLabel 
} from '../services/verificationService'
import type { VerificationRequest } from '../types/VerificationRequest'
import './TechnicianVerificationPage.css'

type VerificationStep = 'identity' | 'face' | 'description' | 'complete'

interface VerificationData {
  idFront: File | null
  idBack: File | null
  faceSelfie: File | null
  certificate?: File | null
  phone?: string
  email?: string
  area?: string
  services?: string
  experience?: string
}

export const TechnicianVerificationPage: React.FC = () => {
  const navigate = useNavigate()
  const { profile } = useUserProfile()

  const [currentStep, setCurrentStep] = useState<VerificationStep>('identity')
  const [latestRequest, setLatestRequest] = useState<VerificationRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [verificationData, setVerificationData] = useState<VerificationData>({
    idFront: null,
    idBack: null,
    faceSelfie: null,
    certificate: null,
    phone: '',
    email: '',
    area: '',
    services: '',
    experience: '',
  })

  const loadLatestRequest = async () => {
    setIsLoading(true)
    try {
      const req = await getLatestVerificationRequest()
      setLatestRequest(req)
    } catch (error) {
      console.error('Error fetching latest verification request:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadLatestRequest()
  }, [])

  useEffect(() => {
    if (profile) {
      setVerificationData((prev) => ({
        ...prev,
        phone: prev.phone || profile.phone || '',
        email: prev.email || profile.email || '',
      }))
    }
  }, [profile])

  const handleFileUpload = (fileType: 'idFront' | 'idBack', file: File | null) => {
    if (file) {
      setVerificationData((prev) => ({
        ...prev,
        [fileType]: file,
      }))
    }
  }

  const handleFaceCapture = (file: File | null) => {
    if (file) {
      setVerificationData((prev) => ({
        ...prev,
        faceSelfie: file,
      }))
    }
  }

  const handleNextStep = async () => {
    if (currentStep === 'identity') {
      setCurrentStep('face')
    } else if (currentStep === 'face') {
      setCurrentStep('description')
    } else if (currentStep === 'description') {
      if (!verificationData.idFront || !verificationData.idBack || !verificationData.faceSelfie) {
        alert('Vui lòng tải lên đầy đủ ảnh CCCD và Selfie xác thực')
        return
      }

      setIsSubmitting(true)
      try {
        await submitVerificationRequest({
          district: verificationData.area || '',
          serviceCategory: verificationData.services || '',
          yearsExperience: verificationData.experience ? parseInt(verificationData.experience, 10) : undefined,
          idFront: verificationData.idFront,
          idBack: verificationData.idBack,
          portrait: verificationData.faceSelfie,
          certificate: verificationData.certificate,
        })
        setCurrentStep('complete')
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi hồ sơ xác minh')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handlePrevStep = () => {
    if (currentStep === 'face') setCurrentStep('identity')
    else if (currentStep === 'description') setCurrentStep('face')
    else if (currentStep === 'complete') setCurrentStep('description')
  }

  const handleContinue = () => {
    setShowForm(false)
    void loadLatestRequest()
  }

  const isStepComplete = (step: VerificationStep): boolean => {
    switch (step) {
      case 'identity':
        return !!(verificationData.idFront && verificationData.idBack)
      case 'face':
        return !!verificationData.faceSelfie
      case 'description':
        return !!(
          verificationData.phone &&
          verificationData.email &&
          verificationData.area &&
          verificationData.services
        )
      case 'complete':
        return true
      default:
        return false
    }
  }

  if (isLoading) {
    return (
      <div className="verification-page">
        <div className="verification-container" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Đang tải thông tin xác minh...</p>
        </div>
      </div>
    )
  }

  if (latestRequest && !showForm) {
    const status = latestRequest.status
    const colorStyle = verificationStatusColor[status] || { color: '#334155', bg: '#f1f5f9' }
    const label = verificationStatusLabel[status] || status

    return (
      <div className="verification-page">
        <div className="verification-container">
          <div className="verification-header">
            <button className="back-button" onClick={() => navigate('/technician/provider-dashboard')}>
              <ArrowLeft size={24} />
            </button>
            <h1 className="verification-title">Trạng thái xác minh</h1>
            <p className="verification-subtitle">
              Xem trạng thái xét duyệt hồ sơ của bạn từ quản trị viên
            </p>
          </div>

          <div 
            className="verification-content" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '24px', 
              alignItems: 'center', 
              textAlign: 'center', 
              padding: '40px' 
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: colorStyle.bg,
              color: colorStyle.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              {status === 'approved' && <Check size={48} />}
              {status === 'pending' && (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              )}
              {status === 'rejected' && (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#2f3a55', margin: 0 }}>
              Hồ sơ: <span style={{ color: colorStyle.color }}>{label}</span>
            </h2>

            <p className="verification-subtitle" style={{ maxWidth: '500px' }}>
              {status === 'pending' && "Hồ sơ của bạn đã được gửi thành công và đang chờ xét duyệt. Chúng tôi sẽ thông báo cho bạn ngay khi có kết quả (thông thường trong vòng 24h)."}
              {status === 'approved' && "Chúc mừng! Hồ sơ xác minh của bạn đã được phê duyệt thành công. Bây giờ bạn đã có đầy đủ quyền hạn để nhận và thực hiện các yêu cầu công việc."}
              {status === 'rejected' && "Rất tiếc, hồ sơ của bạn đã bị từ chối xét duyệt. Vui lòng xem lý do bên dưới và nộp lại hồ sơ chính xác hơn."}
            </p>

            {status === 'rejected' && latestRequest.note && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                borderRadius: '12px',
                padding: '16px 24px',
                maxWidth: '600px',
                textAlign: 'left',
                width: '100%',
                marginTop: '12px'
              }}>
                <strong style={{ color: '#991b1b', display: 'block', marginBottom: '4px' }}>Lý do từ chối:</strong>
                <p style={{ margin: 0, color: '#7f1d1d', fontSize: '14px', lineHeight: '1.6' }}>{latestRequest.note}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', marginTop: '24px', width: '100%', justifyContent: 'center' }}>
              <button 
                className="secondary-button" 
                onClick={() => navigate('/technician/provider-dashboard')}
                style={{ minWidth: '150px' }}
              >
                Về bảng điều khiển
              </button>

              {status === 'rejected' && (
                <button 
                  className="primary-button" 
                  onClick={() => {
                    setVerificationData({
                      idFront: null,
                      idBack: null,
                      faceSelfie: null,
                      certificate: null,
                      phone: profile?.phone || '',
                      email: profile?.email || '',
                      area: '',
                      services: '',
                      experience: '',
                    })
                    setCurrentStep('identity')
                    setShowForm(true)
                  }}
                  style={{ minWidth: '150px' }}
                >
                  Nộp lại hồ sơ mới
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="verification-page">
      <div className="verification-container">
        {/* Header */}
        <div className="verification-header">
          <button className="back-button" onClick={() => navigate('/technician/provider-dashboard')}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="verification-title">Xác minh danh tính</h1>
          <p className="verification-subtitle">
            Hoàn thành các bước xác minh để bắt đầu nhận việc làm GlowUp
          </p>
        </div>

        {/* Steps indicator */}
        <div className="steps-indicator">
          <div className="step-item" onClick={() => currentStep !== 'complete' && setCurrentStep('identity')}>
            <div className={`step-number ${currentStep === 'identity' || isStepComplete('identity') ? 'active' : ''} ${isStepComplete('identity') ? 'completed' : ''}`}>
              {isStepComplete('identity') ? <Check size={20} /> : '1'}
            </div>
            <div className="step-label">
              <p className="step-title">Giấy tờ tùy thân</p>
              <p className="step-description">Tải lên CCCD</p>
            </div>
          </div>

          <div className="step-divider"></div>

          <div className="step-item" onClick={() => currentStep !== 'complete' && isStepComplete('identity') && setCurrentStep('face')}>
            <div className={`step-number ${currentStep === 'face' || isStepComplete('face') ? 'active' : ''} ${isStepComplete('face') ? 'completed' : ''}`}>
              {isStepComplete('face') ? <Check size={20} /> : '2'}
            </div>
            <div className="step-label">
              <p className="step-title">Xác thực khuôn mặt</p>
              <p className="step-description">Chụp ảnh selfie</p>
            </div>
          </div>

          <div className="step-divider"></div>

          <div className="step-item" onClick={() => currentStep !== 'complete' && isStepComplete('identity') && isStepComplete('face') && setCurrentStep('description')}>
            <div className={`step-number ${currentStep === 'description' ? 'active' : ''} ${isStepComplete('description') ? 'completed' : ''}`}>
              {isStepComplete('description') ? <Check size={20} /> : '3'}
            </div>
            <div className="step-label">
              <p className="step-title">Mô tả bản thân</p>
              <p className="step-description">Thông tin liên hệ & kinh nghiệm</p>
            </div>
          </div>

          <div className="step-divider"></div>

          <div className="step-item">
            <div className={`step-number ${currentStep === 'complete' ? 'active' : ''}`}>
              '4'
            </div>
            <div className="step-label">
              <p className="step-title">Hoàn tất</p>
              <p className="step-description">Chờ hoàn tất tài khoản</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="verification-content">
          {currentStep === 'identity' && (
            <IdentityVerificationStep
              data={verificationData}
              onFileUpload={handleFileUpload}
              onNext={handleNextStep}
            />
          )}

          {currentStep === 'face' && (
            <FaceVerificationStep
              data={verificationData}
              onFaceCapture={handleFaceCapture}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
            />
          )}

          {currentStep === 'description' && (
            <DescriptionStep
              data={verificationData}
              isSubmitting={isSubmitting}
              onChange={(fields) => setVerificationData((prev) => ({ ...prev, ...fields }))}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
            />
          )}

          {currentStep === 'complete' && (
            <CompleteVerificationStep
              onContinue={handleContinue}
              onPrev={handlePrevStep}
            />
          )}
        </div>

        {/* Security info */}
        <div className="security-info">
          <div className="security-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="security-text">
              Thông tin của bạn được bảo mật tuyệt đối
            </p>
          </div>
          <p className="security-description">
            GlowUp cam kết bảo mật thông tin cá nhân cao nhất. Dữ liệu của bạn được bảo vệ theo tiêu chuẩn an ninh cao nhất.
          </p>
        </div>
      </div>
    </div>
  )
}

interface IdentityVerificationStepProps {
  data: VerificationData
  onFileUpload: (fileType: 'idFront' | 'idBack', file: File | null) => void
  onNext: () => void
}

const IdentityVerificationStep: React.FC<IdentityVerificationStepProps> = ({
  data,
  onFileUpload,
  onNext,
}) => {
  const [frontPreview, setFrontPreview] = useState<string>('')
  const [backPreview, setBackPreview] = useState<string>('')

  useEffect(() => {
    if (data.idFront) {
      const url = URL.createObjectURL(data.idFront)
      setFrontPreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setFrontPreview('')
    }
  }, [data.idFront])

  useEffect(() => {
    if (data.idBack) {
      const url = URL.createObjectURL(data.idBack)
      setBackPreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setBackPreview('')
    }
  }, [data.idBack])

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileUpload('idFront', file)
    }
  }

  const handleBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileUpload('idBack', file)
    }
  }

  return (
    <div className="step-content">
      <div className="id-cards-grid">
        {/* ID Front */}
        <div className="id-card-section">
          <h3 className="card-title">CCCD mặt trước</h3>
          <label className="badge">BẮT BUỘC</label>

          <div className="card-upload-area">
            {frontPreview ? (
              <div className="preview-container">
                <img src={frontPreview} alt="CCCD mặt trước" className="preview-image" />
                <button 
                  className="change-button"
                  onClick={() => {
                    const input = document.getElementById('front-input') as HTMLInputElement
                    input?.click()
                  }}
                >
                  Thay đổi
                </button>
              </div>
            ) : (
              <div className="empty-state">
                <div className="placeholder-card">
                  <div className="placeholder-content">
                    <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
                      <rect width="60" height="40" fill="#E8E7E1" rx="4" />
                      <rect x="8" y="6" width="44" height="28" fill="#D0D0D0" rx="2" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <input
              id="front-input"
              type="file"
              accept="image/*"
              onChange={handleFrontUpload}
              style={{ display: 'none' }}
            />

            <label htmlFor="front-input" className="upload-button">
              <Upload size={20} />
              <span>Tải lên ảnh</span>
            </label>
          </div>

          <ul className="requirements">
            <li>✓ Chụp rõ nét, không bị mờ góc</li>
            <li>✓ Không tô che sáng</li>
            <li>✓ Thông tin dễ đọc</li>
          </ul>
        </div>

        {/* ID Back */}
        <div className="id-card-section">
          <h3 className="card-title">CCCD mặt sau</h3>
          <label className="badge">BẮT BUỘC</label>

          <div className="card-upload-area">
            {backPreview ? (
              <div className="preview-container">
                <img src={backPreview} alt="CCCD mặt sau" className="preview-image" />
                <button 
                  className="change-button"
                  onClick={() => {
                    const input = document.getElementById('back-input') as HTMLInputElement
                    input?.click()
                  }}
                >
                  Thay đổi
                </button>
              </div>
            ) : (
              <div className="empty-state">
                <div className="placeholder-card">
                  <div className="placeholder-content">
                    <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
                      <rect width="60" height="40" fill="#E8E7E1" rx="4" />
                      <rect x="8" y="6" width="44" height="28" fill="#D0D0D0" rx="2" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <input
              id="back-input"
              type="file"
              accept="image/*"
              onChange={handleBackUpload}
              style={{ display: 'none' }}
            />

            <label htmlFor="back-input" className="upload-button">
              <Upload size={20} />
              <span>Tải lên ảnh</span>
            </label>
          </div>

          <ul className="requirements">
            <li>✓ Chụp rõ nét, không bị mờ góc</li>
            <li>✓ Không tô che sáng</li>
            <li>✓ Thông tin dễ đọc</li>
          </ul>
        </div>
      </div>

      <div className="step-actions">
        <button
          className={`primary-button ${data.idFront && data.idBack ? '' : 'disabled'}`}
          onClick={onNext}
          disabled={!data.idFront || !data.idBack}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  )
}

interface FaceVerificationStepProps {
  data: VerificationData
  onFaceCapture: (file: File | null) => void
  onNext: () => void
  onPrev?: () => void
}

const FaceVerificationStep: React.FC<FaceVerificationStepProps> = ({
  data,
  onFaceCapture,
  onNext,
  onPrev,
}) => {
  const [preview, setPreview] = useState<string>('')

  useEffect(() => {
    if (data.faceSelfie) {
      const url = URL.createObjectURL(data.faceSelfie)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreview('')
    }
  }, [data.faceSelfie])

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFaceCapture(file)
    }
  }

  return (
    <div className="step-content">
      <div className="face-verification-box" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {preview ? (
          <div className="face-preview" style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #aa3bff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src={preview} alt="Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button 
              className="change-button" 
              onClick={() => {
                const input = document.getElementById('face-input') as HTMLInputElement
                input?.click()
              }}
              style={{
                position: 'absolute',
                bottom: '10px',
                padding: '4px 12px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Thay đổi
            </button>
          </div>
        ) : (
          <div className="card-upload-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', border: '2px dashed #d0d0d0', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <div className="face-placeholder">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="38" stroke="#D0D0D0" strokeWidth="2" />
                <circle cx="30" cy="32" r="6" fill="#D0D0D0" />
                <circle cx="50" cy="32" r="6" fill="#D0D0D0" />
                <path d="M 30 50 Q 40 58 50 50" stroke="#D0D0D0" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <p className="placeholder-text" style={{ margin: 0, color: '#7a7a7a', fontSize: '14px' }}>Tải lên ảnh Selfie xác thực khuôn mặt</p>
            <input
              id="face-input"
              type="file"
              accept="image/*"
              onChange={handleFaceUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="face-input" className="upload-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
              <Upload size={20} />
              <span>Tải ảnh lên</span>
            </label>
          </div>
        )}
      </div>

      <div className="face-requirements" style={{ marginTop: '24px' }}>
        <p className="requirements-title" style={{ fontWeight: 600, color: '#2f3a55', margin: '0 0 8px 0' }}>Yêu cầu ảnh selfie:</p>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#7a7a7a', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px' }}>
          <li>✓ Chụp trực diện, rõ khuôn mặt</li>
          <li>✓ Không đeo kính râm, mũ hay khẩu trang</li>
          <li>✓ Đảm bảo ánh sáng rõ ràng</li>
        </ul>
      </div>

      <div className="step-actions">
        {onPrev && (
          <button className="secondary-button" onClick={onPrev}>
            Quay lại
          </button>
        )}

        <button
          className={`primary-button ${data.faceSelfie ? '' : 'disabled'}`}
          onClick={onNext}
          disabled={!data.faceSelfie}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  )
}

interface DescriptionStepProps {
  data: VerificationData
  isSubmitting: boolean
  onChange: (fields: Partial<VerificationData>) => void
  onNext: () => void
  onPrev?: () => void
}

const DescriptionStep: React.FC<DescriptionStepProps> = ({ data, isSubmitting, onChange, onNext, onPrev }) => {
  const [certPreview, setCertPreview] = useState<string>('')

  useEffect(() => {
    if (data.certificate) {
      const url = URL.createObjectURL(data.certificate)
      setCertPreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setCertPreview('')
    }
  }, [data.certificate])

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    onChange({ certificate: file || null })
  }

  const isValid = !!(data.phone && data.email && data.area && data.services)

  return (
    <div className="step-content description-step">
      <div className="description-header">
        <div className="icon-circle">
          <Image size={20} />
        </div>
        <div>
          <h3>Thông tin mô tả bản thân</h3>
          <p className="muted">Vui lòng cung cấp thông tin chi tiết để chúng tôi hiểu bạn hơn</p>
        </div>
      </div>

      <div className="form-row">
        <label>Số điện thoại <span className="required">*</span></label>
        <div className="input-with-icon">
          <Phone size={16} className="input-icon" />
          <input value={data.phone || ''} onChange={e => onChange({ phone: e.target.value })} placeholder="Nhập số điện thoại của bạn" />
        </div>
      </div>

      <div className="form-row">
        <label>Email <span className="required">*</span></label>
        <div className="input-with-icon">
          <Mail size={16} className="input-icon" />
          <input value={data.email || ''} onChange={e => onChange({ email: e.target.value })} placeholder="Nhập email của bạn" />
        </div>
      </div>

      <div className="form-row split">
        <div>
          <label>Khu vực hoạt động <span className="required">*</span></label>
          <div className="input-with-icon">
            <MapPin size={16} className="input-icon" />
            <input value={data.area || ''} onChange={e => onChange({ area: e.target.value })} placeholder="Ví dụ: Bình Thạnh, Quận 1..." />
          </div>
        </div>

        <div>
          <label>Dịch vụ <span className="required">*</span></label>
          <div className="input-with-icon">
            <Grid size={16} className="input-icon" />
            <input value={data.services || ''} onChange={e => onChange({ services: e.target.value })} placeholder="Ví dụ: Điện lạnh, Tủ lạnh..." />
          </div>
        </div>
      </div>

      <div className="form-row">
        <label>Chứng chỉ hành nghề (nếu có)</label>
        <div className="cert-upload">
          {certPreview ? (
            <div className="cert-preview">
              <img src={certPreview} alt="chứng chỉ" />
              <button className="change-button" onClick={() => {
                const input = document.getElementById('cert-input') as HTMLInputElement
                input?.click()
              }}>Thay đổi</button>
            </div>
          ) : (
            <label className="upload-card">
              <input id="cert-input" type="file" accept="image/*" onChange={handleCertUpload} style={{ display: 'none' }} />
              <div className="upload-inner">
                <Image size={28} />
                <div>
                  <p className="upload-title">Tải ảnh chứng chỉ hành nghề</p>
                  <p className="upload-sub">(Tùy chọn)</p>
                </div>
              </div>
            </label>
          )}
        </div>
      </div>

      <div className="form-row">
        <label>Kinh nghiệm (số năm)</label>
        <div className="input-with-icon">
          <input type="number" min="0" value={data.experience || ''} onChange={e => onChange({ experience: e.target.value })} placeholder="Ví dụ: 3" />
        </div>
      </div>

      <div className="step-actions">
        {onPrev && (
          <button className="secondary-button" onClick={onPrev} disabled={isSubmitting}>
            Quay lại
          </button>
        )}

        <button 
          className={`primary-button ${isSubmitting || !isValid ? 'disabled' : ''}`} 
          onClick={onNext}
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ'}
        </button>
      </div>
    </div>
  )
}

interface CompleteVerificationStepProps {
  onContinue: () => void
  onPrev?: () => void
}

const CompleteVerificationStep: React.FC<CompleteVerificationStepProps> = ({
  onContinue,
  onPrev,
}) => {
  return (
    <div className="step-content">
      <div className="complete-message">
        <div className="success-icon">
          <Check size={64} />
        </div>
        <h2>Hoàn tất xác minh danh tính</h2>
        <p>
          Cảm ơn bạn đã cung cấp thông tin. Chúng tôi đang xử lý xác minh danh tính của bạn. 
          Bạn sẽ nhận được thông báo trong vòng 24 giờ.
        </p>
      </div>

      <div className="step-actions">
        {onPrev && (
          <button className="secondary-button" onClick={onPrev}>
            Quay lại
          </button>
        )}

        <button className="primary-button" onClick={onContinue}>
          Tiếp tục
        </button>
      </div>
    </div>
  )
}

export default TechnicianVerificationPage
