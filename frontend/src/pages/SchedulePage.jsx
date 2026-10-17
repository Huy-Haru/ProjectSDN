import React, { useState } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const SchedulePage = ({ schedules, onCancelSchedule, onCompleteSchedule }) => {
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  const filteredSchedules = schedules.filter(sch => {
    if (filterStatus === 'Tất cả') return true;
    return sch.status === filterStatus;
  });

  return (
    <div className="schedule-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="section-tag">LỊCH TẬP CÁ NHÂN</span>
          <h2 className="section-header-title">Danh sách Các Buổi Tập Đã Xếp Lịch</h2>
          <p className="text-muted mb-0">Theo dõi thời gian, nội dung bài tập và huấn luyện viên đồng hành.</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="billing-toggle-container m-0">
          {['Tất cả', 'Sắp diễn ra', 'Hoàn thành'].map(st => (
            <button
              key={st}
              className={`toggle-btn ${filterStatus === st ? 'active' : ''}`}
              onClick={() => setFilterStatus(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {filteredSchedules.length === 0 ? (
        <div className="text-center py-5 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
          <FaCalendarAlt className="fs-1 text-muted mb-3" />
          <h5 className="text-white">Không tìm thấy buổi tập nào</h5>
          <p className="text-muted">Bạn chưa có lịch tập nào trong trạng thái "{filterStatus}".</p>
        </div>
      ) : (
        <div className="d-flex flex-direction-column flex-column gap-3">
          {filteredSchedules.map((sch) => (
            <div 
              key={sch.id}
              className="p-4 rounded-4 d-flex align-items-center justify-content-between flex-wrap gap-3"
              style={{ 
                background: '#0F172A', 
                border: '1px solid #1E293B',
                borderLeft: sch.status === 'Sắp diễn ra' ? '4px solid #00E676' : '4px solid #64748B'
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <img 
                  src={sch.trainerAvatar} 
                  alt={sch.trainerName} 
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00E676' }} 
                />
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span 
                      className={`badge px-2.5 py-1 ${sch.status === 'Sắp diễn ra' ? 'bg-success' : 'bg-secondary'}`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {sch.status}
                    </span>
                    <h5 className="text-white fw-bold mb-0 fs-6">{sch.workoutType}</h5>
                  </div>
                  
                  <div className="text-muted d-flex align-items-center gap-3 flex-wrap" style={{ fontSize: '0.82rem' }}>
                    <span style={{ color: '#00E676', fontWeight: 600 }}>{sch.trainerName}</span>
                    <span>•</span>
                    <span><FaCalendarAlt className="me-1" /> {sch.date}</span>
                    <span>•</span>
                    <span><FaClock className="me-1" /> {sch.time}</span>
                  </div>

                  <div className="text-secondary mt-1" style={{ fontSize: '0.78rem' }}>
                    <FaMapMarkerAlt className="me-1 text-danger" /> {sch.location} {sch.note ? `| Note: ${sch.note}` : ''}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex align-items-center gap-2">
                {sch.status === 'Sắp diễn ra' && (
                  <>
                    <button 
                      className="btn-card-action btn-green px-3 py-2"
                      style={{ fontSize: '0.82rem', width: 'auto' }}
                      onClick={() => onCompleteSchedule(sch.id)}
                    >
                      <FaCheckCircle className="me-1" /> Hoàn thành
                    </button>
                    <button 
                      className="btn-card-action px-3 py-2 text-danger border-danger"
                      style={{ fontSize: '0.82rem', width: 'auto', background: 'transparent' }}
                      onClick={() => onCancelSchedule(sch.id)}
                    >
                      <FaTimesCircle className="me-1" /> Hủy lịch
                    </button>
                  </>
                )}
                {sch.status === 'Hoàn thành' && (
                  <span className="text-success fw-bold" style={{ fontSize: '0.85rem' }}>
                    ✓ Đã tập xong
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
