import React from 'react';
import { FaCalendarPlus, FaWeight, FaChevronRight } from 'react-icons/fa';

const StudentDashboardPage = ({ user, schedules, progress, myPackage, onNavigate }) => {
  const upcomingSchedules = schedules.filter(s => s.status === 'Sắp diễn ra');

  return (
    <div className="student-dashboard-page">
      {/* Welcome Banner */}
      <div 
        className="p-4 rounded-4 mb-4 position-relative overflow-hidden" 
        style={{ background: 'linear-gradient(135deg, #111e2e 0%, #0f172a 100%)', border: '1px solid #1E293B' }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <span className="section-tag mb-1 d-block">TỔNG QUAN HỌC VIÊN</span>
            <h2 className="text-white fw-bold display-6 mb-1">
              Chào mừng trở lại, <span style={{ color: '#00E676' }}>{user.name}</span>! 👋
            </h2>
            <p className="text-muted mb-0">
              Bạn có <strong className="text-white">{upcomingSchedules.length} buổi tập</strong> sắp diễn ra trong tuần này. Hãy duy trì thói quen nhé!
            </p>
          </div>

          <div className="d-flex gap-2">
            <button 
              className="btn-card-action btn-green d-flex align-items-center gap-2 py-2 px-3"
              style={{ width: 'auto', fontSize: '0.85rem' }}
              onClick={() => onNavigate('booking')}
            >
              <FaCalendarPlus /> Đặt Lịch PT Ngay
            </button>
            <button 
              className="btn-card-action d-flex align-items-center gap-2 py-2 px-3"
              style={{ width: 'auto', fontSize: '0.85rem' }}
              onClick={() => onNavigate('progress')}
            >
              <FaWeight /> Ghi Cân Nặng
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="p-3.5 rounded-4 cursor-pointer" style={{ background: '#0F172A', border: '1px solid #1E293B' }} onClick={() => onNavigate('my-packages')}>
            <div className="text-muted style-sm mb-1">GÓI TẬP HIỆN TẠI</div>
            <div className="fw-bold text-white fs-6 mb-1">{myPackage.packageName}</div>
            <div style={{ color: '#00E676', fontSize: '0.78rem', fontWeight: 700 }}>
              Còn {myPackage.daysRemaining} ngày sử dụng →
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="p-3.5 rounded-4 cursor-pointer" style={{ background: '#0F172A', border: '1px solid #1E293B' }} onClick={() => onNavigate('schedule')}>
            <div className="text-muted style-sm mb-1">LỊCH TẬP SẮP TỚI</div>
            <div className="fw-bold text-white fs-6 mb-1">{upcomingSchedules.length} Buổi Đang Chờ</div>
            <div className="text-info style-sm fw-bold">
              Buổi gần nhất: {upcomingSchedules[0] ? upcomingSchedules[0].date : 'Chưa có'} →
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="p-3.5 rounded-4 cursor-pointer" style={{ background: '#0F172A', border: '1px solid #1E293B' }} onClick={() => onNavigate('progress')}>
            <div className="text-muted style-sm mb-1">CÂN NẶNG HỌC VIÊN</div>
            <div className="fw-bold text-white fs-6 mb-1">{progress.currentWeight} kg</div>
            <div style={{ color: '#00E676', fontSize: '0.78rem', fontWeight: 700 }}>
              Đã giảm {(progress.startWeight - progress.currentWeight).toFixed(1)} kg →
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="p-3.5 rounded-4 cursor-pointer" style={{ background: '#0F172A', border: '1px solid #1E293B' }} onClick={() => onNavigate('trainers')}>
            <div className="text-muted style-sm mb-1">HUẤN LUYỆN VIÊN (PT)</div>
            <div className="fw-bold text-white fs-6 mb-1">HLV. Trần Minh Đức</div>
            <div className="text-warning style-sm fw-bold">
              ★ 4.9 Rating →
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions List */}
      <div className="p-4 rounded-4 mb-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-white fw-bold mb-0">Lịch Tập Sắp Diễn Ra Nhất</h5>
          <button 
            className="btn btn-link p-0 text-decoration-none" 
            style={{ color: '#00E676', fontSize: '0.85rem', fontWeight: 700 }}
            onClick={() => onNavigate('schedule')}
          >
            Xem tất cả lịch tập <FaChevronRight className="ms-1" />
          </button>
        </div>

        {upcomingSchedules.length === 0 ? (
          <div className="text-center py-4 text-muted">Chưa có buổi tập nào được lên lịch.</div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {upcomingSchedules.slice(0, 2).map((sch) => (
              <div key={sch.id} className="p-3 rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1E293B' }}>
                <div className="d-flex align-items-center gap-3">
                  <img src={sch.trainerAvatar} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00E676' }} />
                  <div>
                    <h6 className="text-white fw-bold mb-1">{sch.workoutType}</h6>
                    <div className="text-muted small">
                      <strong style={{ color: '#00E676' }}>{sch.trainerName}</strong> • {sch.date} ({sch.time})
                    </div>
                  </div>
                </div>

                <button 
                  className="btn-card-action btn-green px-3 py-1.5"
                  style={{ width: 'auto', fontSize: '0.8rem' }}
                  onClick={() => onNavigate('schedule')}
                >
                  Chi tiết
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboardPage;
