import React, { useState } from 'react';
import { FaUsers, FaLock, FaUnlock, FaSearch, FaExchangeAlt } from 'react-icons/fa';
import { initialUsersList } from '../data/mockData';

const AdminStudentsPage = () => {
  const [usersList, setUsersList] = useState(initialUsersList.filter(u => u.role === 'USER'));
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleLockUser = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'Hoạt động' ? 'Tạm khóa' : 'Hoạt động';
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.phone.includes(searchTerm)
  );

  return (
    <div className="admin-students-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="section-tag">QUẢN LÝ HỌC VIÊN (ADMIN)</span>
          <h2 className="section-header-title">Danh Sách Học Viên Đăng Ký Thẻ</h2>
          <p className="text-muted mb-0">Quản lý tài khoản hội viên, gia hạn gói tập và cấp quyền truy cập.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 mb-4 rounded-3 d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <div className="search-box position-relative" style={{ width: '340px' }}>
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Tìm kiếm theo tên, email, SĐT..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-muted small">
          Tổng số học viên: <strong style={{ color: '#00E676' }}>{filteredUsers.length} thành viên</strong>
        </div>
      </div>

      <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>HỌ TÊN HỌC VIÊN</th>
                <th>EMAIL & SỐ ĐIỆN THOẠI</th>
                <th>GÓI TẬP ĐANG SỬ DỤNG</th>
                <th>NGÀY GIA NHẬP</th>
                <th>TRẠNG THÁI TÀI KHOẢN</th>
                <th>THAO TÁC ADMIN</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td className="fw-bold text-white">{u.name}</td>
                  <td>
                    <div>{u.email}</div>
                    <div className="text-muted small">{u.phone}</div>
                  </td>
                  <td style={{ color: '#00E676', fontWeight: 600 }}>{u.package}</td>
                  <td>{u.joinDate}</td>
                  <td>
                    <span className={`badge px-2.5 py-1 ${u.status === 'Hoạt động' ? 'bg-success' : 'bg-secondary'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center">
                      <button 
                        className={`btn-card-action px-2.5 py-1 ${u.status === 'Hoạt động' ? 'text-danger border-danger' : 'btn-green'}`}
                        style={{ fontSize: '0.75rem', width: 'auto', background: 'transparent' }}
                        onClick={() => handleToggleLockUser(u.id)}
                      >
                        {u.status === 'Hoạt động' ? <><FaLock className="me-1" /> Khóa thẻ</> : <><FaUnlock className="me-1" /> Mở thẻ</>}
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

export default AdminStudentsPage;
