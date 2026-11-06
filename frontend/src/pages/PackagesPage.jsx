import { useState } from 'react';
import { memberApi } from '../api/apiClient';
import { useApiResource } from '../hooks/useApiResource';
import { PageIntro } from '../components/DashboardPrimitives';
import { FaCheckCircle, FaCrown } from 'react-icons/fa';
const load = () => memberApi.packages().then(r => r.data.packages);
const money = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
export default function PackagesPage({ user, onLogin, onRegistered }) {
  const { data, loading, error, reload } = useApiResource(load, 'packages');
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState('');
  const [today] = useState(() => new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10));
  async function submit(e) {
    e.preventDefault(); setSaving(true); setFailure('');
    try { await memberApi.subscribe(selected._id, date || today); onRegistered(); }
    catch (err) { setFailure(err.message); }
    finally { setSaving(false); }
  }
  return <section className="dashboard-page">
    <PageIntro eyebrow="MEMBERSHIP" title="Chọn nhịp tập phù hợp" description="Đăng ký gói theo tháng, quý hoặc năm. Thanh toán tại quầy để Admin xác nhận kích hoạt." />
    {loading && <p role="status">Đang tải gói tập...</p>}
    {error && <div role="alert">{error} <button onClick={reload}>Thử lại</button></div>}
    {!loading && !error && !data.length && <p>Chưa có gói tập đang mở đăng ký.</p>}
    <div className="pricing-grid">{data.map((pkg, index) => <article className={`pricing-card ${index === 1 ? 'featured' : ''}`} key={pkg._id}>
        {index === 1 && <div className="popular-badge"><FaCrown className="me-1" /> ĐƯỢC CHỌN NHIỀU</div>}
        <div><div className="card-category">FITMANAGER {index + 1}</div><h3 className="card-title">{pkg.name}</h3><p className="card-description">{pkg.description || 'Quyền sử dụng thiết bị và không gian tập luyện.'}</p><div className="card-price-box"><strong className="card-price">{money(pkg.price)}</strong><span className="card-price-period">/ gói</span></div><p className="card-price-note">Hiệu lực {pkg.durationDays} ngày</p><div className="divider" /><ul className="feature-list"><li className="feature-item"><FaCheckCircle className="check-icon" />{pkg.includesPT ? 'Có PT đồng hành' : 'Tự do sử dụng thiết bị'}</li><li className="feature-item"><FaCheckCircle className="check-icon" />{pkg.sessionLimit == null ? 'Không giới hạn buổi' : `${pkg.sessionLimit} buổi trong gói`}</li><li className="feature-item"><FaCheckCircle className="check-icon" />Hỗ trợ check in bằng QR</li></ul></div>
        <button className={`btn-card-action ${index === 1 ? 'btn-green' : ''}`} disabled={saving} onClick={() => {
          if (!user) { onLogin(); return; }
          setSelected(pkg); setDate(today); setFailure('');
        }}>Đăng ký gói này</button>
      </article>)}</div>
    {selected && <form className="section-card" onSubmit={submit}>
      <h3>Xác nhận đăng ký {selected.name}</h3>
      <p>Số tiền: {money(selected.price)}. Gói sẽ chờ xác nhận thanh toán.</p>
      <label htmlFor="subscription-date">Ngày bắt đầu</label>
      <input id="subscription-date" className="form-control mb-3" type="date" required min={today} value={date} disabled={saving} onChange={e => setDate(e.target.value)} />
      {failure && <p role="alert">{failure}</p>}
      <button className="btn btn-success me-2" disabled={saving}>{saving ? 'Đang gửi...' : 'Gửi đăng ký'}</button>
      <button className="btn btn-secondary" type="button" disabled={saving} onClick={() => setSelected(null)}>Hủy</button>
    </form>}
  </section>;
}
