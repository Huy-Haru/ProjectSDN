import React from 'react';
import { FaSearch, FaBell, FaUserCircle, FaSignInAlt, FaSignOutAlt, FaUserPlus } from 'react-icons/fa';

/**
 * A1.2 — Header chuẩn hóa phiên thật từ server:
 * - Không còn "Chuyển Vai Trò" demo
 * - Hiển thị user từ server (fullName, role lowercase)
 * - Nút Đăng nhập / Đăng ký khi chưa có phiên
 * - Nút Đăng xuất khi đã đăng nhập
 */
const Header = ({ user, onOpenLogin, onOpenSignUp, onLogout }) => {
  const isLoggedIn = !!user;

  // Role badge theo role server (lowercase)
  let roleBadgeClass = 'bg-success';
  let roleLabel = 'Học viên';
  if (user?.role === 'admin') { roleBadgeClass = 'bg-danger'; roleLabel = 'Admin'; }
  else if (user?.role === 'trainer') { roleBadgeClass = 'bg-primary'; roleLabel = 'Huấn luyện viên'; }

  return (
    <header className="top-header">
      {/* Search Input */}
      <div className="search-box">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm HLV, bài tập, gói tập..."
          readOnly
        />
        <span className="search-shortcut">Ctrl + K / ⌘K</span>
      </div>

      {/* Header Right Actions */}
      <div className="header-right">
        {isLoggedIn ? (
          <>
            {/* Notification Icon */}
            <div className="notification-btn" title="Thông báo">
              <FaBell />
            </div>

            {/* User Info */}
            <div className="user-profile-btn" style={{ cursor: 'default' }}>
              {user.avatar ? (
                <img src={user.avatar} alt="User Avatar" className="user-avatar" />
              ) : (
                <FaUserCircle className="user-avatar" style={{ fontSize: '38px', color: '#00E676' }} />
              )}
              <div>
                <div className="user-name d-flex align-items-center gap-2">
                  <span>{user.fullName}</span>
                  <span className={`badge ${roleBadgeClass}`} style={{ fontSize: '0.62rem' }}>
                    {roleLabel}
                  </span>
                </div>
                <div className="user-role">{user.email}</div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              id="header-logout-btn"
              className="btn btn-sm d-flex align-items-center gap-1"
              style={{ fontSize: '0.8rem', color: '#94A3B8', background: 'transparent', border: '1px solid #1E293B', borderRadius: '8px' }}
              onClick={onLogout}
              title="Đăng xuất"
            >
              <FaSignOutAlt /> Đăng xuất
            </button>
          </>
        ) : (
          <>
            {/* Đăng ký */}
            <button
              id="header-signup-btn"
              className="btn btn-sm d-flex align-items-center gap-1"
              style={{ fontSize: '0.8rem', color: '#00E676', background: 'transparent', border: '1px solid rgba(0,230,118,0.4)', borderRadius: '8px' }}
              onClick={onOpenSignUp}
            >
              <FaUserPlus /> Đăng ký
            </button>

            {/* Đăng nhập */}
            <button
              id="header-login-btn"
              className="btn btn-sm d-flex align-items-center gap-1"
              style={{ fontSize: '0.8rem', color: '#fff', background: '#00E676', border: 'none', borderRadius: '8px', fontWeight: 700 }}
              onClick={onOpenLogin}
            >
              <FaSignInAlt /> Đăng nhập
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
