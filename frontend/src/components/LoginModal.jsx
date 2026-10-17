import React, { useState } from 'react';
import { Modal, Form, Spinner } from 'react-bootstrap';
import { FaDumbbell, FaEnvelope, FaLock, FaExclamationCircle } from 'react-icons/fa';

/**
 * A1.2 — LoginModal dùng API thật (email + password)
 * Không còn quick demo / đổi role client-side
 */
const LoginModal = ({ show, onHide, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await onLoginSuccess(email, password);
      if (user) {
        setEmail('');
        setPassword('');
        onHide();
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setEmail('');
    setPassword('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered contentClassName="modal-content-dark">
      <div className="modal-header-dark d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <div className="brand-icon" style={{ width: '32px', height: '32px', fontSize: '16px' }}>
            <FaDumbbell />
          </div>
          <h5 className="modal-title mb-0">Đăng Nhập FitManager</h5>
        </div>
        <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
      </div>

      <div className="modal-body-dark">
        {error && (
          <div
            className="d-flex align-items-center gap-2 p-3 mb-3 rounded-3"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444' }}
          >
            <FaExclamationCircle />
            <span style={{ fontSize: '0.88rem' }}>{error}</span>
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="form-label-dark">
              <FaEnvelope className="me-2" style={{ color: '#00E676' }} /> Email
            </Form.Label>
            <Form.Control
              id="login-email"
              type="email"
              className="form-control-dark"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập địa chỉ email..."
              required
              disabled={loading}
              autoComplete="email"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="form-label-dark">
              <FaLock className="me-2" style={{ color: '#00E676' }} /> Mật khẩu
            </Form.Label>
            <Form.Control
              id="login-password"
              type="password"
              className="form-control-dark"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </Form.Group>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn-card-action btn-green w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading && <Spinner animation="border" size="sm" />}
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập hệ thống'}
          </button>
        </Form>
      </div>
    </Modal>
  );
};

export default LoginModal;
