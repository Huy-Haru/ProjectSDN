import { FaBars, FaBell, FaMoon, FaSignInAlt, FaSignOutAlt, FaSun, FaUserCircle, FaUserPlus } from 'react-icons/fa';

export default function Header({ user, onOpenLogin, onOpenSignUp, onLogout, theme, onToggleTheme, onToggleSidebar, onNavigate, isPublic = false }) {
  const roleLabel = user?.role === 'admin' ? 'Admin' : user?.role === 'trainer' ? 'Huấn luyện viên' : 'Hội viên';
  return <header className={`top-header ${isPublic ? 'public-header' : ''}`}>
    {!isPublic && <button className="mobile-sidebar-toggle" onClick={onToggleSidebar} aria-label="Mở menu"><FaBars /></button>}
    <button className="header-brand" onClick={() => onNavigate('/')}><span className="brand-mark"><span>FM</span></span><strong>FitManager</strong></button>
    {isPublic && <nav className="public-nav"><button onClick={() => onNavigate('/')}>Trang chủ</button><button onClick={() => onNavigate('/about')}>Về chúng tôi</button><button onClick={() => onNavigate('/context')}>Cách hoạt động</button><button onClick={() => onNavigate('/packages')}>Gói tập</button></nav>}
    <div className="header-right"><button className="theme-toggle" onClick={onToggleTheme} aria-label="Đổi giao diện">{theme === 'dark' ? <FaSun /> : <FaMoon />}</button>{user ? <><button className="notification-btn" aria-label="Thông báo"><FaBell /></button><div className="user-profile-btn"><FaUserCircle className="user-avatar" /><div><strong>{user.fullName}</strong><small>{roleLabel}</small></div></div><button className="header-action header-action-quiet" onClick={onLogout}><FaSignOutAlt /><span>Đăng xuất</span></button></> : <><button className="header-action header-action-quiet" onClick={onOpenLogin}><FaSignInAlt /><span>Đăng nhập</span></button><button className="header-action header-action-primary" onClick={onOpenSignUp}><FaUserPlus /><span>Đăng ký</span></button></>}</div>
  </header>;
}
