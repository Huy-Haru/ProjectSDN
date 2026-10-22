import { useState } from 'react';
import { bookingApi, memberApi } from '../api/apiClient';
import { useApiResource } from '../hooks/useApiResource';
const load = async () => {
  const [a, b] = await Promise.all([bookingApi.trainers(), memberApi.subscriptions()]);
  return { trainers: a.data.trainers, subscriptions: b.data.subscriptions.filter(s => s.status === 'active' && s.paymentStatus === 'paid' && new Date(s.endDate) > new Date() && (s.includesPT ?? s.package?.includesPT)) };
};
export default function BookingPage({ onBooked }) {
  const { data, loading, error, reload } = useApiResource(load, 'booking-options');
  const [trainerId, setTrainer] = useState('');
  const [subscriptionId, setSubscription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setTime] = useState('09:00');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState('');
  const [today] = useState(() => new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10));
  async function submit(e) {
    e.preventDefault(); setSaving(true); setFailure('');
    try { await bookingApi.create({ trainerId, subscriptionId, date, startTime, note }); onBooked(); }
    catch (err) { setFailure(err.message); }
    finally { setSaving(false); }
  }
  if (loading) return <p role="status">Đang tải thông tin đặt lịch...</p>;
  if (error) return <div role="alert">{error} <button onClick={reload}>Thử lại</button></div>;
  return <section><h2>Đặt lịch PT</h2>
    <p>Mỗi ca kéo dài 60 phút, giờ Việt Nam. Buổi đã đặt, hoàn thành hoặc vắng mặt được tính vào hạn mức; hủy trước giờ bắt đầu sẽ hoàn lại buổi.</p>
    {!data.subscriptions.length ? <p>Bạn cần gói có PT đã thanh toán và còn thời hạn để đặt lịch.</p> : !data.trainers.length ? <p>Chưa có PT đang hoạt động.</p> :
      <form onSubmit={submit} className="border rounded-3 p-4">
        <label htmlFor="booking-subscription">Gói tập</label>
        <select id="booking-subscription" className="form-select mb-3" required disabled={saving} value={subscriptionId} onChange={e => setSubscription(e.target.value)}>
          <option value="">Chọn gói</option>{data.subscriptions.map(s => <option key={s._id} value={s._id}>{s.package?.name} · hạn {new Date(s.endDate).toLocaleDateString('vi-VN', {timeZone:'Asia/Ho_Chi_Minh'})}</option>)}
        </select>
        <label htmlFor="booking-trainer">Huấn luyện viên</label>
        <select id="booking-trainer" className="form-select mb-3" required disabled={saving} value={trainerId} onChange={e => setTrainer(e.target.value)}>
          <option value="">Chọn PT</option>{data.trainers.map(t => <option key={t._id} value={t._id}>{t.user?.fullName} · {t.specialties.join(', ')}</option>)}
        </select>
        <label htmlFor="booking-date">Ngày tập</label><input id="booking-date" className="form-control mb-3" type="date" required min={today} disabled={saving} value={date} onChange={e => setDate(e.target.value)} />
        <label htmlFor="booking-time">Giờ bắt đầu</label><select id="booking-time" className="form-select mb-3" disabled={saving} value={startTime} onChange={e => setTime(e.target.value)}>
          {Array.from({length:14}, (_, i) => String(i+8).padStart(2,'0')+':00').map(t => <option key={t}>{t}</option>)}
        </select>
        <label htmlFor="booking-note">Ghi chú</label><textarea id="booking-note" className="form-control mb-3" maxLength={2000} disabled={saving} value={note} onChange={e => setNote(e.target.value)} />
        {failure && <p role="alert">{failure}</p>}
        <button className="btn btn-success" disabled={saving}>{saving ? 'Đang đặt...' : 'Xác nhận đặt lịch'}</button>
      </form>}
  </section>;
}
