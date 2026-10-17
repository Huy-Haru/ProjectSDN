import React, { useState, useEffect } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { FaCreditCard, FaDollarSign } from 'react-icons/fa';

const ManagePackageModal = ({ show, onHide, packageToEdit, onSavePackage }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [priceYear, setPriceYear] = useState('');
  const [priceMonth, setPriceMonth] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [isPopular, setIsPopular] = useState(false);

  useEffect(() => {
    if (packageToEdit) {
      setName(packageToEdit.name || '');
      setCategory(packageToEdit.category || 'THỂ HÌNH CAO CẤP');
      setPriceYear(packageToEdit.priceYear || '');
      setPriceMonth(packageToEdit.priceMonth || '');
      setSubtitle(packageToEdit.subtitle || '');
      setIsPopular(packageToEdit.isPopular || false);
    } else {
      setName('');
      setCategory('THỂ HÌNH CAO CẤP');
      setPriceYear('3.990.000');
      setPriceMonth('399.000');
      setSubtitle('Gói tập đầy đủ tiện ích kèm huấn luyện viên.');
      setIsPopular(false);
    }
  }, [packageToEdit, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSavePackage({
      id: packageToEdit ? packageToEdit.id : `pkg_${Date.now()}`,
      name,
      category,
      priceYear,
      priceMonth,
      subtitle,
      isPopular,
      status: 'Hoạt động',
      features: packageToEdit ? packageToEdit.features : ['Tập luyện 24/7', 'Đo InBody miễn phí', 'Xông hơi Sauna']
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="modal-content-dark">
      <div className="modal-header-dark d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <FaCreditCard style={{ color: '#00E676' }} />
          <h5 className="modal-title mb-0">{packageToEdit ? 'Chỉnh Sửa Gói Tập' : 'Thêm Gói Tập Mới'}</h5>
        </div>
        <button type="button" className="btn-close" onClick={onHide}></button>
      </div>

      <div className="modal-body-dark">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="form-label-dark">Tên Gói Tập</Form.Label>
            <Form.Control 
              type="text" 
              className="form-control-dark" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Gói Platinum Pro"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label-dark">Danh Mục / Phân Loại</Form.Label>
            <Form.Control 
              type="text" 
              className="form-control-dark" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ví dụ: CHUYỂN HÓA VÓC DÁNG"
              required
            />
          </Form.Group>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="form-label-dark">Giá Theo Năm (VNĐ)</Form.Label>
                <Form.Control 
                  type="text" 
                  className="form-control-dark" 
                  value={priceYear}
                  onChange={(e) => setPriceYear(e.target.value)}
                  required
                />
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="form-label-dark">Giá Theo Tháng (VNĐ)</Form.Label>
                <Form.Control 
                  type="text" 
                  className="form-control-dark" 
                  value={priceMonth}
                  onChange={(e) => setPriceMonth(e.target.value)}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="form-label-dark">Mô tả ngắn gói tập</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={2} 
              className="form-control-dark" 
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Check 
              type="checkbox"
              id="popular-check"
              label="Đánh dấu là gói Khuyên dùng (Featured Popular)"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
              className="text-white small"
            />
          </Form.Group>

          <button type="submit" className="btn-card-action btn-green w-100 py-2.5">
            {packageToEdit ? 'Lưu Thay Đổi' : 'Thêm Gói Tập Mới'}
          </button>
        </Form>
      </div>
    </Modal>
  );
};

export default ManagePackageModal;
