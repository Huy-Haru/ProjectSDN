import { useState } from 'react';
import { trainerApi, reviewApi } from '../api/apiClient';
import { useApiResource } from '../hooks/useApiResource';
const load=async()=>{
  const [schedule,members,reviews]=await Promise.all([trainerApi.getSchedule(),trainerApi.getMembers(),reviewApi.forTrainer()]);
  return {bookings:schedule.data.bookings,members:members.data.members,summary:reviews.data.summary};
};
export default function TrainerDashboardPage({user}) {
  const {data,loading,error,reload}=useApiResource(load,'trainer-dashboard');
  const [now]=useState(()=>new Date());
  if(loading) return <p role="status">Đang tải tổng quan PT...</p>;
  if(error) return <div role="alert">{error} <button onClick={reload}>Thử lại</button></div>;
  const upcoming=data.bookings.filter(b=>b.status==='booked' && new Date(`${b.date.slice(0,10)}T${b.startTime}:00+07:00`)>now).sort((a,b)=>(a.date+a.startTime).localeCompare(b.date+b.startTime));
  return <section><h2>Tổng quan PT</h2><p>Xin chào {user?.fullName}.</p>
    <div className="row g-3 mb-4">{[['Học viên từng đặt lịch',data.members.length],['Buổi sắp dạy',upcoming.length],['Buổi đã hoàn thành',data.bookings.filter(b=>b.status==='completed').length]].map(([label,value])=><div className="col-md-4" key={label}><article className="border rounded-3 p-4"><h3>{label}</h3><strong>{value}</strong></article></div>)}</div>
    <h3>Đánh giá của học viên</h3><p>{data.summary.count ? `${data.summary.average}/5 sao · ${data.summary.count} đánh giá` : 'Chưa có đánh giá.'}</p>
    <h3>Lịch dạy sắp tới</h3>{!upcoming.length && <p>Chưa có lịch dạy sắp tới.</p>}
    {upcoming.slice(0,5).map(b=><article className="border rounded-3 p-3 mb-3" key={b._id}><strong>{b.member?.fullName || 'Hội viên'}</strong><p>{b.date.slice(0,10)} · {b.startTime}–{b.endTime} (giờ Việt Nam)</p></article>)}
  </section>;
}
