import React, { useState } from 'react';
import { FaCalendarCheck, FaUserFriends, FaStar, FaDollarSign, FaCheckCircle, FaCommentMedical, FaClock } from 'react-icons/fa';
import { initialSchedules } from '../data/mockData';

const TrainerDashboardPage = ({ user }) => {
  const [trainerSchedules, setTrainerSchedules] = useState(initialSchedules);

  const handleComplete = (id) => {
    setTrainerSchedules(prev => prev.map(s => s.id === id ? { ...s, status: 'Đã dạy xong' } : s));
  };

  return (
    <div className="trainer-dashboard-page">
      {/* Banner */}
      <div 
        className="p-4 rounded-4 mb-4 position-relative overflow-hidden" 
        style={{ background: 'linear-gradient(135deg, #0f241e 0%, #0f172a 100%)', border: '1px solid #00E676' }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <span className="badge px-3 py-1.5 mb-2" style={{ background: '#00E676', color: '#080D16', fontWeight: 800 }}>
              PORTAL HUẤN LUYỆN VIÊN (PT)
            </span>
            <h2 className="text-white fw-bold display-6 mb-1">
              Xin chào, <span style={{ color: '#00E676' }}>{user.name}</span>! 🏋️‍♂️
            </h2>
            <p className="text-muted mb-0">
              Bạn có <strong className="text-white">2 buổi dạy 1:1</strong> được đăng ký cho ngày hôm nay.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge p-2.5 rounded-3 fs-6" style={{ background: 'rgba(255,193,7,0.15)', color: '#FFC107' }}>
              <FaStar className="me-1" /> 4.9 Rating (128 Đánh giá)
            </span>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted style-sm fw-bold">BUỔI DẠY HÔM NAY</span>
              <FaCalendarCheck style={{ color: '#00E676', fontSize: '1.2rem' }} />
            </div>
            <div className="fs-2 fw-bold text-white mb-1">2 Buổi</div>
            <div style={{ fontSize: '0.78rem', color: '#00E676' }}>Khung giờ: 09:00 & 14:00</div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted style-sm fw-bold">HỌC VIÊN ĐANG KÈM</span>
              <FaUserFriends style={{ color: '#3B82F6', fontSize: '1.2rem' }} />
            </div>
            <div className="fs-2 fw-bold text-white mb-1">18 Học viên</div>
            <div style={{ fontSize: '0.78rem', color: '#3B82F6' }}>12 Học viên đăng ký PT năm</div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted style-sm fw-bold">TỔNG BUỔI DẠY THÁNG</span>
              <FaClock style={{ color: '#A855F7', fontSize: '1.2rem' }} />
            </div>
            <div className="fs-2 fw-bold text-white mb-1">48 Buổi</div>
            <div style={{ fontSize: '0.78rem', color: '#A855F7' }}>Đạt 105% KPI chỉ tiêu tháng</div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted style-sm fw-bold">THÙ LAO TẠM TÍNH</span>
              <FaDollarSign style={{ color: '#FFC107', fontSize: '1.2rem' }} />
            </div>
            <div className="fs-2 fw-bold text-white mb-1">32.400.000 đ</div>
            <div style={{ fontSize: '0.78rem', color: '#FFC107' }}>+ Hoa hồng bán gói tập</div>
          </div>
        </div>
      </div>

      {/* Teaching Schedule Management Table */}
      <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-white fw-bold mb-0">Quản Lý Lịch Dạy Học Viên 1:1</h5>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Cập nhật lần cuối: Hôm nay</span>
        </div>

        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>HỌC VIÊN</th>
                <th>SỐ ĐIỆN THOẠI</th>
                <th>NGÀY & GIỜ DẠY</th>
                <th>NỘI DUNG BUỔI TẬP</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC HLV</th>
              </tr>
            </thead>
            <tbody>
              {trainerSchedules.map((sch) => (
                <tr key={sch.id}>
                  <td className="fw-bold text-white">{sch.studentName}</td>
                  <td>{sch.studentPhone || '0987654321'}</td>
                  <td>
                    <span style={{ color: '#00E676', fontWeight: 600 }}>{sch.date}</span> ({sch.time})
                  </td>
                  <td>{sch.workoutType}</td>
                  <td>
                    <span className={`badge px-2.5 py-1 ${sch.status === 'Đã dạy xong' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {sch.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center">
                      {sch.status !== 'Đã dạy xong' && (
                        <button 
                          className="btn-card-action btn-green px-2.5 py-1" 
                          style={{ fontSize: '0.75rem', width: 'auto' }}
                          onClick={() => handleComplete(sch.id)}
                        >
                          <FaCheckCircle className="me-1" /> Đã dạy xong
                        </button>
                      )}
                      <button 
                        className="btn-card-action px-2.5 py-1" 
                        style={{ fontSize: '0.75rem', width: 'auto', background: '#1E293B' }}
                      >
                        <FaCommentMedical className="me-1" /> Note thể trạng
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboardPage;
