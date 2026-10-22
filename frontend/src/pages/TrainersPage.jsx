import { useState } from 'react';
import { bookingApi } from '../api/apiClient';
import { useApiResource } from '../hooks/useApiResource';
const load = () => bookingApi.trainers().then(r => r.data.trainers);
export default function TrainersPage({ onSelectPtForBooking }) {
  const {data, loading, error, reload} = useApiResource(load, 'active-trainers');
  const [search, setSearch] = useState('');
  const filtered = data.filter(t => `${t.user?.fullName} ${t.specialties.join(' ')}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')));
  return <section><h2>Huấn luyện viên</h2>
    <label htmlFor="trainer-search">Tìm PT hoặc chuyên môn</label><input id="trainer-search" className="form-control mb-3" value={search} onChange={e=>setSearch(e.target.value)} />
    {loading && <p role="status">Đang tải huấn luyện viên...</p>}
    {error && <div role="alert">{error} <button onClick={reload}>Thử lại</button></div>}
    {!loading && !error && !filtered.length && <p>Không có PT phù hợp.</p>}
    <div className="row g-3">{filtered.map(t=><div className="col-md-6" key={t._id}><article className="border rounded-3 p-4 h-100">
      <h3>{t.user?.fullName}</h3><p>{t.specialties.join(', ') || 'Chưa cập nhật chuyên môn'}</p><p>{t.bio}</p>
      <p>{t.ratingCount ? `${t.ratingAverage}/5 sao · ${t.ratingCount} đánh giá` : 'Chưa có đánh giá'}</p>
      <button className="btn btn-success" onClick={()=>onSelectPtForBooking(t._id)}>Đặt lịch với PT này</button>
    </article></div>)}</div>
  </section>;
}
