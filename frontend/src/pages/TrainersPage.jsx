import { useState } from 'react';
import { bookingApi } from '../api/apiClient';
import { useApiResource } from '../hooks/useApiResource';
import { PageIntro } from '../components/DashboardPrimitives';
const load = () => bookingApi.trainers().then(r => r.data.trainers);
export default function TrainersPage({ onSelectPtForBooking }) {
  const {data, loading, error, reload} = useApiResource(load, 'active-trainers');
  const [search, setSearch] = useState('');
  const filtered = data.filter(t => `${t.user?.fullName} ${t.specialties.join(' ')}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')));
  return <section className="dashboard-page"><PageIntro eyebrow="TRAINER DIRECTORY" title="Tìm HLV phù hợp" description="Lọc theo chuyên môn và đặt một buổi tập theo mục tiêu của bạn." />
    <label className="field-label" htmlFor="trainer-search">Tìm PT hoặc chuyên môn</label><input id="trainer-search" className="form-control form-control-dark mb-3" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ví dụ: giảm mỡ, yoga, bodybuilding" />
    {loading && <p role="status">Đang tải huấn luyện viên...</p>}
    {error && <div role="alert">{error} <button onClick={reload}>Thử lại</button></div>}
    {!loading && !error && !filtered.length && <p>Không có PT phù hợp.</p>}
    <div className="row g-3">{filtered.map(t=><div className="col-md-6" key={t._id}><article className="section-card h-100">
      <div className="d-flex gap-3 align-items-center mb-3"><div className="avatar-token" style={{width:52,height:52,fontSize:'1.1rem'}}>{(t.user?.fullName || 'PT').slice(0,1)}</div><div><h3 className="mb-1">{t.user?.fullName}</h3><p className="text-success small mb-0">{t.specialties.join(' · ') || 'Chưa cập nhật chuyên môn'}</p></div></div><p className="muted-copy">{t.bio || 'Sẵn sàng đồng hành cùng mục tiêu tập luyện của bạn.'}</p>
      <p className="muted-copy">{t.ratingCount ? `${t.ratingAverage}/5 sao · ${t.ratingCount} đánh giá` : 'Chưa có đánh giá'}</p>
      <button className="btn btn-success" onClick={()=>onSelectPtForBooking(t._id)}>Đặt lịch với PT này</button>
    </article></div>)}</div>
  </section>;
}
