import React, { useState, useEffect } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { FaUserCheck, FaAward } from 'react-icons/fa';

const ManageTrainerModal = ({ show, onHide, trainerToEdit, onSaveTrainer }) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [phone, setPhone] = useState('');
  const [specialtiesStr, setSpecialtiesStr] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (trainerToEdit) {
      setName(trainerToEdit.name || '');
      setTitle(trainerToEdit.title || '');
      setExperience(trainerToEdit.experience || '');
      setPhone(trainerToEdit.phone || '');
      setSpecialtiesStr(trainerToEdit.specialties ? trainerToEdit.specialties.join(', ') : '');
      setBio(trainerToEdit.bio || '');
    } else {
      setName('');
      setTitle('Chuyên Gia Thể Lực & Posture');
      setExperience('5 năm kinh nghiệm');
      setPhone('0912345678');
      setSpecialtiesStr('Tăng cơ, Giảm mỡ');
      setBio('Huấn luyện viên tận tâm, đồng hành cùng học viên.');
    }
  }, [trainerToEdit, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const specialtiesArray = specialtiesStr.split(',').map(s => s.trim()).filter(Boolean);

    onSaveTrainer({
      id: trainerToEdit ? trainerToEdit.id : `pt_${Date.now()}`,
      name,
      title,
      experience,
      phone,
      specialties: specialtiesArray,
      bio,
      rating: trainerToEdit ? trainerToEdit.rating : 5.0,
      reviewsCount: trainerToEdit ? trainerToEdit.reviewsCount : 1,
      avatar: trainerToEdit ? trainerToEdit.avatar : 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=300',
      status: 'Hoạt động'
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="modal-content-dark">
      <div className="modal-header-dark d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <FaUserCheck style={{ color: '#00E676' }} />
          <h5 className="modal-title mb-0">{trainerToEdit ? 'Chỉnh Sửa HLV' : 'Thêm Huấn Luyện Viên Mới'}</h5>
        </div>
        <button type="button" className="btn-close" onClick={onHide}></button>
      </div>

      <div className="modal-body-dark">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="form-label-dark">Họ và Tên HLV</Form.Label>
            <Form.Control 
              type="text" 
              className="form-control-dark" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: HLV. Nguyễn Văn Bắc"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label-dark">Chức Danh / Bằng Cấp</Form.Label>
            <Form.Control 
              type="text" 
              className="form-control-dark" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Master Trainer - Bodybuilding"
              required
            />
          </Form.Group>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="form-label-dark">Kinh Nghiệm</Form.Label>
                <Form.Control 
                  type="text" 
                  className="form-control-dark" 
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Ví dụ: 6 năm kinh nghiệm"
                  required
                />
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="form-label-dark">Số Điện Thoại</Form.Label>
                <Form.Control 
                  type="text" 
                  className="form-control-dark" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="form-label-dark">Chuyên Môn (Phân cách bằng dấu phẩy)</Form.Label>
            <Form.Control 
              type="text" 
              className="form-control-dark" 
              value={specialtiesStr}
              onChange={(e) => setSpecialtiesStr(e.target.value)}
              placeholder="Ví dụ: Tăng cơ, Giảm mỡ, Pilates"
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="form-label-dark">Giới thiệu ngắn (Bio)</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              className="form-control-dark" 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </Form.Group>

          <button type="submit" className="btn-card-action btn-green w-100 py-2.5">
            {trainerToEdit ? 'Lưu Thông Tin HLV' : 'Thêm Huấn Luyện Viên'}
          </button>
        </Form>
      </div>
    </Modal>
  );
};

export default ManageTrainerModal;
