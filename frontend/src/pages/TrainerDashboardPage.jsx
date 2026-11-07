import { useState } from 'react';
import { trainerApi, reviewApi } from '../api/apiClient';
import { useApiResource } from '../hooks/useApiResource';
import { LinkButton, SectionCard, StatCard } from '../components/DashboardPrimitives';
import { FaCalendarCheck, FaDumbbell, FaStar, FaUsers } from 'react-icons/fa';
const load=async()=>{
  const [schedule,members,reviews]=await Promise.all([trainerApi.getSchedule(),trainerApi.getMembers({limit:1}),reviewApi.forTrainer()]);
  return {bookings:schedule.data.bookings,memberCount:members.data.total,summary:reviews.data.summary};
};
export default function TrainerDashboardPage({user}) {
  const {data,loading,error,reload}=useApiResource(load,'trainer-dashboard');
  const [now]=useState(()=>new Date());
  if(loading) return <p role="status">Đang tải tổng quan PT...</p>;
  if(error) return <div role="alert">{error} <button onClick={reload}>Thử lại</button></div>;
  const upcoming=data.bookings.filter(b=>b.status==='booked' && new Date(`${b.date.slice(0,10)}T${b.startTime}:00+07:00`)>now).sort((a,b)=>(a.date+a.startTime).localeCompare(b.date+b.startTime));
  return <section className="dashboard-page"><div className="role-hero role-hero-trainer"><div><span className="eyebrow">TRAINER PORTAL</span><h1>Chào HLV {user?.fullName || ''}</h1><p>Quản lý lịch dạy, học viên và chương trình huấn luyện theo từng mục tiêu.</p></div><div className="role-hero-orbit"><FaDumbbell /></div></div>
    <div className="stats-grid">{[["Học viên",data.memberCount,"Có lịch sử tập",<FaUsers/>],["Buổi sắp dạy",upcoming.length,"Trong lịch sắp tới",<FaCalendarCheck/>],["Đánh giá",data.summary.count ? `${data.summary.average}/5` : '—',`${data.summary.count || 0} phản hồi`,<FaStar/>]].map(([label,value,detail,icon])=><StatCard key={label} label={label} value={value} detail={detail} icon={icon} tone={label==='Đánh giá'?'purple':'green'}/>)}</div>
    <SectionCard title="Lịch dạy sắp tới" description="Các buổi đã được hội viên đặt" action={<LinkButton>Quản lý lịch</LinkButton>}><div className="session-list">{!upcoming.length && <p className="muted-copy">Chưa có lịch dạy sắp tới.</p>}{upcoming.slice(0,5).map(b=><div className="session-row" key={b._id}><div className="avatar-token">{(b.member?.fullName || 'HV').slice(0,1)}</div><div className="session-main"><strong>{b.member?.fullName || 'Hội viên'}</strong><span>{b.date.slice(0,10)} · {b.startTime}–{b.endTime}</span></div><span className="status-pill status-pill-success">Đã đặt</span></div>)}</div></SectionCard>
  </section>;
}
