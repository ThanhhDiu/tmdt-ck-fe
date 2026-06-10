import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import './AuthScreens.css'
import { loginUser, registerUser } from '../services/auth'

type AccountType = 'customer' | 'technician'

type FieldError = Record<string, string>

type InfoItem = {
  title: string
  description: string
  icon: ReactNode
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^(?:\+84|84|0)(?:\d{9}|\d{10})$/

function isEmailOrPhone(value: string) {
  return emailRegex.test(value) || phoneRegex.test(value)
}

function isStrongPassword(value: string) {
  return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}/.test(value)
}

function getPasswordScore(value: string) {
  const checks = [
    value.length >= 8,
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /\d/.test(value),
    /[^\w\s]/.test(value),
  ]

  return checks.reduce((score, passed) => score + Number(passed), 0)
}

function formatStrengthLabel(score: number) {
  if (score <= 1) {
    return 'Yếu'
  }

  if (score <= 3) {
    return 'Khá'
  }

  return 'Mạnh'
}

function AuthShell({
  badge,
  title,
  description,
  accentTitle,
  accentDescription,
  items,
  children,
}: {
  badge: string
  title: string
  description: string
  accentTitle: string
  accentDescription: string
  items: InfoItem[]
  children: ReactNode
}) {
  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-hero" aria-hidden="true">
          <div className="auth-hero__badge">
            <Sparkles size={16} />
            <span>{badge}</span>
          </div>

          <div className="auth-hero__content">
            <div className="auth-brand">
              <div className="auth-brand__mark">G</div>
              <div>
                <p className="auth-brand__name">GlowUp</p>
                <p className="auth-brand__tag">SaaS service platform</p>
              </div>
            </div>

            <h1>{title}</h1>
            <p className="auth-hero__copy">{description}</p>

            <div className="auth-hero__panel">
              <p className="auth-hero__panel-title">{accentTitle}</p>
              <p className="auth-hero__panel-copy">{accentDescription}</p>
            </div>

            <div className="auth-hero__list">
              {items.map((item) => (
                <div className="auth-hero__item" key={item.title}>
                  <div className="auth-hero__icon">{item.icon}</div>
                  <div>
                    <p className="auth-hero__item-title">{item.title}</p>
                    <p className="auth-hero__item-copy">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="auth-card" aria-label={title}>
          {children}
        </section>
      </section>
    </main>
  )
}

function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <header className="auth-card__header">
      <p className="auth-card__eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="auth-card__description">{description}</p>
    </header>
  )
}

function ToggleGroup({
  value,
  onChange,
}: {
  value: AccountType
  onChange: (value: AccountType) => void
}) {
  return (
    <div className="auth-toggle" role="radiogroup" aria-label="Loại tài khoản">
      <button
        type="button"
        role="radio"
        aria-checked={value === 'customer'}
        className={value === 'customer' ? 'is-active' : ''}
        onClick={() => onChange('customer')}
      >
        <UserRound size={16} />
        <span>Người dùng</span>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === 'technician'}
        className={value === 'technician' ? 'is-active' : ''}
        onClick={() => onChange('technician')}
      >
        <BadgeCheck size={16} />
        <span>Thợ</span>
      </button>
    </div>
  )
}

function TextField({
  label,
  icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  autoComplete,
  inputMode,
  rightAction,
  name,
  required,
}: {
  label: string
  icon: ReactNode
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  error?: string
  helperText?: string
  autoComplete?: string
  inputMode?: 'text' | 'email' | 'tel' | 'search' | 'numeric' | 'decimal' | 'none'
  rightAction?: ReactNode
  name?: string
  required?: boolean
}) {
  const describedBy = [error ? `${name}-error` : '', helperText ? `${name}-hint` : '']
    .filter(Boolean)
    .join(' ')

  return (
    <label className={`auth-field ${error ? 'is-error' : ''}`}>
      <span className="auth-field__label">
        {label}
        {required ? <span className="auth-required">*</span> : null}
      </span>
      <div className="auth-field__control">
        <div className="auth-field__icon">{icon}</div>
        <input
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
        />
        {rightAction}
      </div>
      {helperText ? (
        <p className="auth-field__hint" id={name ? `${name}-hint` : undefined}>
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p className="auth-field__error" id={name ? `${name}-error` : undefined}>
          <CircleAlert size={14} />
          <span>{error}</span>
        </p>
      ) : null}
    </label>
  )
}

