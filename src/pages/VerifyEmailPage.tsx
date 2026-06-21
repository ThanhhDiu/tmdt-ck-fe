import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Mail, Loader2, ArrowRight } from 'lucide-react'
import { verifyEmail } from '../services/auth'
import './AuthScreens.css'

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [errorMessage, setErrorMessage] = useState('')
    const token = searchParams.get('token')

    useEffect(() => {
        const handleVerification = async () => {
            if (!token) {
                setStatus('error')
                setErrorMessage('Token xác nhận không tồn tại. Vui lòng kiểm tra link email.')
                return
            }

            try {
                await verifyEmail({ token })
                setStatus('success')
            } catch (error: any) {
                setStatus('error')
                setErrorMessage(
                    error.message || 'Xác nhận email thất bại. Token có thể đã hết hạn hoặc không hợp lệ.'
                )
            }
        }

        handleVerification()
    }, [token])

    return (
        <main className="auth-page">
            <section className="auth-shell">
                <aside className="auth-hero" aria-hidden="true">
                    <div className="auth-hero__badge">
                        <Mail size={16} />
                        <span>Xác nhận Email</span>
                    </div>

                    <div className="auth-hero__content">
                        <div className="auth-brand">
                            <div className="auth-brand__mark">G</div>
                            <div>
                                <p className="auth-brand__name">GlowUp</p>
                                <p className="auth-brand__tag">SaaS service platform</p>
                            </div>
                        </div>

                        <div className="auth-hero__items">
                            <div className="auth-hero__item">
                                <CheckCircle2 size={20} className="auth-hero__icon" />
                                <div>
                                    <p className="auth-hero__item-title">Xác nhận bảo mật</p>
                                    <p className="auth-hero__item-description">
                                        Tài khoản của bạn được bảo vệ bằng cách xác nhận email
                                    </p>
                                </div>
                            </div>
                            <div className="auth-hero__item">
                                <Mail size={20} className="auth-hero__icon" />
                                <div>
                                    <p className="auth-hero__item-title">Quản lý dễ dàng</p>
                                    <p className="auth-hero__item-description">
                                        Sử dụng email để đặt lại mật khẩu và nhận thông báo
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <article className="auth-card">
                    <div className="auth-card__inner">
                        {status === 'loading' && (
                            <div className="verify-email__loading">
                                <Loader2 size={48} className="verify-email__spinner" />
                                <h1 className="verify-email__title">Đang xác nhận email...</h1>
                                <p className="verify-email__description">
                                    Vui lòng chờ trong khi chúng tôi xác nhận tài khoản của bạn.
                                </p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="verify-email__success">
                                <div className="verify-email__icon verify-email__icon--success">
                                    <CheckCircle2 size={56} />
                                </div>
                                <h1 className="verify-email__title">Xác thực email thành công!</h1>
                                <p className="verify-email__description">
                                    Tài khoản của bạn đã được xác thực thành công. Bây giờ bạn có thể đăng nhập và bắt đầu sử dụng nền tảng.
                                </p>
                                <button
                                    className="verify-email__button"
                                    onClick={() => navigate('/auth/login')}
                                >
                                    <span>Đăng nhập tài khoản</span>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="verify-email__error">
                                <div className="verify-email__icon verify-email__icon--error">
                                    <AlertCircle size={56} />
                                </div>
                                <h1 className="verify-email__title">Xác nhận email thất bại</h1>
                                <p className="verify-email__description">{errorMessage}</p>
                                <div className="verify-email__actions">
                                    <button
                                        className="verify-email__button verify-email__button--secondary"
                                        onClick={() => navigate('/auth/login')}
                                    >
                                        <span>Quay lại đăng nhập</span>
                                    </button>
                                    <button
                                        className="verify-email__button"
                                        onClick={() => navigate('/auth/register')}
                                    >
                                        <span>Đăng ký lại</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </article>
            </section>
        </main>
    )
}
