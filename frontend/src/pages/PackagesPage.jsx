import { useState } from 'react';
import { memberApi } from '../api/apiClient';
import { useApiResource } from '../hooks/useApiResource';
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
  return <section>
    <h2>Gói tập FitManager</h2>
    <p>Chọn gói và gửi đăng ký. Thanh toán tại quầy để Admin xác nhận kích hoạt.</p>
    {loading && <p role="status">Đang tải gói tập...</p>}
    {error && <div role="alert">{error} <button onClick={reload}>Thử lại</button></div>}
    {!loading && !error && !data.length && <p>Chưa có gói tập đang mở đăng ký.</p>}
    <div className="row g-3">{data.map(pkg => <div className="col-md-4" key={pkg._id}>
      <article className="p-4 border rounded-3 h-100">
        <h3>{pkg.name}</h3><p>{pkg.description}</p><h4>{money(pkg.price)}</h4>
        <p>{pkg.durationDays} ngày · {pkg.includesPT ? 'Có PT' : 'Không kèm PT'}</p>
        <p>Giới hạn: {pkg.sessionLimit == null ? 'Không giới hạn' : `${pkg.sessionLimit} buổi`}</p>
        <button className="btn btn-success" disabled={saving} onClick={() => {
          if (!user) { onLogin(); return; }
          setSelected(pkg); setDate(today); setFailure('');
        }}>Đăng ký {pkg.name}</button>
      </article></div>)}</div>
    {selected && <form className="p-4 border rounded-3 mt-4" onSubmit={submit}>
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