function StrengthMeter({ password }: { password: string }) {
  const score = getPasswordScore(password)
  const label = formatStrengthLabel(score)

  return (
    <div className="auth-strength" aria-live="polite">
      <div className="auth-strength__meta">
        <span>Độ mạnh mật khẩu</span>
        <strong>{label}</strong>
      </div>
      <div className="auth-strength__bars" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} className={index < Math.max(0, score) ? 'is-active' : ''} />
        ))}
      </div>
      <ul className="auth-checklist">
        <li className={password.length >= 8 ? 'is-ok' : ''}>Tối thiểu 8 ký tự</li>
        <li className={/[a-z]/.test(password) ? 'is-ok' : ''}>Có chữ thường</li>
        <li className={/[A-Z]/.test(password) ? 'is-ok' : ''}>Có chữ hoa</li>
        <li className={/\d/.test(password) ? 'is-ok' : ''}>Có số</li>
        <li className={/[^\w\s]/.test(password) ? 'is-ok' : ''}>Có ký tự đặc biệt</li>
      </ul>
    </div>
  )
}

function StatusBanner({
  type,
  title,
  description,
}: {
  type: 'success' | 'error' | 'info'
  title: string
  description: string
}) {
  const icon =
    type === 'error' ? (
      <CircleAlert size={18} />
    ) : type === 'info' ? (
      <Sparkles size={18} />
    ) : (
      <CheckCircle2 size={18} />
    )

  return (
    <div className={`auth-banner auth-banner--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {icon}
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  )
}

function SubmitButton({ label, loading }: { label: string; loading: boolean }) {
  return (
    <button className="auth-submit" type="submit" disabled={loading}>
      {loading ? <Loader2 size={18} className="auth-spin" /> : null}
      <span>{loading ? 'Đang xử lý...' : label}</span>
    </button>
  )
}

function loginSideItems(): InfoItem[] {
  return [
    {
      title: 'Truy cập nhanh',
      description: 'Đăng nhập bằng email hoặc số điện thoại trong một bước.',
      icon: <Mail size={16} />,
    },
    {
      title: 'Bảo mật rõ ràng',
      description: 'Quy trình xác thực tách bạch cho người dùng và thợ.',
      icon: <ShieldCheck size={16} />,
    },
    {
      title: 'Khôi phục linh hoạt',
      description: 'Điều hướng quên mật khẩu và đổi mật khẩu ngay trong flow.',
      icon: <KeyRound size={16} />,
    },
  ]
}

export function LoginPage() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldError>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const validate = () => {
    const nextErrors: FieldError = {}

    if (!identifier.trim()) {
      nextErrors.identifier = 'Vui lòng nhập email hoặc số điện thoại.'
    } else if (!isEmailOrPhone(identifier.trim())) {
      nextErrors.identifier = 'Email hoặc số điện thoại chưa hợp lệ.'
    }

    if (!password.trim()) {
      nextErrors.password = 'Vui lòng nhập mật khẩu.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validate()) {
      setSuccessMessage('')
      return
    }

    setIsSubmitting(true)
    setSuccessMessage('')

    try {
      const loginResponse = await loginUser({
        identifier: identifier,
        password: password
      })
      const redirectPath = loginResponse.data.user.role.toLowerCase() === 'admin'
        ? '/admin/dashboard'
        : '/'

      window.setTimeout(() => {
        setIsSubmitting(false)
        setSuccessMessage('Đăng nhập thành công.')
        navigate(redirectPath)
      }, 1100)

    } catch (error) {
      setIsSubmitting(false)
      setSuccessMessage('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.')
    }
  }

  return (
    <AuthShell
      badge="Giao diện xác thực tối giản"
      title="Đăng nhập nhanh, rõ ràng và an toàn"
      description="Một trải nghiệm auth hiện đại cho người dùng và thợ, tối ưu cho desktop lẫn mobile."
      accentTitle="Trải nghiệm giống SaaS hiện đại"
      accentDescription="Card trung tâm, trạng thái rõ ràng, icon trực quan và luồng đổi mật khẩu liền mạch."
      items={loginSideItems()}
    >
      <div className="auth-card__inner">
        <PageHeader
          eyebrow="Đăng nhập"
          title="Chào mừng quay lại"
          description="Đăng nhập bằng email hoặc số điện thoại để tiếp tục."
        />

        {successMessage ? <StatusBanner type="success" title="Hoàn tất" description={successMessage} /> : null}

        <form className="auth-form" onSubmit={onSubmit} noValidate>

          <TextField
            name="identifier"
            label="Email hoặc số điện thoại"
            icon={<Phone size={16} />}
            required
            value={identifier}
            onChange={setIdentifier}
            placeholder="Nhập email hoặc số điện thoại"
            error={errors.identifier}
            helperText="Có thể dùng email hoặc SĐT đã đăng ký."
            autoComplete="username"
          />

          <TextField
            name="password"
            label="Mật khẩu"
            icon={<LockKeyhole size={16} />}
            required
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            placeholder="Nhập mật khẩu"
            error={errors.password}
            autoComplete="current-password"
            rightAction={
              <button
                className="auth-field__action"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <div className="auth-options">
            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>

            <Link to="/auth/forgot-password" className="auth-link">
              Quên mật khẩu?
            </Link>
          </div>

          <SubmitButton label="Đăng nhập" loading={isSubmitting} />

          <p className="auth-card__footer">
            Chưa có tài khoản?{' '}
            <Link to="/auth/register" className="auth-link">
              Đăng ký
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  )
}

function registerSideItems(): InfoItem[] {
  return [
    {
      title: 'Thông tin rõ ràng',
      description: 'Email, SĐT, mật khẩu và xác nhận đều được kiểm tra trực tiếp.',
      icon: <UserRound size={16} />,
    },
    {
      title: 'Phân loại tài khoản',
      description: 'Chọn Người dùng hoặc Thợ ngay từ bước đầu để tối ưu trải nghiệm.',
      icon: <BadgeCheck size={16} />,
    },
    {
      title: 'Tín hiệu tin cậy',
      description: 'Độ mạnh mật khẩu và thông báo lỗi/success luôn hiển thị minh bạch.',
      icon: <ShieldCheck size={16} />,
    },
  ]
}

export function RegisterPage() {
  const [accountType, setAccountType] = useState<AccountType>('customer')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [errors, setErrors] = useState<FieldError>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const validate = () => {
    const nextErrors: FieldError = {}

    if (!fullName.trim()) {
      nextErrors.fullName = 'Vui lòng nhập họ và tên.'
    }

    if (!email.trim()) {
      nextErrors.email = 'Vui lòng nhập email.'
    } else if (!emailRegex.test(email.trim())) {
      nextErrors.email = 'Email không hợp lệ.'
    }

    if (!phone.trim()) {
      nextErrors.phone = 'Vui lòng nhập số điện thoại.'
    } else if (!phoneRegex.test(phone.trim())) {
      nextErrors.phone = 'Số điện thoại không hợp lệ.'
    }

    if (!password.trim()) {
      nextErrors.password = 'Vui lòng nhập mật khẩu.'
    } else if (!isStrongPassword(password)) {
      nextErrors.password = 'Mật khẩu phải mạnh hơn: tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.'
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu.'
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận chưa khớp.'
    }

    if (!agreedTerms) {
      nextErrors.agreedTerms = 'Bạn cần đồng ý với điều khoản để tiếp tục.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()

  if (!validate()) {
    setSuccessMessage('')
    return
  }

  setIsSubmitting(true)
  await registerUser({ fullName, email, phone, password, accountType }, setSuccessMessage)
  
}

  return (
    <AuthShell
      badge="Tạo tài khoản chuẩn UX"
      title="Đăng ký gọn gàng, xác thực rõ ràng"
      description="Mọi trường nhập đều được dẫn dắt bằng label, hint và phản hồi lỗi trực tiếp."
      accentTitle="Chuẩn mực cho onboarding"
      accentDescription="Trạng thái hợp lệ, kiểm tra độ mạnh mật khẩu và luồng lựa chọn loại tài khoản nhất quán."
      items={registerSideItems()}
    >
      <div className="auth-card__inner">
        <PageHeader
          eyebrow="Đăng ký"
          title="Tạo tài khoản mới"
          description="Điền thông tin để bắt đầu sử dụng hệ thống."
        />

        {successMessage ? <StatusBanner type="success" title="Hoàn tất" description={successMessage} /> : null}

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <ToggleGroup value={accountType} onChange={setAccountType} />

          <TextField
            name="fullName"
            label="Họ và tên"
            icon={<UserRound size={16} />}
            required
            value={fullName}
            onChange={setFullName}
            placeholder="Nhập họ và tên"
            error={errors.fullName}
            autoComplete="name"
          />

          <TextField
            name="email"
            label="Email"
            icon={<Mail size={16} />}
            required
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Nhập email"
            error={errors.email}
            autoComplete="email"
            inputMode="email"
          />

          <TextField
            name="phone"
            label="Số điện thoại"
            icon={<Phone size={16} />}
            required
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="Nhập số điện thoại"
            error={errors.phone}
            autoComplete="tel"
            inputMode="tel"
          />

          <TextField
            name="password"
            label="Mật khẩu"
            icon={<LockKeyhole size={16} />}
            required
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            placeholder="Tạo mật khẩu mạnh"
            error={errors.password}
            autoComplete="new-password"
            rightAction={
              <button
                className="auth-field__action"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          {password.length > 0 ? <StrengthMeter password={password} /> : null}

          <TextField
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            icon={<LockKeyhole size={16} />}
            required
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Nhập lại mật khẩu"
            error={errors.confirmPassword}
            autoComplete="new-password"
            rightAction={
              <button
                className="auth-field__action"
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <div className="auth-terms">
            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(event) => {
                  setAgreedTerms(event.target.checked)
                  setErrors((current) => {
                    if (event.target.checked && current.agreedTerms) {
                      const rest = { ...current }
                      delete rest.agreedTerms
                      return rest
                    }

                    return current
                  })
                }}
              />
              <span>
                <span className="auth-required">*</span>{' '}
                Tôi đồng ý với <Link to="#" className="auth-link">Điều khoản sử dụng</Link> và{' '}
                <Link to="#" className="auth-link">Chính sách bảo mật</Link>
              </span>
            </label>
            {errors.agreedTerms ? (
              <p className="auth-field__error" role="alert">
                <CircleAlert size={14} />
                <span>{errors.agreedTerms}</span>
              </p>
            ) : null}
          </div>

          <SubmitButton label="Đăng ký" loading={isSubmitting} />

          <p className="auth-card__footer">
            Đã có tài khoản?{' '}
            <Link to="/auth/login" className="auth-link">
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  )
}

function forgotSideItems(): InfoItem[] {
  return [
    {
      title: 'Xác thực nhanh',
      description: 'Nhập email hoặc số điện thoại và gửi yêu cầu khôi phục.',
      icon: <Mail size={16} />,
    },
    {
      title: 'Phản hồi tức thì',
      description: 'Hiển thị thành công ngay sau khi gửi yêu cầu hợp lệ.',
      icon: <CheckCircle2 size={16} />,
    },
    {
      title: 'Luồng quen thuộc',
      description: 'Có link quay lại đăng nhập để người dùng không bị lạc hướng.',
      icon: <ArrowLeft size={16} />,
    },
  ]
}

export function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!identifier.trim()) {
      setError('Vui lòng nhập email hoặc số điện thoại để gửi yêu cầu.')
      setSuccessMessage('')
      return
    }

    if (!isEmailOrPhone(identifier.trim())) {
      setError('Thông tin khôi phục chưa hợp lệ.')
      setSuccessMessage('')
      return
    }

    setError('')
    setIsSubmitting(true)
    setSuccessMessage('')

    window.setTimeout(() => {
      setIsSubmitting(false)
      setSuccessMessage('Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư hoặc tin nhắn của bạn.')
    }, 1000)
  }

  return (
    <AuthShell
      badge="Khôi phục truy cập"
      title="Khôi phục mật khẩu trong vài giây"
      description="Chỉ cần email hoặc số điện thoại đã đăng ký để nhận hướng dẫn khôi phục."
      accentTitle="Tập trung vào sự rõ ràng"
      accentDescription="Giảm tối đa ma sát khi người dùng quên mật khẩu bằng một form ngắn, dễ hiểu và có phản hồi tức thì."
      items={forgotSideItems()}
    >
      <div className="auth-card__inner">
        <PageHeader
          eyebrow=""
          title="Quên mật khẩu"
          description="Nhập thông tin đã đăng ký để nhận hướng dẫn đặt lại mật khẩu."
        />

        {successMessage ? (
          <StatusBanner type="success" title="Yêu cầu đã được gửi" description={successMessage} />
        ) : null}

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <TextField
            name="recoverIdentifier"
            label="Email hoặc số điện thoại"
            icon={<Phone size={16} />}
            required
            value={identifier}
            onChange={setIdentifier}
            placeholder="Nhập email hoặc số điện thoại"
            error={error}
            helperText="Thông tin phải trùng với tài khoản đã đăng ký."
            autoComplete="username"
          />

          <SubmitButton label="Gửi yêu cầu" loading={isSubmitting} />

          <p className="auth-card__footer">
            <Link to="/auth/login" className="auth-link auth-link--back">
              <ArrowLeft size={16} />
              <span>Quay lại đăng nhập</span>
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  )
}

function changeSideItems(): InfoItem[] {
  return [
    {
      title: 'Mật khẩu mới đủ mạnh',
      description: 'Bộ quy tắc strength guide ngay dưới ô nhập để giảm lỗi.',
      icon: <LockKeyhole size={16} />,
    },
    {
      title: 'Xác nhận chính xác',
      description: 'Kiểm tra khớp từng ký tự trước khi cho phép gửi form.',
      icon: <ShieldCheck size={16} />,
    },
    {
      title: 'Hoàn tất rõ ràng',
      description: 'Trạng thái thành công hiển thị nổi bật sau khi đổi mật khẩu.',
      icon: <CheckCircle2 size={16} />,
    },
  ]
}

export function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<FieldError>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const validate = () => {
    const nextErrors: FieldError = {}

    if (!newPassword.trim()) {
      nextErrors.newPassword = 'Vui lòng nhập mật khẩu mới.'
    } else if (!isStrongPassword(newPassword)) {
      nextErrors.newPassword = 'Mật khẩu mới chưa đủ mạnh.'
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.'
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validate()) {
      setSuccessMessage('')
      return
    }

    setIsSubmitting(true)
    setSuccessMessage('')

    window.setTimeout(() => {
      setIsSubmitting(false)
      setSuccessMessage('Đổi mật khẩu thành công. Bạn có thể dùng mật khẩu mới để đăng nhập ngay bây giờ.')
    }, 1100)
  }

  return (
    <AuthShell
      badge="Bảo mật tài khoản"
      title="Đặt mật khẩu mới an toàn hơn"
      description="Màn hình đổi mật khẩu gọn, rõ và tập trung vào độ mạnh cùng trạng thái xác nhận."
      accentTitle="Chuẩn xác, không gây nhầm lẫn"
      accentDescription="Luồng đổi mật khẩu được thiết kế để người dùng biết ngay mật khẩu nào mạnh, mật khẩu nào chưa khớp."
      items={changeSideItems()}
    >
      <div className="auth-card__inner">
        <PageHeader
          eyebrow="Change password"
          title="Đổi mật khẩu"
          description="Tạo mật khẩu mới và xác nhận lại một lần nữa."
        />

        {successMessage ? <StatusBanner type="success" title="Hoàn tất" description={successMessage} /> : null}

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <TextField
            name="newPassword"
            label="Mật khẩu mới"
            icon={<LockKeyhole size={16} />}
            required
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Nhập mật khẩu mới"
            error={errors.newPassword}
            autoComplete="new-password"
            rightAction={
              <button
                className="auth-field__action"
                type="button"
                onClick={() => setShowNewPassword((current) => !current)}
                aria-label={showNewPassword ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <StrengthMeter password={newPassword} />

          <TextField
            name="confirmNewPassword"
            label="Xác nhận mật khẩu mới"
            icon={<LockKeyhole size={16} />}
            required
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Nhập lại mật khẩu mới"
            error={errors.confirmPassword}
            autoComplete="new-password"
            rightAction={
              <button
                className="auth-field__action"
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <SubmitButton label="Xác nhận đổi mật khẩu" loading={isSubmitting} />

          <p className="auth-card__footer">
            <Link to="/auth/login" className="auth-link auth-link--back">
              <ArrowLeft size={16} />
              <span>Quay lại đăng nhập</span>
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  )
}