import React, { useState } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { FaCheckCircle, FaCreditCard, FaUser, FaPhoneAlt, FaCalendarAlt } from 'react-icons/fa';

const RegisterModal = ({ show, onHide, selectedPackage, isYearly }) => {
  const [name, setName] = useState('Nguyễn Văn An');
  const [phone, setPhone] = useState('0987654321');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('qr');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!selectedPackage) return null;

  const price = isYearly ? selectedPackage.priceYear : selectedPackage.priceMonth;
  const cycleText = isYearly ? '12 tháng (Theo năm)' : '1 tháng (Theo tháng)';

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" contentClassName="modal-content-dark">
      <div className="modal-header-dark d-flex justify-content-between align-items-center">
        <div>
          <span className="section-tag d-block mb-1">XÁC NHẬN ĐĂNG KÝ</span>
          <h5 className="modal-title mb-0" style={{ color: '#00E676' }}>
            {selectedPackage.name}
          </h5>
        </div>
        <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
      </div>

      <div className="modal-body-dark">
        {isSuccess ? (
          <div className="text-center py-4">
            <FaCheckCircle style={{ fontSize: '3.5rem', color: '#00E676' }} className="mb-3" />
            <h4 className="fw-bold text-white mb-2">Đăng ký thành công!</h4>
            <p className="text-muted mb-4">
              Cảm ơn học viên <strong className="text-white">{name}</strong> đã đăng ký{' '}
              <strong style={{ color: '#00E676' }}>{selectedPackage.name}</strong>.
              <br />
              Bộ phận hỗ trợ FitManager sẽ liên hệ xác nhận trong vòng 15 phút.
            </p>
            <button className="btn-card-action btn-green px-5" onClick={handleClose}>
              Hoàn tất
            </button>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {/* Package Summary Box */}
            <div 
              className="p-3 mb-4 rounded-3 d-flex justify-content-between align-items-center"
              style={{ background: 'rgba(0, 230, 118, 0.08)', border: '1px solid rgba(0, 230, 118, 0.3)' }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#00E676', fontWeight: 800 }}>GÓI TẬP ĐÃ CHỌN</div>
                <div className="fw-bold text-white fs-5">{selectedPackage.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Chu kỳ: {cycleText}</div>
              </div>
              <div className="text-end">
                <div className="fs-3 fw-bold" style={{ color: '#00E676' }}>{price} đ</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{selectedPackage.note}</div>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="form-label-dark">
                    <FaUser className="me-2" style={{ color: '#00E676' }} /> Họ và tên học viên
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    className="form-control-dark" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="form-label-dark">
                    <FaPhoneAlt className="me-2" style={{ color: '#00E676' }} /> Số điện thoại
                  </Form.Label>
                  <Form.Control 
                    type="tel" 
                    className="form-control-dark" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required 
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="form-label-dark">
                    <FaCalendarAlt className="me-2" style={{ color: '#00E676' }} /> Ngày bắt đầu tập
                  </Form.Label>
                  <Form.Control 
                    type="date" 
                    className="form-control-dark" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required 
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="form-label-dark">
                    <FaCreditCard className="me-2" style={{ color: '#00E676' }} /> Phương thức thanh toán
                  </Form.Label>
                  <Form.Select 
                    className="form-control-dark"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="qr">Chuyển khoản Ngân hàng (Mã QR)</option>
                    <option value="card">Thẻ tín dụng / Ghi nợ (Trả góp 0%)</option>
                    <option value="momo">Ví MoMo / ZaloPay / VNPay</option>
                    <option value="counter">Thanh toán tại Lễ tân phòng tập</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="mt-4 pt-2 d-flex justify-content-end gap-2">
              <button 
                type="button" 
                className="btn-card-action px-4" 
                style={{ width: 'auto' }} 
                onClick={handleClose}
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                className="btn-card-action btn-green px-5" 
                style={{ width: 'auto' }}
              >
                Xác nhận Đăng ký
              </button>
            </div>
          </Form>
        )}
      </div>
    </Modal>
  );
};

export default RegisterModal;
