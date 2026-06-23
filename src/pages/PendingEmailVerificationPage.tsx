import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowRight, RefreshCw } from 'lucide-react'
import './AuthScreens.css'

interface PendingEmailVerificationPageProps {
    email?: string
}

export function PendingEmailVerificationPage({ email: initialEmail }: PendingEmailVerificationPageProps) {
    const navigate = useNavigate()
    const [email, setEmail] = useState(initialEmail || '')
    const [resendCount, setResendCount] = useState(0)
    const [canResend, setCanResend] = useState(true)

    useEffect(() => {
        // Get email from session storage if not provided
        const sessionEmail = sessionStorage.getItem('registerEmail')
        if (sessionEmail) {
            setEmail(sessionEmail)
        }
    }, [])

    const handleResendEmail = async () => {
        // TODO: Implement resend email API call
        setCanResend(false)
        setResendCount(prev => prev + 1)

        // Re-enable resend after 60 seconds
        setTimeout(() => {
            setCanResend(true)
        }, 60000)
    }

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
                                <Mail size={20} className="auth-hero__icon" />
                                <div>
                                    <p className="auth-hero__item-title">Kiểm tra email của bạn</p>
                                    <p className="auth-hero__item-description">
                                        Chúng tôi đã gửi một link xác nhận đến email của bạn
                                    </p>
                                </div>
                            </div>
                            <div className="auth-hero__item">
                                <RefreshCw size={20} className="auth-hero__icon" />
                                <div>
                                    <p className="auth-hero__item-title">Không tìm thấy?</p>
                                    <p className="auth-hero__item-description">
                                        Kiểm tra thư mục spam hoặc yêu cầu gửi lại email
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <article className="auth-card">
                    <div className="auth-card__inner">
                        <div className="pending-email__container">
                            <div className="pending-email__icon">
                                <Mail size={56} />
                            </div>
                            <h1 className="pending-email__title">Vui lòng xác nhận email</h1>
                            <p className="pending-email__description">
                                Chúng tôi đã gửi một email xác nhận đến <strong>{email}</strong>
                            </p>
                            <p className="pending-email__instruction">
                                Vui lòng kiểm tra email của bạn và click vào link xác nhận để hoàn tất đăng ký.
                                Link sẽ hết hạn sau 24 giờ.
                            </p>

                            <div className="pending-email__actions">
                                <button
                                    className="pending-email__button pending-email__button--primary"
                                    onClick={() => window.location.href = 'https://mail.google.com'}
                                >
                                    <span>Mở Gmail</span>
                                    <ArrowRight size={18} />
                                </button>

                                <button
                                    className={`pending-email__button pending-email__button--secondary ${!canResend ? 'pending-email__button--disabled' : ''}`}
                                    onClick={handleResendEmail}
                                    disabled={!canResend}
                                >
                                    <span>
                                        {canResend
                                            ? 'Gửi lại email'
                                            : `Gửi lại sau ${60}s`
                                        }
                                    </span>
                                    {canResend && <RefreshCw size={18} />}
                                </button>
                            </div>

                            <div className="pending-email__divider"></div>

                            <button
                                className="pending-email__link"
                                onClick={() => navigate('/auth/login')}
                            >
                                Quay lại đăng nhập
                            </button>
                        </div>
                    </div>
                </article>
            </section>
        </main>
    )
}
