import React from 'react';
import { FaSearch, FaBell, FaUserCircle, FaExchangeAlt } from 'react-icons/fa';
import { currentUser } from '../data/mockData';

const Header = ({ user, onOpenLogin }) => {
  const displayUser = user || currentUser;

  let roleBadgeClass = 'bg-success';
  if (displayUser.role === 'ADMIN') roleBadgeClass = 'bg-danger';
  else if (displayUser.role === 'TRAINER') roleBadgeClass = 'bg-primary';

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
        {/* Switch Role Quick Button */}
        <button 
          className="btn btn-outline-success btn-sm rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5"
          style={{ fontSize: '0.78rem', fontWeight: 700, borderColor: '#00E676', color: '#00E676' }}
          onClick={onOpenLogin}
          title="Bấm để đăng nhập bằng tài khoản khác"
        >
          <FaExchangeAlt /> Chuyển Vai Trò
        </button>

        {/* Notification Icon */}
        <div className="notification-btn" title="Thông báo">
          <FaBell />
          {displayUser.unreadNotifications > 0 && (
            <span className="notification-badge">{displayUser.unreadNotifications}</span>
          )}
        </div>

        {/* User Info / Login Toggle */}
        <button className="user-profile-btn" onClick={onOpenLogin}>
          {displayUser.avatar ? (
            <img src={displayUser.avatar} alt="User Avatar" className="user-avatar" />
          ) : (
            <FaUserCircle className="user-avatar" style={{ fontSize: '38px', color: '#00E676' }} />
          )}
          <div>
            <div className="user-name d-flex align-items-center gap-2">
              <span>{displayUser.name}</span>
              <span className={`badge ${roleBadgeClass}`} style={{ fontSize: '0.62rem' }}>
                {displayUser.role}
              </span>
            </div>
            <div className="user-role">{displayUser.roleName}</div>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
