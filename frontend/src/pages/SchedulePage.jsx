import { useState } from 'react';
import { bookingApi } from '../api/apiClient';
import { useApiResource } from '../hooks/useApiResource';
const load = () => bookingApi.bookings().then(r => r.data.bookings);
const labels = {booked:'Đã đặt',completed:'Hoàn thành',cancelled:'Đã hủy',no_show:'Vắng mặt'};
export default function SchedulePage() {
  const {data, loading, error, reload} = useApiResource(load, 'member-bookings');
  const [busy, setBusy] = useState('');
  const [failure, setFailure] = useState('');
  const [filter, setFilter] = useState('');
  const [confirmId, setConfirmId] = useState('');
  async function cancel(id) {
    setBusy(id); setFailure('');
    try { await bookingApi.cancel(id); setConfirmId(''); reload(); }
    catch (err) { setFailure(err.message); }
    finally { setBusy(''); }
  }
  return <section><h2>Lịch tập của tôi</h2>
    <label htmlFor="member-booking-status">Trạng thái</label><select id="member-booking-status" className="form-select mb-3" value={filter} onChange={e => setFilter(e.target.value)}><option value="">Tất cả</option>{Object.entries(labels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select>
    {loading && <p role="status">Đang tải lịch...</p>}
    {error && <div role="alert">{error} <button onClick={reload}>Thử lại</button></div>}
    {failure && <p role="alert">{failure}</p>}
    {!loading && !error && !data.filter(b => !filter || b.status === filter).length && <p>Chưa có lịch tập phù hợp.</p>}
    {data.filter(b => !filter || b.status === filter).map(b => <article className="border rounded-3 p-4 mb-3" key={b._id}>
      <h3>{b.trainer?.user?.fullName || 'PT không còn trong hệ thống'}</h3><p>{b.date.slice(0,10)} · {b.startTime}–{b.endTime} (giờ Việt Nam)</p>
      <p>{b.subscription?.package?.name} · {labels[b.status]}</p><p>{b.note}</p>
      {b.status === 'booked' && <>{confirmId === b._id ? <div><p>Xác nhận hủy buổi tập này?</p><button className="btn btn-danger me-2" disabled={!!busy} onClick={() => cancel(b._id)}>Xác nhận hủy</button><button className="btn btn-secondary" disabled={!!busy} onClick={() => setConfirmId('')}>Giữ lịch</button></div> : <button className="btn btn-outline-danger" disabled={!!busy} onClick={() => setConfirmId(b._id)}>Hủy lịch</button>}</>}
    </article>)}
  </section>;
}
