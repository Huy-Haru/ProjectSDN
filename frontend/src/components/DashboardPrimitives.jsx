import { useEffect, useState } from 'react';
import { FaArrowRight, FaQrcode, FaBolt, FaCheckCircle, FaClock } from 'react-icons/fa';
import { memberApi } from '../api/apiClient';

export function PageIntro({ eyebrow, title, description, action }) {
  return (
    <div className="page-intro">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, detail, icon, tone = 'green' }) {
  return (
    <article className={`stat-card stat-card-${tone}`}>
      <div className="stat-card-top"><span className="stat-label">{label}</span><span className="stat-icon">{icon}</span></div>
      <strong className="stat-number">{value}</strong>
      {detail && <span className="stat-detail">{detail}</span>}
    </article>
  );
}

export function SectionCard({ title, description, action, children, className = '' }) {
  return <section className={`section-card ${className}`}>
    {(title || description || action) && <div className="section-card-head"><div>{title && <h2>{title}</h2>}{description && <p>{description}</p>}</div>{action}</div>}
    {children}
  </section>;
}

export function EmptyState({ title, description, action }) {
  return <div className="empty-state"><div className="empty-state-mark">⌁</div><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export function CheckInWallet({ user }) {
  const [state, setState] = useState({ loading: true, available: false, qrData: null, subscription: null, error: '' });
  useEffect(() => { let active = true; memberApi.checkInQr().then(res => { if (active) setState({ loading: false, ...res.data, error: '' }); }).catch(error => { if (active) setState({ loading: false, available: false, qrData: null, subscription: null, error: error.message }); }); return () => { active = false; }; }, [user?._id]);
  const qrUrl = state.qrData ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(state.qrData)}` : '';
  return <SectionCard className="wallet-card" title="QR check-in hội viên" description="Mã được sinh tự động từ gói đã kích hoạt để quét tại quầy." action={<FaBolt className="text-warning" />}>
    <div className="wallet-layout"><div><span className="stat-label">Trạng thái quyền vào cửa</span><strong className={`wallet-balance ${state.available ? 'wallet-active' : 'wallet-pending'}`}>{state.loading ? 'Đang kiểm tra…' : state.available ? 'Đang hoạt động' : 'Chưa sẵn sàng'}</strong>{state.available ? <p className="muted-copy mt-2"><FaCheckCircle className="text-success me-2" />{state.subscription?.package?.name || 'Gói hội viên'} · hết hạn {new Date(state.subscription.endDate).toLocaleDateString('vi-VN')}</p> : <p className="muted-copy mt-2"><FaClock className="text-warning me-2" />{state.error || 'QR sẽ xuất hiện sau khi Admin kích hoạt gói và xác nhận thanh toán.'}</p>}<div className="wallet-help"><FaQrcode /> Đưa mã cho lễ tân để ghi nhận lượt vào phòng tập.</div></div><div className={`qr-preview ${state.available ? 'is-visible' : ''}`} aria-label={state.available ? 'Mã QR check-in' : 'Chưa có mã QR'}>{state.available ? <><img src={qrUrl} alt="Mã QR check-in hội viên" /><small>Quét để check-in · tự hết hạn theo gói</small></> : <><FaQrcode /><span>Chưa có QR check-in</span></>}</div></div>
  </SectionCard>;
}

export function LinkButton({ children, onClick }) { return <button className="link-button" type="button" onClick={onClick}>{children}<FaArrowRight /></button>; }
