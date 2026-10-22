import React, { useState } from 'react';
import { Modal, Form, Spinner, Row, Col } from 'react-bootstrap';
import { FaDumbbell, FaEnvelope, FaLock, FaUser, FaPhoneAlt, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

/**
 * A1.1 — SignUpModal: đăng ký tài khoản member mới qua API thật
 * Public chỉ tạo được role member; server chốt role.
 */
const SignUpModal = ({ show, onHide, onRegisterSuccess }) => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const validate = () => {
    if (!form.fullName.trim()) return 'Họ và tên là bắt buộc.';
    if (!form.email.trim()) return 'Email là bắt buộc.';
    if (form.password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
    if (form.password !== form.confirmPassword) return 'Mật khẩu xác nhận không khớp.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);
    try {
      await onRegisterSuccess({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        gender: form.gender || undefined
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess(false);
    setForm({ fullName: '', email: '', password: '', confirmPassword: '', phone: '', gender: '' });
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" contentClassName="modal-content-dark">
      <div className="modal-header-dark d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <div className="brand-icon" style={{ width: '32px', height: '32px', fontSize: '16px' }}>
            <FaDumbbell />
          </div>
          <div>
            <span className="section-tag d-block" style={{ fontSize: '0.65rem' }}>TẠO TÀI KHOẢN</span>
            <h5 className="modal-title mb-0">Đăng Ký Thành Viên FitManager</h5>
          </div>
        </div>
        <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
      </div>

      <div className="modal-body-dark">
        {success ? (
          <div className="text-center py-4">
            <FaCheckCircle style={{ fontSize: '3.5rem', color: '#00E676' }} className="mb-3" />
            <h4 className="fw-bold text-white mb-2">Đăng ký thành công!</h4>
            <p className="text-muted mb-4">
              Chào mừng <strong className="text-white">{form.fullName}</strong> đến với FitManager!
              <br />Bạn đã đăng nhập và có thể sử dụng ngay các tính năng dành cho Học viên.
            </p>
            <button className="btn-card-action btn-green px-5" onClick={handleClose}>
              Bắt đầu ngay
            </button>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && (
              <div
                className="d-flex align-items-center gap-2 p-3 mb-3 rounded-3"
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444' }}
              >
                <FaExclamationCircle />
                <span style={{ fontSize: '0.88rem' }}>{error}</span>
              </div>
            )}

            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="form-label-dark">
                    <FaUser className="me-2" style={{ color: '#00E676' }} /> Họ và tên <span style={{ color: '#EF4444' }}>*</span>
                  </Form.Label>
                  <Form.Control
                    id="signup-fullname"
                    name="fullName"
                    type="text"
                    className="form-control-dark"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    required
                    disabled={loading}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label-dark">
                    <FaEnvelope className="me-2" style={{ color: '#00E676' }} /> Email <span style={{ color: '#EF4444' }}>*</span>
                  </Form.Label>
                  <Form.Control
                    id="signup-email"
                    name="email"
                    type="email"
                    className="form-control-dark"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label-dark">
                    <FaPhoneAlt className="me-2" style={{ color: '#00E676' }} /> Số điện thoại
                  </Form.Label>
                  <Form.Control
                    id="signup-phone"
                    name="phone"
                    type="tel"
                    className="form-control-dark"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="0987654321"
                    disabled={loading}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label-dark">
                    <FaLock className="me-2" style={{ color: '#00E676' }} /> Mật khẩu <span style={{ color: '#EF4444' }}>*</span>
                  </Form.Label>
                  <Form.Control
                    id="signup-password"
                    name="password"
                    type="password"
                    className="form-control-dark"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Ít nhất 6 ký tự"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label-dark">
                    <FaLock className="me-2" style={{ color: '#00E676' }} /> Xác nhận mật khẩu <span style={{ color: '#EF4444' }}>*</span>
                  </Form.Label>
                  <Form.Control
                    id="signup-confirm-password"
                    name="confirmPassword"
                    type="password"
                    className="form-control-dark"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label-dark">Giới tính</Form.Label>
                  <Form.Select
                    id="signup-gender"
                    name="gender"
                    className="form-control-dark"
                    value={form.gender}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div
              className="mt-3 p-2 rounded-2 text-center"
              style={{ background: 'rgba(0, 230, 118, 0.06)', border: '1px dashed rgba(0, 230, 118, 0.2)', fontSize: '0.78rem', color: '#64748B' }}
            >
              Tài khoản mới sẽ được đăng ký với vai trò <strong style={{ color: '#00E676' }}>Học viên (Member)</strong>.
              Liên hệ quản trị viên để được cấp quyền Huấn luyện viên.
            </div>

            <div className="mt-4 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn-card-action px-4"
                style={{ width: 'auto' }}
                onClick={handleClose}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                id="signup-submit-btn"
                type="submit"
                className="btn-card-action btn-green px-5 d-flex align-items-center gap-2"
                style={{ width: 'auto' }}
                disabled={loading}
              >
                {loading && <Spinner animation="border" size="sm" />}
                {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
              </button>
            </div>
          </Form>
        )}
      </div>
    </Modal>
  );
};

export default SignUpModal;
