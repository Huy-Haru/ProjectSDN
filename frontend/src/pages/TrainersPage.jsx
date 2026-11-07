import { useMemo, useState } from 'react';
import { bookingApi } from '../api/apiClient';
import { useApiResource } from '../hooks/useApiResource';
import { PageIntro } from '../components/DashboardPrimitives';
import { FaAward, FaCalendarCheck, FaDumbbell, FaExternalLinkAlt, FaStar, FaTimes } from 'react-icons/fa';
const load = () => bookingApi.trainers().then(r => r.data.trainers);
export default function TrainersPage({ onSelectPtForBooking }) {
  const {data, loading, error, reload} = useApiResource(load, 'active-trainers');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const filtered = useMemo(() => data.filter(t => `${t.user?.fullName} ${t.specialties.join(' ')} ${t.bio || ''}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))), [data, search]);
  const initials = name => (name || 'PT').split(' ').map(part => part[0]).slice(-2).join('').toUpperCase();
  return <section className="dashboard-page"><PageIntro eyebrow="TRAINER DIRECTORY" title="Tìm HLV phù hợp" description="Lọc theo chuyên môn và đặt một buổi tập theo mục tiêu của bạn." />
    <label className="field-label" htmlFor="trainer-search">Tìm PT hoặc chuyên môn</label><input id="trainer-search" className="form-control form-control-dark mb-3" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ví dụ: giảm mỡ, yoga, bodybuilding" />
    {loading && <p role="status">Đang tải huấn luyện viên...</p>}
    {error && <div role="alert">{error} <button onClick={reload}>Thử lại</button></div>}
    {!loading && !error && !filtered.length && <p>Không có PT phù hợp.</p>}
    <div className="trainer-directory-grid">{filtered.map(t=><article className="trainer-directory-card" key={t._id}>
      <div className="trainer-card-cover"><span className="trainer-card-kicker">FITMANAGER COACH</span><div className="trainer-card-avatar">{t.user?.avatar ? <img src={t.user.avatar} alt="" onError={e => { e.currentTarget.style.display='none'; }} /> : <span>{initials(t.user?.fullName)}</span>}</div><span className="trainer-active-pill"><span /> Đang nhận lịch</span></div>
      <div className="trainer-card-body"><div className="trainer-card-heading"><div><h3>{t.user?.fullName}</h3><p>{t.experienceYears || 0} năm kinh nghiệm · {t.pricePerSession?.toLocaleString('vi-VN')} ₫/buổi</p></div><div className="trainer-rating"><FaStar /><strong>{t.ratingAverage ? t.ratingAverage.toFixed(1) : 'Mới'}</strong><small>{t.ratingCount || 0} đánh giá</small></div></div><div className="trainer-specialties">{(t.specialties || []).slice(0, 4).map(s => <span key={s}>{s}</span>)}</div><p className="trainer-card-bio">{t.bio || 'Sẵn sàng đồng hành cùng mục tiêu tập luyện của bạn.'}</p><div className="trainer-card-actions"><button className="btn btn-success" onClick={()=>onSelectPtForBooking(t._id)}><FaCalendarCheck /> Đặt lịch</button><button className="btn btn-ghost" onClick={() => setSelected(t)}>Xem hồ sơ <FaExternalLinkAlt /></button></div></div>
    </article>)}</div>
    {selected && <div className="trainer-detail-backdrop" role="presentation" onClick={() => setSelected(null)}><article className="trainer-detail-modal" role="dialog" aria-modal="true" aria-label={`Hồ sơ ${selected.user?.fullName}`} onClick={e => e.stopPropagation()}><button className="trainer-detail-close" onClick={() => setSelected(null)} aria-label="Đóng"><FaTimes /></button><div className="trainer-detail-hero"><div className="trainer-detail-avatar">{selected.user?.avatar ? <img src={selected.user.avatar} alt={selected.user.fullName} /> : initials(selected.user?.fullName)}</div><div><span className="eyebrow">HUẤN LUYỆN VIÊN</span><h2>{selected.user?.fullName}</h2><p>{selected.bio || 'Huấn luyện cá nhân hóa theo mục tiêu của bạn.'}</p></div></div><div className="trainer-detail-stats"><div><FaAward /><strong>{selected.experienceYears || 0}+</strong><small>Năm kinh nghiệm</small></div><div><FaStar /><strong>{selected.ratingAverage ? selected.ratingAverage.toFixed(1) : 'Mới'}</strong><small>{selected.ratingCount || 0} đánh giá</small></div><div><FaDumbbell /><strong>{selected.specialties?.length || 0}</strong><small>Chuyên môn</small></div></div><div className="trainer-detail-section"><h3>Chuyên môn & chứng chỉ</h3><div className="trainer-specialties">{(selected.specialties || []).map(s => <span key={s}>{s}</span>)}{(selected.certificates || []).map(c => <span key={c}><FaAward /> {c}</span>)}</div></div><button className="btn btn-success btn-lg w-100" onClick={() => onSelectPtForBooking(selected._id)}>Đặt lịch với {selected.user?.fullName}</button></article></div>}
  </section>;
}
