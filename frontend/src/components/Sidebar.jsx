import React from 'react';
import { 
  FaDumbbell, 
  FaChartPie, 
  FaCalendarAlt, 
  FaIdCard, 
  FaCreditCard, 
  FaUserFriends, 
  FaCalendarCheck, 
  FaChartLine, 
  FaStar,
  FaUserShield,
  FaUsers,
  FaChalkboardTeacher,
  FaDollarSign
} from 'react-icons/fa';

const Sidebar = ({ user, activeMenu, setActiveMenu }) => {
  const role = user?.role || 'USER';

  // Role-based menu definitions
  const studentMenus = [
    { id: 'dashboard', label: 'Tổng quan', icon: <FaChartPie /> },
    { id: 'packages', label: 'Danh sách gói tập', icon: <FaCreditCard /> },
    { id: 'my-packages', label: 'Gói tập của tôi', icon: <FaIdCard /> },
    { id: 'booking', label: 'Đặt lịch PT', icon: <FaCalendarAlt /> },
    { id: 'trainers', label: 'Huấn luyện viên', icon: <FaUserFriends /> },
    { id: 'schedule', label: 'Lịch tập', icon: <FaCalendarCheck /> },
    { id: 'progress', label: 'Tiến độ & Thể trạng', icon: <FaChartLine /> },
    { id: 'reviews', label: 'Đánh giá HLV', icon: <FaStar /> },
  ];

  const trainerMenus = [
    { id: 'trainer-dashboard', label: 'Tổng quan HLV', icon: <FaChalkboardTeacher /> },
    { id: 'trainer-schedule', label: 'Quản lý lịch tập', icon: <FaCalendarCheck /> },
    { id: 'trainer-students', label: 'Học viên & Tiến độ', icon: <FaUserFriends /> },
    { id: 'trainer-reviews', label: 'Đánh giá từ Học viên', icon: <FaStar /> },
  ];

  const adminMenus = [
    { id: 'admin-dashboard', label: 'Thống kê Quản trị', icon: <FaUserShield /> },
    { id: 'admin-packages', label: 'Quản lý Gói tập', icon: <FaCreditCard /> },
    { id: 'admin-trainers', label: 'Quản lý PT', icon: <FaUserFriends /> },
    { id: 'admin-students', label: 'Quản lý Học viên', icon: <FaUsers /> },
    { id: 'admin-schedules', label: 'Quản lý Lịch tập', icon: <FaCalendarCheck /> },
    { id: 'admin-revenue', label: 'Thống kê Doanh thu', icon: <FaDollarSign /> },
  ];

  let currentMenuList = studentMenus;
  let roleLabel = 'MỤC HỌC VIÊN';

  if (role === 'TRAINER') {
    currentMenuList = trainerMenus;
    roleLabel = 'PORTAL HUẤN LUYỆN VIÊN';
  } else if (role === 'ADMIN') {
    currentMenuList = adminMenus;
    roleLabel = 'HỆ THỐNG QUẢN TRỊ ADMIN';
  }

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-icon">
          <FaDumbbell />
        </div>
        <div>
          <div className="brand-title">FitManager</div>
          <div className="brand-subtitle">ATHLETIC CLUB</div>
        </div>
      </div>

      {/* Menu Section Label */}
      <div className="menu-section-label">{roleLabel}</div>
      <nav className="nav-menu">
        {currentMenuList.map((item) => (
          <button
            key={item.id}
            className={`nav-item-btn ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => setActiveMenu(item.id)}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
