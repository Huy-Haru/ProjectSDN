import { useState } from 'react';
import { bookingApi, memberApi, progressApi } from '../api/apiClient';
import { useApiResource } from '../hooks/useApiResource';
import { CheckInWallet, LinkButton, PageIntro, SectionCard, StatCard } from '../components/DashboardPrimitives';
import { FaCalendarCheck, FaDumbbell, FaHeartbeat } from 'react-icons/fa';
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
  return <section className="dashboard-page"><PageIntro eyebrow="MEMBER PORTAL" title={`Chào ${user?.fullName || 'bạn'} 👋`} description="Theo dõi gói tập, lịch PT và tiến độ của bạn trong một nơi." action={<button className="btn btn-success" onClick={()=>onNavigate('booking')}>Đặt lịch PT</button>} />
    <div className="stats-grid">{[["Gói đang hiệu lực",active.length,"Đang sẵn sàng",<FaDumbbell/>],["Buổi sắp tới",upcoming.length,"Theo lịch của bạn",<FaCalendarCheck/>],["Buổi đã hoàn thành",data.bookings.filter(b=>b.status==='completed').length,"Tiếp tục bền bỉ",<FaHeartbeat/>]].map(([label,value,detail,icon])=><StatCard key={label} label={label} value={value} detail={detail} icon={icon}/>)}</div>
    <div className="dashboard-columns"><SectionCard title="Buổi tập tiếp theo" description="Lịch hẹn gần nhất của bạn" action={<LinkButton onClick={()=>onNavigate('schedule')}>Xem lịch</LinkButton>}>
      {upcoming.length ? <div className="next-session"><div className="date-tile"><strong>{new Date(`${upcoming[0].date.slice(0,10)}T00:00:00+07:00`).toLocaleDateString('vi-VN',{day:'2-digit'})}</strong><span>{new Date(`${upcoming[0].date.slice(0,10)}T00:00:00+07:00`).toLocaleDateString('vi-VN',{month:'short',timeZone:'Asia/Ho_Chi_Minh'})}</span></div><div><h3>{upcoming[0].trainer?.user?.fullName || 'Huấn luyện viên'}</h3><p>{upcoming[0].startTime}–{upcoming[0].endTime} · {upcoming[0].date.slice(0,10)}</p><span className="status-pill status-pill-success">Đã đặt lịch</span></div></div> : <p className="muted-copy">Chưa có lịch tập sắp tới.</p>}
    </SectionCard><CheckInWallet user={user}/></div>
    <SectionCard title="Thể trạng gần nhất" description="Dữ liệu do PT ghi nhận trong buổi tập gần đây.">{latest ? <div className="progress-highlight"><strong>{latest.weight ?? '—'} <small>kg</small></strong><span>Cân nặng · {latest.bodyFat ?? '—'}% mỡ cơ thể</span><LinkButton onClick={()=>onNavigate('progress')}>Xem tiến độ</LinkButton></div> : <p className="muted-copy">PT chưa ghi nhận thể trạng của bạn. Đặt một buổi tập để bắt đầu.</p>}</SectionCard>
  </section>;
}
