import { useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import type { AdminComplaintItem } from '../services/adminComplaintService';
import { ArrowLeft, Bell, CheckCircle2, CircleAlert, CircleCheckBig, MessageSquare, Phone, ThumbsDown, Wallet } from 'lucide-react';
import './AdminComplaintResolvePage.css';

type ResolveLocationState = {
  complaint?: AdminComplaintItem;
};

type ActionKey =
  | 'contact-customer'
  | 'contact-technician'
  | 'send-notification'
  | 'refund-customer'
  | 'warn-technician'
  | 'dismiss-complaint'
  | 'mark-done';

type ComplaintStatus = AdminComplaintItem['status'];

type SubmitFeedback = {
  kind: 'success' | 'error';
  message: string;
} | null;

type ContactCustomerForm = {
  method: 'call' | 'message';
  content: string;
  result: string;
  note: string;
};

type ContactTechnicianForm = {
  method: 'call' | 'message' | 'request-response';
  requestContent: string;
  deadline: string;
  result: string;
  note: string;
};

type NotificationForm = {
  receiver: 'customer' | 'technician' | 'both';
  title: string;
  message: string;
  type: 'info' | 'warning' | 'status-update';
};

type RefundForm = {
  amount: string;
  method: 'wallet' | 'bank-transfer' | 'voucher';
  reason: string;
  confirm: boolean;
};

type WarningForm = {
  level: 'low' | 'medium' | 'high';
  violationReason: string;
  penalty: 'warning-only' | 'temporarily-hide-service' | 'temporarily-suspend-account';
  notifyTechnician: boolean;
  finalAction: boolean;
};

type DismissForm = {
  reason: 'not-enough-evidence' | 'no-violation' | 'out-of-support-scope' | 'duplicate-complaint';
  explanation: string;
  customerReply: string;
  confirm: boolean;
};

type ResolveForm = {
  finalResolution: string;
  completedActions: string[];
  customerReply: string;
  confirm: boolean;
};

const contactResultOptions = [
  { value: 'contacted', label: 'Đã liên hệ' },
  { value: 'no-answer', label: 'Không nghe máy' },
  { value: 'admitted-issue', label: 'Thừa nhận sự cố' },
  { value: 'denied-issue', label: 'Phủ nhận sự cố' },
  { value: 'waiting-response', label: 'Đang chờ phản hồi' },
] as const;

const notificationTypeOptions = [
  { value: 'info', label: 'Thông tin' },
  { value: 'warning', label: 'Cảnh báo' },
  { value: 'status-update', label: 'Cập nhật trạng thái' },
] as const;

const dismissReasonOptions = [
  { value: 'not-enough-evidence', label: 'Không đủ bằng chứng' },
  { value: 'no-violation', label: 'Không có vi phạm' },
  { value: 'out-of-support-scope', label: 'Ngoài phạm vi hỗ trợ' },
  { value: 'duplicate-complaint', label: 'Khiếu nại trùng lặp' },
] as const;

const completedActionOptions = [
  { value: 'contact-customer', label: 'Đã liên hệ khách hàng' },
  { value: 'contact-technician', label: 'Đã liên hệ thợ' },
  { value: 'refund-customer', label: 'Đã hoàn tiền cho khách hàng' },
  { value: 'warn-technician', label: 'Đã cảnh báo thợ' },
  { value: 'send-notification', label: 'Đã gửi thông báo' },
] as const;

const statusLabelMap: Record<ComplaintStatus, string> = {
  open: 'Mới',
  investigating: 'Đang xử lý',
  resolved: 'Đã giải quyết',
  dismissed: 'Đã từ chối',
};

const statusToneMap: Record<ComplaintStatus, string> = {
  open: 'open',
  investigating: 'investigating',
  resolved: 'resolved',
  dismissed: 'dismissed',
};

const statusLocked = (status: ComplaintStatus) => status === 'resolved';

const actionOptions: Array<{
  key: ActionKey;
  title: string;
  subtitle: string;
  icon: ReactNode;
  accent: string;
}> = [
  { key: 'contact-customer', title: 'Liên hệ khách hàng', subtitle: 'Gọi điện hoặc nhắn tin để xác minh thông tin', icon: <Phone size={18} />, accent: 'green' },
  { key: 'contact-technician', title: 'Liên hệ thợ', subtitle: 'Gọi điện hoặc gửi yêu cầu phản hồi cho thợ', icon: <MessageSquare size={18} />, accent: 'blue' },
  { key: 'send-notification', title: 'Gửi thông báo', subtitle: 'Gửi thông báo hệ thống cho khách hàng hoặc thợ', icon: <Bell size={18} />, accent: 'purple' },
  { key: 'refund-customer', title: 'Hoàn tiền cho khách hàng', subtitle: 'Xử lý hoàn tiền theo chính sách', icon: <Wallet size={18} />, accent: 'orange' },
  { key: 'warn-technician', title: 'Cảnh báo thợ', subtitle: 'Gửi cảnh báo đến thợ thực hiện', icon: <CircleAlert size={18} />, accent: 'red' },
  { key: 'dismiss-complaint', title: 'Bác bỏ khiếu nại', subtitle: 'Đóng khiếu nại nếu không đủ cơ sở', icon: <ThumbsDown size={18} />, accent: 'gray' },
  { key: 'mark-done', title: 'Đánh dấu đã hoàn tất', subtitle: 'Khiếu nại đã được giải quyết xong', icon: <CircleCheckBig size={18} />, accent: 'emerald' },
];

const actionMeta: Record<ActionKey, { title: string; description: string; primaryLabel: string; help: string }> = {
  'contact-customer': {
    title: 'Chi tiết hành động: Liên hệ khách hàng',
    description: 'Gọi điện hoặc gửi tin nhắn cho khách hàng để xác minh thông tin khiếu nại.',
    primaryLabel: 'Thực hiện',
    help: 'Sau khi liên hệ, hệ thống sẽ lưu lại kết quả trao đổi để theo dõi.',
  },
  'contact-technician': {
    title: 'Chi tiết hành động: Liên hệ thợ',
    description: 'Gọi điện hoặc gửi tin nhắn cho thợ để lấy phản hồi liên quan đến khiếu nại.',
    primaryLabel: 'Gửi yêu cầu',
    help: 'Nên ghi chú lại nội dung làm việc với thợ để có hồ sơ xử lý.',
  },
  'send-notification': {
    title: 'Chi tiết hành động: Gửi thông báo',
    description: 'Tạo thông báo hệ thống để yêu cầu phản hồi hoặc cập nhật trạng thái.',
    primaryLabel: 'Gửi thông báo',
    help: 'Thông báo sẽ hiển thị trong hệ thống và có thể đi kèm nội dung nhắc nhở.',
  },
  'refund-customer': {
    title: 'Chi tiết hành động: Hoàn tiền khách hàng',
    description: 'Ghi nhận việc hoàn tiền cho khách hàng theo mức xử lý phù hợp.',
    primaryLabel: 'Xác nhận hoàn tiền',
    help: 'Chỉ dùng khi quyết định xử lý đã được chốt.',
  },
  'warn-technician': {
    title: 'Chi tiết hành động: Cảnh báo thợ',
    description: 'Gửi cảnh báo nội bộ đến thợ để theo dõi và nhắc nhở vi phạm.',
    primaryLabel: 'Gửi cảnh báo',
    help: 'Các cảnh báo sẽ được lưu để phục vụ đánh giá sau này.',
  },
  'dismiss-complaint': {
    title: 'Chi tiết hành động: Bác bỏ khiếu nại',
    description: 'Đóng khiếu nại nếu sau xác minh không có đủ căn cứ xử lý.',
    primaryLabel: 'Bác bỏ',
    help: 'Nên kèm lý do rõ ràng để giải thích cho người liên quan.',
  },
  'mark-done': {
    title: 'Chi tiết hành động: Đánh dấu đã hoàn tất',
    description: 'Chuyển khiếu nại sang trạng thái đã giải quyết và kết thúc quy trình.',
    primaryLabel: 'Hoàn tất',
    help: 'Dùng khi mọi bước xử lý đã xong và không cần theo dõi thêm.',
  },
};

const contactModes = [
  { key: 'call', label: 'Gọi điện', icon: <Phone size={16} /> },
  { key: 'message', label: 'Gửi tin nhắn', icon: <MessageSquare size={16} /> },
] as const;

const contactTechnicianModes = [
  { key: 'call', label: 'Gọi điện' },
  { key: 'message', label: 'Nhắn tin' },
  { key: 'request-response', label: 'Yêu cầu phản hồi' },
] as const;

const initialContactCustomerForm: ContactCustomerForm = {
  method: 'call',
  content: '',
  result: 'contacted',
  note: '',
};

const initialContactTechnicianForm: ContactTechnicianForm = {
  method: 'call',
  requestContent: '',
  deadline: '',
  result: 'waiting-response',
  note: '',
};

const initialNotificationForm: NotificationForm = {
  receiver: 'customer',
  title: '',
  message: '',
  type: 'info',
};

const initialRefundForm: RefundForm = {
  amount: '',
  method: 'wallet',
  reason: '',
  confirm: false,
};

const initialWarningForm: WarningForm = {
  level: 'medium',
  violationReason: '',
  penalty: 'warning-only',
  notifyTechnician: true,
  finalAction: false,
};

const initialDismissForm: DismissForm = {
  reason: 'not-enough-evidence',
  explanation: '',
  customerReply: '',
  confirm: false,
};

const initialResolveForm: ResolveForm = {
  finalResolution: '',
  completedActions: [],
  customerReply: '',
  confirm: false,
};

const getStatusLabel = (status: ComplaintStatus) => statusLabelMap[status];

const getStatusBadgeClass = (status: ComplaintStatus) => `crp-status-pill crp-status-pill--${statusToneMap[status]}`;

export default function AdminComplaintResolvePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const state = location.state as ResolveLocationState | null;
  const complaint = state?.complaint;
  const [activeAction, setActiveAction] = useState<ActionKey>('contact-customer');
  const [contactMode, setContactMode] = useState<ContactCustomerForm['method']>('call');
  const [complaintStatus, setComplaintStatus] = useState<ComplaintStatus>(complaint?.status || 'open');
  const [feedback, setFeedback] = useState<SubmitFeedback>(null);
  const [contactCustomerForm, setContactCustomerForm] = useState<ContactCustomerForm>(initialContactCustomerForm);
  const [contactTechnicianForm, setContactTechnicianForm] = useState<ContactTechnicianForm>(initialContactTechnicianForm);
  const [notificationForm, setNotificationForm] = useState<NotificationForm>(initialNotificationForm);
  const [refundForm, setRefundForm] = useState<RefundForm>(initialRefundForm);
  const [warningForm, setWarningForm] = useState<WarningForm>(initialWarningForm);
  const [dismissForm, setDismissForm] = useState<DismissForm>(initialDismissForm);
  const [resolveForm, setResolveForm] = useState<ResolveForm>(initialResolveForm);

  const currentAction = actionMeta[activeAction];
  const isLocked = statusLocked(complaintStatus);
  const technicianInfo = useMemo(() => {
    if (!complaint) return null;

    return {
      name: complaint.technicianName,
      phone: '--',
      rating: '--',
    };
  }, [complaint]);

  const leftSummary = useMemo(() => {
    if (!complaint) return null;

    return [
      { label: 'Mã khiếu nại', value: complaint.code },
      { label: 'Mã đơn hàng', value: complaint.orderCode },
      { label: 'Khách hàng', value: complaint.customerName },
      { label: 'Thợ thực hiện', value: complaint.technicianName },
      { label: 'Ngày gửi', value: complaint.createdAt },
      { label: 'Lý do', value: complaint.reasonLabel },
      { label: 'Trạng thái', value: getStatusLabel(complaintStatus) },
    ];
  }, [complaint, complaintStatus]);

  const setBanner = (kind: 'success' | 'error', message: string) => {
    setFeedback({ kind, message });
  };

  const handleLockedActionAttempt = () => {
    setBanner('error', 'Khiếu nại đã ở trạng thái cuối nên không thể thực hiện thêm hành động.');
  };

  const validateContactCustomer = () => {
    if (!contactCustomerForm.content.trim()) return 'Vui lòng nhập nội dung trao đổi với khách hàng.';
    if (!contactCustomerForm.result) return 'Vui lòng chọn kết quả liên hệ.';
    return '';
  };

  const validateContactTechnician = () => {
    if (!contactTechnicianForm.method) return 'Vui lòng chọn phương thức liên hệ.';
    if (!contactTechnicianForm.requestContent.trim()) return 'Vui lòng nhập nội dung yêu cầu cho thợ.';
    if (!contactTechnicianForm.deadline) return 'Vui lòng chọn hạn phản hồi.';
    if (!contactTechnicianForm.result) return 'Vui lòng chọn kết quả liên hệ.';
    return '';
  };

  const validateNotification = () => {
    if (!notificationForm.title.trim()) return 'Vui lòng nhập tiêu đề thông báo.';
    if (!notificationForm.message.trim()) return 'Vui lòng nhập nội dung thông báo.';
    if (!notificationForm.receiver) return 'Vui lòng chọn người nhận.';
    return '';
  };

  const validateRefund = () => {
    if (!refundForm.amount.trim()) return 'Vui lòng nhập số tiền hoàn.';
    if (Number.isNaN(Number(refundForm.amount)) || Number(refundForm.amount) <= 0) return 'Số tiền hoàn phải lớn hơn 0.';
    if (!refundForm.reason.trim()) return 'Vui lòng nhập lý do hoàn tiền.';
    if (!refundForm.confirm) return 'Vui lòng xác nhận trước khi hoàn tiền.';
    return '';
  };

  const validateWarning = () => {
    if (!warningForm.violationReason.trim()) return 'Vui lòng nhập lý do vi phạm.';
    if (!warningForm.level) return 'Vui lòng chọn mức cảnh báo.';
    if (!warningForm.penalty) return 'Vui lòng chọn biện pháp xử lý.';
    return '';
  };

  const validateDismiss = () => {
    if (!dismissForm.reason) return 'Vui lòng chọn lý do bác bỏ.';
    if (!dismissForm.explanation.trim()) return 'Vui lòng nhập phần giải thích.';
    if (!dismissForm.customerReply.trim()) return 'Vui lòng nhập phản hồi gửi khách hàng.';
    if (!dismissForm.confirm) return 'Vui lòng xác nhận trước khi bác bỏ khiếu nại.';
    return '';
  };

  const validateResolve = () => {
    if (!resolveForm.finalResolution.trim()) return 'Vui lòng nhập kết luận cuối cùng.';
    if (resolveForm.completedActions.length === 0) return 'Vui lòng chọn ít nhất một hành động đã hoàn thành.';
    if (!resolveForm.customerReply.trim()) return 'Vui lòng nhập phản hồi gửi khách hàng.';
    if (!resolveForm.confirm) return 'Vui lòng xác nhận trước khi đánh dấu hoàn tất.';
    return '';
  };

  const handleSubmit = (action: ActionKey) => {
    if (isLocked) {
      handleLockedActionAttempt();
      return;
    }

    if (action === 'contact-customer') {
      const error = validateContactCustomer();
      if (error) {
        setBanner('error', error);
        return;
      }

      setComplaintStatus('investigating');
      setBanner('success', 'Đã lưu nhật ký liên hệ khách hàng và chuyển trạng thái sang Đang xử lý.');
      return;
    }

    if (action === 'contact-technician') {
      const error = validateContactTechnician();
      if (error) {
        setBanner('error', error);
        return;
      }

      setComplaintStatus('investigating');
      setBanner('success', 'Đã lưu nhật ký liên hệ thợ và chuyển trạng thái sang Đang xử lý.');
      return;
    }

    if (action === 'send-notification') {
      const error = validateNotification();
      if (error) {
        setBanner('error', error);
        return;
      }

      setComplaintStatus('investigating');
      setBanner('success', 'Đã lưu nhật ký hành động, gửi thông báo và giữ trạng thái Đang xử lý.');
      return;
    }

    if (action === 'refund-customer') {
      const error = validateRefund();
      if (error) {
        setBanner('error', error);
        return;
      }

      setComplaintStatus('investigating');
      setBanner('success', 'Đã tạo giao dịch hoàn tiền và giữ trạng thái khiếu nại ở Đang xử lý.');
      return;
    }

    if (action === 'warn-technician') {
      const error = validateWarning();
      if (error) {
        setBanner('error', error);
        return;
      }

      setComplaintStatus('investigating');
      setBanner('success', 'Đã tạo cảnh báo thợ và giữ trạng thái khiếu nại ở Đang xử lý.');
      return;
    }

    if (action === 'dismiss-complaint') {
      const error = validateDismiss();
      if (error) {
        setBanner('error', error);
        return;
      }

      setComplaintStatus('investigating');
      setBanner('success', 'Đã bác bỏ khiếu nại, gửi phản hồi cho khách hàng và giữ trạng thái Đang xử lý.');
      return;
    }

    const error = validateResolve();
    if (error) {
      setBanner('error', error);
      return;
    }

    setComplaintStatus('resolved');
    setBanner('success', 'Đã đánh dấu khiếu nại là đã giải quyết và khóa hồ sơ.');
  };

  const toggleCompletedAction = (value: string) => {
    setResolveForm((current) => ({
      ...current,
      completedActions: current.completedActions.includes(value)
        ? current.completedActions.filter((item) => item !== value)
        : [...current.completedActions, value],
    }));
  };

  const renderFormBanner = () =>
    feedback ? <div className={`crp-feedback crp-feedback--${feedback.kind}`}>{feedback.message}</div> : null;

  const renderStatusLockBanner = () =>
    isLocked ? <div className="crp-lock-banner">Khiếu nại đã ở trạng thái cuối. Các hành động bị vô hiệu hóa.</div> : null;

  const renderActionForm = () => {
    switch (activeAction) {
      case 'contact-customer':
        return (
          <form
            className="crp-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit('contact-customer');
            }}
          >
            <div className="crp-contact-toggle">
              {contactModes.map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  className={`crp-toggle-btn ${contactMode === mode.key ? 'is-active' : ''}`}
                  onClick={() => setContactMode(mode.key)}
                  disabled={isLocked}
                >
                  {mode.icon}
                  {mode.label}
                </button>
              ))}
            </div>

            <div className="crp-contact-card">
              <div>
                <div className="crp-small-label">Thông tin khách hàng</div>
                <div className="crp-contact-name">{complaintData.customerName}</div>
                <div className="crp-contact-sub">Mã đơn: {complaintData.orderCode}</div>
              </div>
              <button type="button" className="crp-copy-btn" disabled={isLocked}>
                Sao chép
              </button>
            </div>

            <label className="crp-field">
              <span>Nội dung trao đổi</span>
              <textarea
                className="crp-textarea crp-textarea--large"
                placeholder="Nhập nội dung trao đổi, xác minh thông tin với khách hàng..."
                rows={5}
                value={contactCustomerForm.content}
                onChange={(event) => setContactCustomerForm((current) => ({ ...current, content: event.target.value }))}
                disabled={isLocked}
              />
            </label>

            <label className="crp-field">
              <span>Kết quả liên hệ</span>
              <select
                className="crp-select"
                value={contactCustomerForm.result}
                onChange={(event) => setContactCustomerForm((current) => ({ ...current, result: event.target.value }))}
                disabled={isLocked}
              >
                {contactResultOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="crp-field">
              <span>Ghi chú</span>
              <textarea
                className="crp-textarea"
                placeholder="Nhập ghi chú (nếu có)..."
                rows={4}
                value={contactCustomerForm.note}
                onChange={(event) => setContactCustomerForm((current) => ({ ...current, note: event.target.value }))}
                disabled={isLocked}
              />
            </label>

            <div className="crp-footer-actions">
              <button type="button" className="crp-secondary-btn" onClick={() => navigate('/admin/complaints')} disabled={isLocked}>
                Hủy
              </button>
              <button type="submit" className="crp-primary-btn" disabled={isLocked}>
                {currentAction.primaryLabel}
              </button>
            </div>
          </form>
        );

      case 'contact-technician':
        return (
          <form
            className="crp-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit('contact-technician');
            }}
          >
            <div className="crp-readonly-grid">
              <label className="crp-field">
                <span>Tên thợ</span>
                <input className="crp-input crp-input--readonly" type="text" readOnly value={technicianInfo?.name || '--'} />
              </label>
              <label className="crp-field">
                <span>Số điện thoại</span>
                <input className="crp-input crp-input--readonly" type="text" readOnly value={technicianInfo?.phone || '--'} />
              </label>
              <label className="crp-field">
                <span>Đánh giá</span>
                <input className="crp-input crp-input--readonly" type="text" readOnly value={technicianInfo?.rating || '--'} />
              </label>
            </div>

            <label className="crp-field">
              <span>Phương thức liên hệ</span>
              <select
                className="crp-select"
                value={contactTechnicianForm.method}
                onChange={(event) => setContactTechnicianForm((current) => ({ ...current, method: event.target.value as ContactTechnicianForm['method'] }))}
                disabled={isLocked}
              >
                {contactTechnicianModes.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="crp-field">
              <span>Nội dung yêu cầu</span>
              <textarea
                className="crp-textarea crp-textarea--large"
                rows={5}
                placeholder="Yêu cầu thợ giải thích hoặc xác nhận vấn đề..."
                value={contactTechnicianForm.requestContent}
                onChange={(event) => setContactTechnicianForm((current) => ({ ...current, requestContent: event.target.value }))}
                disabled={isLocked}
              />
            </label>

            <div className="crp-form-row">
              <label className="crp-field">
                <span>Hạn phản hồi</span>
                <input
                  className="crp-input"
                  type="datetime-local"
                  value={contactTechnicianForm.deadline}
                  onChange={(event) => setContactTechnicianForm((current) => ({ ...current, deadline: event.target.value }))}
                  disabled={isLocked}
                />
              </label>

              <label className="crp-field">
                <span>Kết quả liên hệ</span>
                <select
                  className="crp-select"
                  value={contactTechnicianForm.result}
                  onChange={(event) => setContactTechnicianForm((current) => ({ ...current, result: event.target.value }))}
                  disabled={isLocked}
                >
                  {contactResultOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="crp-field">
              <span>Ghi chú nội bộ</span>
              <textarea
                className="crp-textarea"
                rows={4}
                placeholder="Ghi chú nội bộ về quá trình liên hệ..."
                value={contactTechnicianForm.note}
                onChange={(event) => setContactTechnicianForm((current) => ({ ...current, note: event.target.value }))}
                disabled={isLocked}
              />
            </label>

            <div className="crp-footer-actions">
              <button type="button" className="crp-secondary-btn" onClick={() => navigate('/admin/complaints')} disabled={isLocked}>
                Hủy
              </button>
              <button type="submit" className="crp-primary-btn" disabled={isLocked}>
                Gửi yêu cầu
              </button>
            </div>
          </form>
        );

      case 'send-notification':
        return (
          <form
            className="crp-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit('send-notification');
            }}
          >
            <label className="crp-field">
              <span>Người nhận</span>
              <select
                className="crp-select"
                value={notificationForm.receiver}
                onChange={(event) => setNotificationForm((current) => ({ ...current, receiver: event.target.value as NotificationForm['receiver'] }))}
                disabled={isLocked}
              >
                <option value="customer">Khách hàng</option>
                <option value="technician">Thợ</option>
                <option value="both">Cả hai</option>
              </select>
            </label>

            <label className="crp-field">
              <span>Tiêu đề</span>
              <input
                className="crp-input"
                type="text"
                placeholder="Nhập tiêu đề thông báo"
                value={notificationForm.title}
                onChange={(event) => setNotificationForm((current) => ({ ...current, title: event.target.value }))}
                disabled={isLocked}
              />
            </label>

            <label className="crp-field">
              <span>Nội dung</span>
              <textarea
                className="crp-textarea crp-textarea--large"
                rows={6}
                placeholder="Nội dung thông báo..."
                value={notificationForm.message}
                onChange={(event) => setNotificationForm((current) => ({ ...current, message: event.target.value }))}
                disabled={isLocked}
              />
            </label>

            <label className="crp-field">
              <span>Loại thông báo</span>
              <select
                className="crp-select"
                value={notificationForm.type}
                onChange={(event) => setNotificationForm((current) => ({ ...current, type: event.target.value as NotificationForm['type'] }))}
                disabled={isLocked}
              >
                {notificationTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="crp-footer-actions">
              <button type="button" className="crp-secondary-btn" onClick={() => navigate('/admin/complaints')} disabled={isLocked}>
                Hủy
              </button>
              <button type="submit" className="crp-primary-btn" disabled={isLocked}>
                Gửi thông báo
              </button>
            </div>
          </form>
        );

      case 'refund-customer':
        return (
          <form
            className="crp-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit('refund-customer');
            }}
          >
            <div className="crp-form-row">
              <label className="crp-field">
                <span>Số tiền hoàn</span>
                <input
                  className="crp-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={refundForm.amount}
                  onChange={(event) => setRefundForm((current) => ({ ...current, amount: event.target.value }))}
                  disabled={isLocked}
                />
              </label>

              <label className="crp-field">
                <span>Phương thức hoàn tiền</span>
                <select
                  className="crp-select"
                  value={refundForm.method}
                  onChange={(event) => setRefundForm((current) => ({ ...current, method: event.target.value as RefundForm['method'] }))}
                  disabled={isLocked}
                >
                  <option value="wallet">Ví</option>
                  <option value="bank-transfer">Chuyển khoản ngân hàng</option>
                  <option value="voucher">Phiếu giảm giá</option>
                </select>
              </label>
            </div>

            <label className="crp-field">
              <span>Lý do hoàn tiền</span>
              <textarea
                className="crp-textarea"
                rows={4}
                placeholder="Nêu rõ lý do hoàn tiền hoặc bồi thường..."
                value={refundForm.reason}
                onChange={(event) => setRefundForm((current) => ({ ...current, reason: event.target.value }))}
                disabled={isLocked}
              />
            </label>

            <div className="crp-readonly-grid">
              <label className="crp-field">
                <span>Người duyệt</span>
                <input className="crp-input crp-input--readonly" type="text" readOnly value="Quản trị viên hiện tại" />
              </label>
              <label className="crp-field crp-field--inline">
                <input
                  type="checkbox"
                  checked={refundForm.confirm}
                  onChange={(event) => setRefundForm((current) => ({ ...current, confirm: event.target.checked }))}
                  disabled={isLocked}
                />
                <span>Tôi xác nhận hoàn tiền</span>
              </label>
            </div>

            <div className="crp-footer-actions">
              <button type="button" className="crp-secondary-btn" onClick={() => navigate('/admin/complaints')} disabled={isLocked}>
                Hủy
              </button>
              <button type="submit" className="crp-primary-btn" disabled={isLocked}>
                Xác nhận hoàn tiền
              </button>
            </div>
          </form>
        );

      case 'warn-technician':
        return (
          <form
            className="crp-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit('warn-technician');
            }}
          >
            <label className="crp-field">
              <span>Mức cảnh báo</span>
              <select
                className="crp-select"
                value={warningForm.level}
                onChange={(event) => setWarningForm((current) => ({ ...current, level: event.target.value as WarningForm['level'] }))}
                disabled={isLocked}
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </label>

            <label className="crp-field">
              <span>Lý do vi phạm</span>
              <textarea
                className="crp-textarea crp-textarea--large"
                rows={4}
                placeholder="Mô tả vi phạm của thợ..."
                value={warningForm.violationReason}
                onChange={(event) => setWarningForm((current) => ({ ...current, violationReason: event.target.value }))}
                disabled={isLocked}
              />
            </label>

            <label className="crp-field">
              <span>Biện pháp xử lý</span>
              <select
                className="crp-select"
                value={warningForm.penalty}
                onChange={(event) => setWarningForm((current) => ({ ...current, penalty: event.target.value as WarningForm['penalty'] }))}
                disabled={isLocked}
              >
                <option value="warning-only">Chỉ cảnh báo</option>
                <option value="temporarily-hide-service">Tạm ẩn dịch vụ</option>
                <option value="temporarily-suspend-account">Tạm khóa tài khoản</option>
              </select>
            </label>

            <div className="crp-readonly-grid">
              <label className="crp-field crp-field--inline">
                <input
                  type="checkbox"
                  checked={warningForm.notifyTechnician}
                  onChange={(event) => setWarningForm((current) => ({ ...current, notifyTechnician: event.target.checked }))}
                  disabled={isLocked}
                />
                <span>Thông báo cho thợ</span>
              </label>
              <label className="crp-field crp-field--inline">
                <input
                  type="checkbox"
                  checked={warningForm.finalAction}
                  onChange={(event) => setWarningForm((current) => ({ ...current, finalAction: event.target.checked }))}
                  disabled={isLocked}
                />
                <span>Đánh dấu là kết luận cuối</span>
              </label>
            </div>

            <div className="crp-footer-actions">
              <button type="button" className="crp-secondary-btn" onClick={() => navigate('/admin/complaints')} disabled={isLocked}>
                Hủy
              </button>
              <button type="submit" className="crp-primary-btn" disabled={isLocked}>
                Gửi cảnh báo
              </button>
            </div>
          </form>
        );

      case 'dismiss-complaint':
        return (
          <form
            className="crp-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit('dismiss-complaint');
            }}
          >
            <label className="crp-field">
              <span>Lý do bác bỏ</span>
              <select
                className="crp-select"
                value={dismissForm.reason}
                onChange={(event) => setDismissForm((current) => ({ ...current, reason: event.target.value as DismissForm['reason'] }))}
                disabled={isLocked}
              >
                {dismissReasonOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="crp-field">
              <span>Giải thích</span>
              <textarea
                className="crp-textarea crp-textarea--large"
                rows={4}
                placeholder="Giải thích lý do bác bỏ khiếu nại..."
                value={dismissForm.explanation}
                onChange={(event) => setDismissForm((current) => ({ ...current, explanation: event.target.value }))}
                disabled={isLocked}
              />
            </label>

            <label className="crp-field">
              <span>Phản hồi khách hàng</span>
              <textarea
                className="crp-textarea"
                rows={4}
                placeholder="Nội dung phản hồi gửi khách hàng..."
                value={dismissForm.customerReply}
                onChange={(event) => setDismissForm((current) => ({ ...current, customerReply: event.target.value }))}
                disabled={isLocked}
              />
            </label>

            <label className="crp-field crp-field--inline">
              <input
                type="checkbox"
                checked={dismissForm.confirm}
                onChange={(event) => setDismissForm((current) => ({ ...current, confirm: event.target.checked }))}
                disabled={isLocked}
              />
              <span>Tôi xác nhận bác bỏ khiếu nại này</span>
            </label>

            <div className="crp-footer-actions">
              <button type="button" className="crp-secondary-btn" onClick={() => navigate('/admin/complaints')} disabled={isLocked}>
                Hủy
              </button>
              <button type="submit" className="crp-primary-btn" disabled={isLocked}>
                Bác bỏ khiếu nại
              </button>
            </div>
          </form>
        );

      case 'mark-done':
      default:
        return (
          <form
            className="crp-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit('mark-done');
            }}
          >
            <label className="crp-field">
              <span>Kết luận cuối cùng</span>
              <textarea
                className="crp-textarea crp-textarea--large"
                rows={4}
                placeholder="Mô tả kết luận cuối cùng..."
                value={resolveForm.finalResolution}
                onChange={(event) => setResolveForm((current) => ({ ...current, finalResolution: event.target.value }))}
                disabled={isLocked}
              />
            </label>

            <div className="crp-checkbox-grid">
              {completedActionOptions.map((option) => (
                <label key={option.value} className="crp-checkbox-option">
                  <input
                    type="checkbox"
                    checked={resolveForm.completedActions.includes(option.value)}
                    onChange={() => toggleCompletedAction(option.value)}
                    disabled={isLocked}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>

            <label className="crp-field">
              <span>Phản hồi khách hàng</span>
              <textarea
                className="crp-textarea"
                rows={4}
                placeholder="Phản hồi cuối cùng cho khách hàng..."
                value={resolveForm.customerReply}
                onChange={(event) => setResolveForm((current) => ({ ...current, customerReply: event.target.value }))}
                disabled={isLocked}
              />
            </label>

            <label className="crp-field crp-field--inline">
              <input
                type="checkbox"
                checked={resolveForm.confirm}
                onChange={(event) => setResolveForm((current) => ({ ...current, confirm: event.target.checked }))}
                disabled={isLocked}
              />
              <span>Tôi xác nhận có thể đánh dấu khiếu nại này là đã giải quyết</span>
            </label>

            <div className="crp-footer-actions">
              <button type="button" className="crp-secondary-btn" onClick={() => navigate('/admin/complaints')} disabled={isLocked}>
                Hủy
              </button>
              <button type="submit" className="crp-primary-btn" disabled={isLocked}>
                Đánh dấu đã giải quyết
              </button>
            </div>
          </form>
        );
    }
  };

  if (!complaint) {
    return (
      <div className="crp-shell">
        <AdminSidebar activeItem="complaints" />
        <main className="crp-main">
          <AdminHeader />
          <div className="crp-empty-state">
            <h1>Giải quyết khiếu nại</h1>
            <p>Không tìm thấy dữ liệu khiếu nại để hiển thị. Vui lòng mở trang này từ popup chi tiết khiếu nại.</p>
            <button className="crp-back-btn" type="button" onClick={() => navigate('/admin/complaints')}>
              <ArrowLeft size={16} />
              Quay lại danh sách
            </button>
            <div className="crp-empty-hint">Mã khiếu nại: {params.complaintId || '--'}</div>
          </div>
        </main>
      </div>
    );
  }

  const complaintData = complaint;

  return (
    <div className="crp-shell">
      <AdminSidebar activeItem="complaints" />
      <main className="crp-main">
        <AdminHeader />

        <div className="crp-topbar">
          <div>
            <div className="crp-breadcrumb">Khiếu nại &gt; Giải quyết khiếu nại &gt; {complaint.code}</div>
            <div className="crp-title-row">
              <h1>Giải quyết khiếu nại {complaint.code}</h1>
              <span className={getStatusBadgeClass(complaintStatus)}>{getStatusLabel(complaintStatus)}</span>
            </div>
          </div>

          <button className="crp-back-btn" type="button" onClick={() => navigate('/admin/complaints')}>
            <ArrowLeft size={16} />
            Quay lại chi tiết
          </button>
        </div>

        <section className="crp-grid">
          <aside className="crp-column crp-column--left">
            <article className="crp-card">
              <h2>Thông tin khiếu nại</h2>
              <dl className="crp-kvp-list">
                {leftSummary?.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="crp-description-block">
                <div className="crp-contact-name">{complaintData.customerName}</div>
                <div className="crp-contact-sub">Mã đơn: {complaintData.orderCode}</div>
              </div>
            </article>

            <article className="crp-card">
              <div className="crp-card-head">
                <h2>Bằng chứng ({complaint.evidenceImages.length})</h2>
                <button type="button" className="crp-link-btn">Xem tất cả</button>
              </div>
              <div className="crp-evidence-strip">
                {complaint.evidenceImages.length > 0 ? (
                  complaint.evidenceImages.slice(0, 4).map((image, index) => (
                    <a key={`${complaint.id}-${index}`} href={image} target="_blank" rel="noreferrer" className="crp-evidence-thumb">
                      Ảnh {index + 1}
                    </a>
                  ))
                ) : (
                  <div className="crp-muted">Không có ảnh bằng chứng</div>
                )}
              </div>
            </article>

            <article className="crp-card crp-card--status">
              <div className="crp-block-title">Trạng thái hiện tại</div>
              <div className={`crp-status-box crp-status-box--${complaint.status}`}>
                <strong>{complaint.statusLabel}</strong>
                <span>{complaint.createdAt}</span>
                <p>{complaint.description}</p>
              </div>
            </article>

            <article className="crp-card">
              <div className="crp-block-title">Ghi chú nội bộ</div>
              <textarea className="crp-textarea" placeholder="Nhập ghi chú nội bộ..." rows={4} />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" className="crp-primary-inline-btn">Lưu ghi chú</button>
              </div>
            </article>
          </aside>

          <section className="crp-column crp-column--middle">
            <article className="crp-card">
              <h2>Hành động xử lý</h2>
              <p className="crp-card-subtitle">Chọn một hành động bên dưới để thực hiện xử lý khiếu nại.</p>
              <div className="crp-action-list">
                {actionOptions.map((action) => (
                  <button
                    key={action.key}
                    type="button"
                    className={`crp-action-item is-${action.accent} ${activeAction === action.key ? 'is-active' : ''}`}
                    onClick={() => {
                      if (isLocked) {
                        handleLockedActionAttempt();
                        return;
                      }
                      setActiveAction(action.key);
                    }}
                    disabled={isLocked}
                  >
                    <span className="crp-action-icon">{action.icon}</span>
                    <span className="crp-action-copy">
                      <strong>{action.title}</strong>
                      <span>{action.subtitle}</span>
                    </span>
                    <span className="crp-action-chevron">›</span>
                  </button>
                ))}
              </div>
            </article>
          </section>

          <section className="crp-column crp-column--right">
            <article className="crp-card crp-card--detail">
              <div className="crp-detail-head">
                <div>
                  <h2>{currentAction.title}</h2>
                  <p>{currentAction.description}</p>
                </div>
                <div className="crp-detail-badge">
                  {actionOptions.find((item) => item.key === activeAction)?.icon || <CheckCircle2 size={18} />}
                </div>
              </div>

              {renderStatusLockBanner()}
              {renderFormBanner()}
              {renderActionForm()}

              <div className="crp-help-box">{currentAction.help}</div>
            </article>
          </section>
        </section>
      </main>
    </div>
  );
}