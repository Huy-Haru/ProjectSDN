import React, { useState } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { FaDumbbell, FaLock, FaPhoneAlt, FaUser, FaUserCheck, FaUserShield } from 'react-icons/fa';
import { demoAccounts } from '../data/mockData';

const LoginModal = ({ show, onHide, onLoginSuccess }) => {
  const [phone, setPhone] = useState('0987654321');
  const [password, setPassword] = useState('123456');

  // Handle Quick Demo Account Selection
  const handleQuickLogin = (accountKey) => {
    const account = demoAccounts[accountKey];
    onLoginSuccess(account);
    onHide();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Match against demo account phone or default to user
    let account = demoAccounts.user;
    if (phone === '0912345678' || phone.toLowerCase().includes('trainer')) {
      account = demoAccounts.trainer;
    } else if (phone === '0999999999' || phone.toLowerCase().includes('admin')) {
      account = demoAccounts.admin;
    }

    onLoginSuccess(account);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="modal-content-dark">
      <div className="modal-header-dark d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <div className="brand-icon" style={{ width: '32px', height: '32px', fontSize: '16px' }}>
            <FaDumbbell />
          </div>
          <h5 className="modal-title mb-0">Đăng Nhập Phân Quyền FitManager</h5>
        </div>
        <button type="button" className="btn-close" onClick={onHide} aria-label="Close"></button>
      </div>

      <div className="modal-body-dark">
        {/* Quick Demo Switcher Prompt */}
        <div className="p-3 mb-4 rounded-3 text-center" style={{ background: 'rgba(0, 230, 118, 0.08)', border: '1px dashed rgba(0, 230, 118, 0.3)' }}>
          <div style={{ fontSize: '0.78rem', color: '#00E676', fontWeight: 800 }} className="mb-2">
            ⚡ CHỌN NHANH TÀI KHOẢN ĐỂ TEST PHÂN QUYỀN:
          </div>
          <div className="d-flex flex-column gap-2">
            <button 
              type="button" 
              className="btn btn-dark text-start btn-sm d-flex align-items-center justify-content-between py-2 px-3"
              style={{ background: '#0F172A', border: '1px solid #1E293B' }}
              onClick={() => handleQuickLogin('user')}
            >
              <div>
                <FaUser className="me-2 text-success" /> <strong>Học viên (User)</strong>
                <div className="text-muted small">Nguyễn Văn An — 0987654321</div>
              </div>
              <span className="badge bg-success">Login User</span>
            </button>

            <button 
              type="button" 
              className="btn btn-dark text-start btn-sm d-flex align-items-center justify-content-between py-2 px-3"
              style={{ background: '#0F172A', border: '1px solid #1E293B' }}
              onClick={() => handleQuickLogin('trainer')}
            >
              <div>
                <FaUserCheck className="me-2 text-primary" /> <strong>Huấn luyện viên (Trainer)</strong>
                <div className="text-muted small">HLV. Trần Minh Đức — 0912345678</div>
              </div>
              <span className="badge bg-primary">Login Trainer</span>
            </button>

            <button 
              type="button" 
              className="btn btn-dark text-start btn-sm d-flex align-items-center justify-content-between py-2 px-3"
              style={{ background: '#0F172A', border: '1px solid #1E293B' }}
              onClick={() => handleQuickLogin('admin')}
            >
              <div>
                <FaUserShield className="me-2 text-danger" /> <strong>Quản trị viên (Admin)</strong>
                <div className="text-muted small">Phạm Hoàng Nam — 0999999999</div>
              </div>
              <span className="badge bg-danger">Login Admin</span>
            </button>
          </div>
        </div>

        <div className="divider mb-3"></div>

        {/* Standard Manual Login Form */}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="form-label-dark">
              <FaPhoneAlt className="me-2" style={{ color: '#00E676' }} /> Số điện thoại / Mã tài khoản
            </Form.Label>
            <Form.Control 
              type="text" 
              className="form-control-dark" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập 0987654321 (User) / 0912345678 (Trainer) / 0999999999 (Admin)"
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="form-label-dark">
              <FaLock className="me-2" style={{ color: '#00E676' }} /> Mật khẩu
            </Form.Label>
            <Form.Control 
              type="password" 
              className="form-control-dark" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              required
            />
          </Form.Group>

          <button type="submit" className="btn-card-action btn-green w-100 py-2.5">
            Đăng nhập hệ thống
          </button>
        </Form>
      </div>
    </Modal>
  );
};

export default LoginModal;
