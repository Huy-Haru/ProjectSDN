import { useState } from 'react';
import { bookingApi, memberApi, progressApi } from '../api/apiClient';
import { useApiResource } from '../hooks/useApiResource';
const load = async () => {
  const [bookings,subscriptions,progress] = await Promise.all([bookingApi.bookings(),memberApi.subscriptions(),progressApi.mine()]);
  return {bookings:bookings.data.bookings,subscriptions:subscriptions.data.subscriptions,logs:progress.data.logs};
};
export default function StudentDashboardPage({user,onNavigate}) {
  const {data,loading,error,reload} = useApiResource(load,'member-dashboard');
  const [now] = useState(()=>new Date());
  if(loading) return <p role="status">Đang tải tổng quan...</p>;
  if(error) return <div role="alert">{error} <button onClick={reload}>Thử lại</button></div>;
  const active=data.subscriptions.filter(s=>s.status==='active' && s.paymentStatus==='paid' && new Date(s.startDate)<=now && new Date(s.endDate)>now);
  const upcoming=data.bookings.filter(b=>b.status==='booked' && new Date(`${b.date.slice(0,10)}T${b.startTime}:00+07:00`)>now).sort((a,b)=>(a.date+a.startTime).localeCompare(b.date+b.startTime));
  const latest=data.logs[0];
  return <section><h2>Tổng quan hội viên</h2><p>Xin chào {user?.fullName}.</p>
    <div className="row g-3 mb-4">
      {[['Gói đang có hiệu lực',active.length],['Buổi tập sắp tới',upcoming.length],['Buổi đã hoàn thành',data.bookings.filter(b=>b.status==='completed').length]].map(([label,value])=><div className="col-md-4" key={label}><article className="border rounded-3 p-4"><h3>{label}</h3><strong>{value}</strong></article></div>)}
    </div>
    <h3>Buổi tập tiếp theo</h3>{upcoming.length ? <p>{upcoming[0].date.slice(0,10)} {upcoming[0].startTime} (giờ Việt Nam) · {upcoming[0].trainer?.user?.fullName || 'PT'}</p> : <p>Chưa có lịch tập sắp tới.</p>}
    <button className="btn btn-success me-2 mb-3" onClick={()=>onNavigate('booking')}>Đặt lịch PT</button>
    <button className="btn btn-secondary mb-3" onClick={()=>onNavigate('schedule')}>Xem lịch tập</button>
    <h3>Thể trạng ghi nhận gần nhất</h3>{latest ? <p>{new Date(latest.date).toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})} · Cân nặng: {latest.weight ?? '—'} kg · Tỷ lệ mỡ: {latest.bodyFat ?? '—'}%</p> : <p>PT chưa ghi nhận thể trạng của bạn.</p>}
    <button className="btn btn-secondary" onClick={()=>onNavigate('progress')}>Xem tiến độ và giáo án</button>
  </section>;
}
