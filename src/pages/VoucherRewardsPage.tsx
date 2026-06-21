import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Sparkles, WalletCards, ShoppingBag, UserPlus, CalendarCheck2, CircleDollarSign } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import './VoucherRewardsPage.css';


export default function VoucherRewardsPage() {
  const navigate = useNavigate();
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [dailyGiftReward, setDailyGiftReward] = useState<string | null>(null);
  const [claimedToday, setClaimedToday] = useState(false);

  const pageMap: Record<string, string> = {
    home: '/',
    services: '/services',
    rewards: '/rewards',
  };

  const onNavigate = (page: string, data?: unknown) => navigate(pageMap[page] || '/', { state: data });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 6;
      const y = (e.clientY / window.innerHeight - 0.5) * 6;
      setParallax({ x, y });
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div className="rewards-page">
      <Header onNavigate={onNavigate} />

      <main className="rewards-container">
        {/* HERO */}
        <section className="card card--hero" aria-labelledby="rewards-hero-title">
          <div className="hero-inner">
            <div className="hero-left">
              <div className="eyebrow">Đặc quyền Premium</div>
              <h1 id="rewards-hero-title">Voucher & đặc quyền dành cho bạn</h1>
              <p className="lead">Ưu đãi chọn lọc, tiết kiệm thông minh và quyền lợi dành riêng cho hội viên.</p>
              <div className="hero-cta-wrap">
                <button className="btn-primary" onClick={() => navigate('/services')}>Khám phá ưu đãi</button>
                <button className="btn-ghost" onClick={() => onNavigate('rewards')}>Xem chi tiết</button>
              </div>
            </div>

            <div className="hero-center">
              <div className="gift-wrap" aria-hidden>
                <img src="/image/gift-main.jpg" alt="gift box" className="hero-illus illus-blend" style={{ transform: `translate(${parallax.x}px, ${parallax.y}px)` }} />
                <div className="gift-shadow" />
              </div>
            </div>

            <div className="hero-right">
              <div className="savings-card">
                <img src="/image/piggy.jpg" alt="piggy" className="piggy illus-blend" style={{ transform: `translate(${parallax.x * 0.5}px, ${parallax.y * 0.5}px)` }} />
                <div className="savings-copy">
                  <div className="savings-amount">1.280.000đ</div>
                  <div className="savings-meta">Tiết kiệm từ voucher</div>
                  <div className="member-level">Hạng: <strong>Platinum</strong></div>
                </div>
              </div>
            </div>
          </div>

          <div className="orb orb-a" style={{ transform: `translate(${parallax.x}px, ${parallax.y}px)` }} />
          <div className="orb orb-b" style={{ transform: `translate(${parallax.x * -0.6}px, ${parallax.y * 0.8}px)` }} />
        </section>

        {/* TOP GRID */}
        <section className="top-grid">
          <div className="left-col">
            <div className="card card--vouchers">
              <VoucherListSection />
            </div>
            <div className="card card--missions">
              <MissionsTasksCard />
            </div>
            
          </div>
          <aside className="right-col">
            <div className="card card--checkin">
              <SevenDayCheckInCard dailyReward={dailyGiftReward} isClaimedToday={claimedToday} />
            </div>
            <div className="card daily-gift-card" aria-live="polite">
              <DailyMysteryGift onRewardClaimed={setDailyGiftReward} onClaimStatusChange={setClaimedToday} />
            </div>
            <div className="card card--benefits">
              <PremiumBenefitsCard />
            </div>
            <div className="card card--referral">
              <ReferralRewardBanner />
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function DailyMysteryGift({ onRewardClaimed, onClaimStatusChange }: { onRewardClaimed: (reward: string) => void; onClaimStatusChange: (claimed: boolean) => void }) {
  const [claimedToday, setClaimedToday] = useState(false);
  const [storedReward, setStoredReward] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const rewards = ['Voucher 20K', 'Voucher 50K', '100 points'];

  function handleOpen(index: number) {
    if (claimedToday || showModal) return;
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
    setSelected(index);
    setShowModal(true);
  }

  function finalizeReward() {
    if (selected === null) return;
    const reward = rewards[selected];
    setStoredReward(reward);
    setClaimedToday(true);
    onRewardClaimed(reward);
    onClaimStatusChange(true);
    setShowModal(false);
  }

  return (
    <div className="daily-gift-root">
      <div className="daily-header">
        <div className="section-label">Quà bí mật mỗi ngày</div>
        <h3 className="daily-title">Daily Mystery Gift</h3>
        <p className="daily-sub">Mở 1 hộp mỗi ngày để nhận voucher và ưu đãi đặc biệt.</p>
      </div>

      <div className="gift-row" role="list">
        {[0, 1, 2].map((i) => {
          const src = i === 0 ? '/image/gift-blue.jpg' : i === 1 ? '/image/gift-cyan.jpg' : '/image/gift-purple.jpg';
          return (
            <button
              key={i}
              role="listitem"
              className={`gift-box gift-${i} ${selected === i ? 'is-selected' : ''} ${claimedToday && selected !== i ? 'is-disabled' : ''} ${isShaking && selected === i ? 'is-shaking' : ''}`}
              onClick={() => handleOpen(i)}
              aria-pressed={selected === i}
              disabled={claimedToday && selected !== i}
            >
              <img src={src} alt={`gift ${i + 1}`} className="gift-img illus-blend" />
              <div className="gift-reward">Mở để nhận</div>
            </button>
          );
        })}
      </div>

      {claimedToday && storedReward && (
        <div className="daily-final">
          <strong>Hôm nay bạn đã nhận {storedReward}, quay lại ngày mai để tiếp tục nhận quà</strong>
        </div>
      )}

      {showModal && selected !== null && (
        <div className="gift-modal-backdrop" onClick={() => {}}>
          <div className="gift-modal" role="dialog" aria-modal="true">
            <div className="modal-hero">
              <div className="modal-gift illus-float">
                <img
                  src={selected === 0 ? '/image/gift-blue.jpg' : selected === 1 ? '/image/gift-cyan.jpg' : '/image/gift-purple.jpg'}
                  alt="opened gift"
                  className="modal-gift-img illus-blend"
                />
              </div>
            </div>
            <div className="modal-body">
              <h4>Bạn đã trúng thưởng!</h4>
              <p className="modal-reward-reveal">{rewards[selected]}</p>
              <p className="modal-sub">Chúc mừng, bạn vừa nhận được phần quà hôm nay!</p>
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={finalizeReward}>Nhận quà</button>
            </div>
            <div className="confetti-root" aria-hidden>
              {Array.from({ length: 25 }).map((_, k) => (
                <span key={k} className={`confetti confetti-${k % 6}`} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SevenDayCheckInCard({ dailyReward, isClaimedToday }: { dailyReward: string | null; isClaimedToday: boolean }) {
  const today = new Date().getDay(); // 0 = Sunday, 1-6 = Mon-Sat
  const dayIndex = today === 0 ? 6 : today - 1; // Convert to 0-6 (T2-CN)

  const days = [
    { day: 'T2', label: '100đ', active: true },
    { day: 'T3', label: '200đ', active: true },
    { day: 'T4', label: '150đ', active: true },
    { day: 'T5', label: '300đ', active: true },
    { day: 'T6', label: 'Quà', active: false },
    { day: 'T7', label: 'Quà', active: false },
    { day: 'CN', label: 'Quà', active: false },
  ];

  return (
    <div className="checkin-card-panel">
      <div className="checkin-head">
        <div>
          <div className="checkin-kicker">7-day check-in</div>
          <h4 className="checkin-title">Nhận quà mỗi ngày</h4>
        </div>
        <div className="checkin-streak">
          {dayIndex + 1}/7
        </div>
      </div>

      <div className="checkin-row" role="list" aria-label="7-day check-in rewards">
        {days.map((item, index) => {
          const isCurrent = index === dayIndex;
          const showReward = isCurrent && isClaimedToday && dailyReward;
          const displayReward = showReward ? dailyReward : item.label;

          return (
            <div
              key={item.day}
              role="listitem"
              className={`checkin-day ${item.active ? 'is-active' : ''} ${isCurrent ? 'is-current' : ''}`}
              data-claimed={isCurrent && isClaimedToday ? 'true' : 'false'}
            >
              <span className="checkin-day-label">{item.day}</span>
              <span className="checkin-orb">{displayReward}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PremiumBenefitsCard() {
  const benefits = [
    {
      icon: <Sparkles size={16} />,
      title: 'Priority scheduling',
      description: 'Ưu tiên xếp lịch sớm hơn trong khung giờ cao điểm.',
    },
    {
      icon: <CheckCircle2 size={16} />,
      title: 'Free inspection',
      description: 'Kiểm tra nhanh miễn phí trước khi xác nhận dịch vụ.',
    },
    {
      icon: <WalletCards size={16} />,
      title: 'Automatic savings',
      description: 'Voucher phù hợp được gợi ý và áp dụng tự động.',
    },
    {
      icon: <ShieldCheck size={16} />,
      title: 'VIP support',
      description: 'Kênh hỗ trợ riêng dành cho thành viên thân thiết.',
    },
  ];

  return (
    <div className="benefits-card">
      <div className="benefits-head">
        <div className="checkin-kicker">Premium benefits</div>
        <h4 className="benefits-title">Quyền lợi dành riêng cho bạn</h4>
      </div>

      <div className="benefits-list">
        {benefits.map((item) => (
          <div key={item.title} className="benefit-item">
            <div className="benefit-icon">{item.icon}</div>
            <div className="benefit-copy">
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VoucherListSection() {
  const filters = ['All', 'HOT', 'VIP', 'Expiring'];

  const vouchers = [
    {
      tone: 'hot',
      badge: 'HOT',
      title: 'Giảm 20K cho dịch vụ phổ biến',
      description: 'Voucher dùng nhanh cho các đơn dịch vụ đang được đặt nhiều nhất.',
      expiry: '12/05/2026',
      cta: 'Dùng ngay',
      accent: '20K',
    },
    {
      tone: 'vip',
      badge: 'VIP',
      title: 'Ưu đãi Platinum dành riêng cho hội viên',
      description: 'Tăng giá trị đơn hàng với mức ưu đãi dành riêng cho thành viên thân thiết.',
      expiry: '16/05/2026',
      cta: 'Xem điều kiện',
      accent: '50K',
    },
    {
      tone: 'expiring',
      badge: 'EXPIRING',
      title: 'Voucher sắp hết hạn cho hôm nay',
      description: 'Áp dụng trước khi kết thúc ngày để không bỏ lỡ ưu đãi đang mở.',
      expiry: 'Hết hạn hôm nay',
      cta: 'Kích hoạt',
      accent: '15%',
    },
  ];
  return (
    <div className="voucher-list-section">
      <div className="voucher-list-head">
        <div>
          <div className="section-label">Voucher list</div>
          <h3 className="voucher-list-title">Ưu đãi nổi bật</h3>
        </div>
        <div className="voucher-filter-row" role="tablist" aria-label="Voucher filters">
          {filters.map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={`voucher-filter-pill ${index === 0 ? 'is-active' : ''}`}
              aria-pressed={index === 0}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="voucher-stack-list">
        {vouchers.map((voucher, index) => (
          <article key={voucher.title} className={`voucher-list-card tone-${voucher.tone}`}>
            <div className="voucher-list-left">
              <div className="voucher-list-badge">{voucher.badge}</div>
              <div className="voucher-list-amount">{voucher.accent}</div>
            </div>

            <div className="voucher-list-divider" aria-hidden />

            <div className="voucher-list-right">
              <div className="voucher-list-top">
                <div className="voucher-list-copy">
                  <h4>{voucher.title}</h4>
                  <p>{voucher.description}</p>
                </div>
                <span className="voucher-list-chip">#{index + 1}</span>
              </div>

              <div className="voucher-list-bottom">
                <div className="voucher-list-expiry">
                  <span>Expiry</span>
                  <strong>{voucher.expiry}</strong>
                </div>
                <button className="voucher-list-cta">{voucher.cta}</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function MissionsTasksCard() {
  const tasks = [
    {
      icon: <ShoppingBag size={16} />,
      title: 'Place 1 order',
      reward: '30K xu',
      progress: 70,
    },
    {
      icon: <UserPlus size={16} />,
      title: 'Invite 1 friend',
      reward: '50K voucher',
      progress: 40,
    },
    {
      icon: <CalendarCheck2 size={16} />,
      title: 'Check-in 3 days',
      reward: 'Secret gift',
      progress: 85,
    },
  ];

  return (
    <div className="missions-card">
      <div className="missions-head">
        <div>
          <div className="section-label">Missions & tasks</div>
          <h3 className="missions-title">Hoàn thành nhiệm vụ, nhận quà</h3>
        </div>
        <div className="missions-badge">
          <CircleDollarSign size={14} />
          Rewards
        </div>
      </div>

      <div className="missions-list">
        {tasks.map((task) => (
          <article key={task.title} className="mission-task">
            <div className="mission-icon">{task.icon}</div>
            <div className="mission-copy">
              <div className="mission-row">
                <strong>{task.title}</strong>
                <span className="mission-reward">{task.reward}</span>
              </div>
              <div className="mission-progress">
                <div className="mission-progress-track">
                  <div className="mission-progress-fill" style={{ width: `${task.progress}%` }} />
                </div>
                <span className="mission-progress-label">{task.progress}%</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ReferralRewardBanner() {
  return (
    <div className="referral-banner-card">
      <div className="referral-copy">
        <div className="section-label referral-label">Referral reward</div>
        <h3>Mời bạn bè, nhận thêm ưu đãi</h3>
        <ul className="referral-list">
          <li>Nhận 25K voucher cho đơn đầu tiên</li>
        </ul>
            <img src="/image/referral.jpg" alt="Referral" className="referral-image illus-blend" style={{ width: '100%', height: 'auto' }} />
        <button className="referral-cta-button">Mời ngay</button>
      </div>

      <div className="referral-visual" aria-hidden>
        <div className="referral-illustration">
          <div className="referral-person left">
            <span className="referral-head" />
            <span className="referral-body" />
          </div>
          <div className="referral-person right">
            <span className="referral-head" />
            <span className="referral-body" />
          </div>
          <div className="referral-highfive" />
          <div className="referral-spark referral-spark-a" />
          <div className="referral-spark referral-spark-b" />
        </div>
      </div>
    </div>
  );
}
