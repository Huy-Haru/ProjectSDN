import { FaBars, FaCalendarAlt, FaCalendarCheck, FaChartLine, FaChartPie, FaChalkboardTeacher, FaCreditCard, FaDollarSign, FaDumbbell, FaIdCard, FaSignOutAlt, FaStar, FaUserCircle, FaUserFriends, FaUserShield, FaUsers } from 'react-icons/fa';

const menus = {
  member: { label: 'MEMBER WORKSPACE', items: [['dashboard', 'Tổng quan', FaChartPie], ['packages', 'Gói tập', FaCreditCard], ['my-packages', 'Gói của tôi', FaIdCard], ['booking', 'Đặt lịch PT', FaCalendarAlt], ['trainers', 'Huấn luyện viên', FaUserFriends], ['schedule', 'Lịch tập', FaCalendarCheck], ['progress', 'Tiến độ & giáo án', FaChartLine], ['reviews', 'Đánh giá HLV', FaStar]] },
  trainer: { label: 'TRAINER WORKSPACE', items: [['trainer-dashboard', 'Tổng quan', FaChalkboardTeacher], ['trainer-schedule', 'Lịch dạy', FaCalendarCheck], ['trainer-students', 'Học viên & giáo án', FaUserFriends], ['trainer-reviews', 'Đánh giá từ học viên', FaStar]] },
  admin: { label: 'ADMIN CONTROL ROOM', items: [['admin-dashboard', 'Tổng quan', FaUserShield], ['admin-packages', 'Quản lý gói tập', FaCreditCard], ['admin-trainers', 'Quản lý PT', FaUserFriends], ['admin-students', 'Quản lý hội viên', FaUsers], ['admin-schedules', 'Quản lý lịch', FaCalendarCheck], ['admin-payments', 'Thanh toán', FaCreditCard], ['admin-revenue', 'Doanh thu', FaDollarSign]] },
};

export default function Sidebar({ user, activeMenu, setActiveMenu, collapsed, onToggle, onLogout }) {
  const config = menus[user?.role] || menus.member;
  return <aside className={`role-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
    <div className="sidebar-brand"><span className="brand-mark"><FaDumbbell /></span><div className="sidebar-brand-copy"><strong>FitManager</strong><small>{config.label}</small></div><button className="sidebar-toggle" onClick={onToggle} aria-label={collapsed ? 'Mở thanh bên' : 'Thu gọn thanh bên'}><FaBars /></button></div>
    <div className="sidebar-role"><span className="sidebar-role-dot" />{config.label}</div>
    <nav className="role-nav" aria-label="Điều hướng workspace">{config.items.map(([id, label, Icon]) => <button key={id} title={collapsed ? label : undefined} className={`role-nav-item ${activeMenu === id ? 'active' : ''}`} aria-current={activeMenu === id ? 'page' : undefined} onClick={() => setActiveMenu(id)}><Icon /><span>{label}</span></button>)}</nav>
    <div className="sidebar-bottom"><button title={collapsed ? 'Hồ sơ của tôi' : undefined} className={`role-nav-item ${activeMenu === 'profile' ? 'active' : ''}`} onClick={() => setActiveMenu('profile')}><FaUserCircle /><span>Hồ sơ của tôi</span></button><button className="role-nav-item sidebar-logout" onClick={onLogout}><FaSignOutAlt /><span>Đăng xuất</span></button></div>
  </aside>;
}
