import React, { useState } from 'react';
import { FaCalendarCheck, FaClock, FaCheckCircle, FaCommentMedical, FaSearch } from 'react-icons/fa';
import { initialSchedules } from '../data/mockData';

const TrainerSchedulePage = ({ user }) => {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');

  const handleComplete = (id) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: 'Đã dạy xong' } : s));
  };

  const handleApprove = (id) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: 'Đã xác nhận' } : s));
  };

  const filteredSchedules = schedules.filter(sch => {
    const matchesStatus = filterStatus === 'Tất cả' || sch.status === filterStatus;
    const matchesSearch = sch.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sch.workoutType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="trainer-schedule-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="section-tag">QUẢN LÝ LỊCH DẠY PT</span>
          <h2 className="section-header-title">Danh Sách Ca Dạy 1:1 Với Học Viên</h2>
          <p className="text-muted mb-0">Theo dõi, duyệt ca dạy và ghi chú tiến độ bài tập cho từng học viên.</p>
        </div>

        <div className="billing-toggle-container m-0">
          {['Tất cả', 'Sắp diễn ra', 'Đã xác nhận', 'Đã dạy xong'].map(st => (
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

      {/* Filter and Search Bar */}
      <div className="p-3 mb-4 rounded-3 d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <div className="search-box position-relative" style={{ width: '320px' }}>
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Tìm theo tên học viên hoặc bài tập..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-muted small">
          Tổng số ca dạy: <strong className="text-white">{filteredSchedules.length} ca</strong>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>HỌC VIÊN</th>
                <th>SỐ ĐIỆN THOẠI</th>
                <th>NGÀY & KHUNG GIỜ DẠY</th>
                <th>NỘI DUNG BÀI TẬP</th>
                <th>ĐỊA ĐIỂM</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC HLV</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((sch) => (
                <tr key={sch.id}>
                  <td className="fw-bold text-white">{sch.studentName}</td>
                  <td>{sch.studentPhone || '0987654321'}</td>
                  <td>
                    <span style={{ color: '#00E676', fontWeight: 600 }}>{sch.date}</span> ({sch.time})
                  </td>
                  <td>{sch.workoutType}</td>
                  <td>{sch.location}</td>
                  <td>
                    <span className={`badge px-2.5 py-1 ${
                      sch.status === 'Đã dạy xong' ? 'bg-success' : 
                      sch.status === 'Đã xác nhận' ? 'bg-primary' : 'bg-warning text-dark'
                    }`}>
                      {sch.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center">
                      {sch.status === 'Sắp diễn ra' && (
                        <button 
                          className="btn-card-action px-2 py-1" 
                          style={{ fontSize: '0.75rem', width: 'auto', background: '#1E293B' }}
                          onClick={() => handleApprove(sch.id)}
                        >
                          Xác nhận
                        </button>
                      )}
                      {sch.status !== 'Đã dạy xong' && (
                        <button 
                          className="btn-card-action btn-green px-2 py-1" 
                          style={{ fontSize: '0.75rem', width: 'auto' }}
                          onClick={() => handleComplete(sch.id)}
                        >
                          <FaCheckCircle className="me-1" /> Đã dạy xong
                        </button>
                      )}
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

export default TrainerSchedulePage;
