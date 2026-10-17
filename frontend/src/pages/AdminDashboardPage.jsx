import React, { useState } from 'react';
import { 
  FaUsers, 
  FaDollarSign, 
  FaDumbbell, 
  FaCreditCard, 
  FaUserShield, 
  FaLock, 
  FaUnlock, 
  FaExchangeAlt, 
  FaPlus 
} from 'react-icons/fa';
import { initialUsersList, adminSummary, packagesData } from '../data/mockData';

const AdminDashboardPage = ({ user }) => {
  const [usersList, setUsersList] = useState(initialUsersList);
  const [packagesList, setPackagesList] = useState(packagesData);
  const [activeTab, setActiveTab] = useState('users');

  const handleToggleLockUser = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'Hoạt động' ? 'Tạm khóa' : 'Hoạt động';
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const handleChangeRole = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        let nextRole = 'USER';
        if (u.role === 'USER') nextRole = 'TRAINER';
        else if (u.role === 'TRAINER') nextRole = 'ADMIN';
        else if (u.role === 'ADMIN') nextRole = 'USER';

        return { ...u, role: nextRole };
      }
      return u;
    }));
  };

  return (
    <div className="admin-dashboard-page">
      {/* Banner */}
      <div 
        className="p-4 rounded-4 mb-4 position-relative overflow-hidden" 
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', border: '1px solid #6366F1' }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <span className="badge px-3 py-1.5 mb-2" style={{ background: '#6366F1', color: '#ffffff', fontWeight: 800 }}>
              <FaUserShield className="me-1" /> QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN PORTAL)
            </span>
            <h2 className="text-white fw-bold display-6 mb-1">
              Bảng Đánh Giá Quản Lý FitManager
            </h2>
            <p className="text-muted mb-0">
              Quản lý phân quyền tài khoản, bảng giá gói tập và báo cáo tổng quan hệ thống phòng tập.
            </p>
          </div>

          <div className="d-flex gap-2">
            <button 
              className={`toggle-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <FaUsers className="me-1" /> Quản Lý Tài Khoản ({usersList.length})
            </button>
            <button 
              className={`toggle-btn ${activeTab === 'packages' ? 'active' : ''}`}
              onClick={() => setActiveTab('packages')}
            >
              <FaCreditCard className="me-1" /> Gói Tập Gym ({packagesList.length})
            </button>
          </div>
        </div>
      </div>

      {/* 4 System Metric Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted style-sm fw-bold">TỔNG DOANH THU THÁNG</span>
              <FaDollarSign style={{ color: '#00E676', fontSize: '1.2rem' }} />
            </div>
            <div className="fs-2 fw-bold text-white mb-1">{adminSummary.totalRevenue}</div>
            <div style={{ fontSize: '0.78rem', color: '#00E676', fontWeight: 700 }}>
              {adminSummary.monthlyGrowth} tăng trưởng so với tháng trước
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted style-sm fw-bold">TỔNG HỘI VIÊN DÂN SỐ</span>
              <FaUsers style={{ color: '#3B82F6', fontSize: '1.2rem' }} />
            </div>
            <div className="fs-2 fw-bold text-white mb-1">{adminSummary.totalMembers.toLocaleString()} Thành viên</div>
            <div style={{ fontSize: '0.78rem', color: '#3B82F6' }}>1,120 Học viên kích hoạt thẻ</div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted style-sm fw-bold">DUNG LƯỢNG PT HOẠT ĐỘNG</span>
              <FaDumbbell style={{ color: '#A855F7', fontSize: '1.2rem' }} />
            </div>
            <div className="fs-2 fw-bold text-white mb-1">{adminSummary.activeTrainers} HLV</div>
            <div style={{ fontSize: '0.78rem', color: '#A855F7' }}>100% đạt chứng chỉ chuẩn NASM</div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted style-sm fw-bold">GÓI TẬP BÁN TRONG THÁNG</span>
              <FaCreditCard style={{ color: '#FFC107', fontSize: '1.2rem' }} />
            </div>
            <div className="fs-2 fw-bold text-white mb-1">{adminSummary.packagesSoldThisMonth} Gói</div>
            <div style={{ fontSize: '0.78rem', color: '#FFC107' }}>Gói Premium Plus chiếm 65%</div>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'users' ? (
        <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="text-white fw-bold mb-0">Quản Lý Phân Quyền Người Dùng & Tài Khoản</h5>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Thay đổi vai trò (USER / TRAINER / ADMIN) hoặc khóa quyền truy cập.</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>HỌ TÊN NGƯỜI DÙNG</th>
                  <th>EMAIL / SĐT</th>
                  <th>VAI TRÒ (ROLE)</th>
                  <th>GÓI / CHỨC DANH</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC ADMIN</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => {
                  let roleBadgeBg = 'bg-secondary';
                  if (u.role === 'ADMIN') roleBadgeBg = 'bg-danger';
                  else if (u.role === 'TRAINER') roleBadgeBg = 'bg-primary';
                  else if (u.role === 'USER') roleBadgeBg = 'bg-success';

                  return (
                    <tr key={u.id}>
                      <td className="fw-bold text-white">{u.name}</td>
                      <td>
                        <div>{u.email}</div>
                        <div className="text-muted small">{u.phone}</div>
                      </td>
                      <td>
                        <span className={`badge px-2.5 py-1 ${roleBadgeBg}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.package}</td>
                      <td>
                        <span className={`badge px-2 py-1 ${u.status === 'Hoạt động' ? 'bg-success' : 'bg-secondary'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <button 
                            className="btn-card-action px-2.5 py-1"
                            style={{ fontSize: '0.75rem', width: 'auto', background: '#1E293B' }}
                            onClick={() => handleChangeRole(u.id)}
                          >
                            <FaExchangeAlt className="me-1" /> Đổi Role
                          </button>

                          <button 
                            className={`btn-card-action px-2.5 py-1 ${u.status === 'Hoạt động' ? 'text-danger border-danger' : 'btn-green'}`}
                            style={{ fontSize: '0.75rem', width: 'auto', background: 'transparent' }}
                            onClick={() => handleToggleLockUser(u.id)}
                          >
                            {u.status === 'Hoạt động' ? (
                              <><FaLock className="me-1" /> Khóa</>
                            ) : (
                              <><FaUnlock className="me-1" /> Mở khóa</>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="text-white fw-bold mb-0">Quản Lý Gói Tập Thể Hình & Giá Niêm Yết</h5>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Điều chỉnh giá gói tập và thông số truyền thông.</span>
            </div>
            <button className="btn-card-action btn-green px-3 py-1.5" style={{ width: 'auto', fontSize: '0.82rem' }}>
              <FaPlus className="me-1" /> Thêm Gói Tập Mới
            </button>
          </div>

          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>TÊN GÓI TẬP</th>
                  <th>GIÁ THEO NĂM</th>
                  <th>GIÁ THEO THÁNG</th>
                  <th>SỐ HỌC VIÊN ĐANG DÙNG</th>
                  <th>NỔI BẠT (FEATURED)</th>
                </tr>
              </thead>
              <tbody>
                {packagesList.map((pkg) => (
                  <tr key={pkg.id}>
                    <td className="fw-bold text-white">{pkg.name}</td>
                    <td style={{ color: '#00E676', fontWeight: 700 }}>{pkg.priceYear} đ / năm</td>
                    <td>{pkg.priceMonth} đ / tháng</td>
                    <td>{pkg.activeMembers} Học viên</td>
                    <td>
                      {pkg.isPopular ? (
                        <span className="badge bg-success">★ POPULAR</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
