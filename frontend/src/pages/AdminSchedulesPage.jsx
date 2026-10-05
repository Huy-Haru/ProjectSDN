import React, { useState } from 'react';
import { FaCalendarAlt, FaSearch, FaClock, FaCheckCircle } from 'react-icons/fa';
import { initialSchedules } from '../data/mockData';

const AdminSchedulesPage = () => {
  const [masterSchedules, setMasterSchedules] = useState(initialSchedules);
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = masterSchedules.filter(s => {
    const matchesStatus = filterStatus === 'Tất cả' || s.status === filterStatus;
    const matchesSearch = s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.trainerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="admin-schedules-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="section-tag">QUẢN LÝ LỊCH TẬP TOÀN HỆ THỐNG (ADMIN)</span>
          <h2 className="section-header-title">Tổng Quan Lịch Tập PT & Học Viên</h2>
          <p className="text-muted mb-0">Giám sát các ca dạy 1:1, kiểm tra trùng lịch và tỷ lệ hoàn thành ca tập.</p>
        </div>

        <div className="billing-toggle-container m-0">
          {['Tất cả', 'Sắp diễn ra', 'Đã xác nhận', 'Hoàn thành'].map(st => (
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

      <div className="p-3 mb-4 rounded-3 d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <div className="search-box position-relative" style={{ width: '340px' }}>
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Tìm theo học viên hoặc tên PT..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-muted small">
          Tổng số ca tập ghi nhận: <strong className="text-white">{filtered.length} ca tập</strong>
        </div>
      </div>

      <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>HỌC VIÊN</th>
                <th>HUẤN LUYỆN VIÊN (PT)</th>
                <th>NGÀY & GIỜ TẬP</th>
                <th>NỘI DUNG BUỔI TẬP</th>
                <th>KHU VỰC TẬP</th>
                <th>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="fw-bold text-white">{s.studentName}</td>
                  <td style={{ color: '#00E676', fontWeight: 600 }}>{s.trainerName}</td>
                  <td>{s.date} ({s.time})</td>
                  <td>{s.workoutType}</td>
                  <td>{s.location}</td>
                  <td>
                    <span className={`badge px-2.5 py-1 ${
                      s.status === 'Hoàn thành' || s.status === 'Đã dạy xong' ? 'bg-success' : 'bg-warning text-dark'
                    }`}>
                      {s.status}
                    </span>
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

export default AdminSchedulesPage;
