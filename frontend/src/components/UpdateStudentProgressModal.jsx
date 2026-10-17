import React, { useState, useEffect } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { FaWeight, FaChartLine, FaCommentMedical } from 'react-icons/fa';

const UpdateStudentProgressModal = ({ show, onHide, student, onUpdateProgress }) => {
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (student) {
      setWeight(student.currentWeight || '');
      setBodyFat(student.bodyFat || '');
      setNotes('');
    }
  }, [student]);

  if (!student) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProgress({
      studentId: student.id,
      weight: parseFloat(weight),
      bodyFat: bodyFat ? parseFloat(bodyFat) : student.bodyFat,
      notes: notes || 'Học viên đáp ứng tốt với khối lượng tạ tăng dần.',
      updatedDate: new Date().toLocaleDateString('vi-VN')
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="modal-content-dark">
      <div className="modal-header-dark d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <FaChartLine style={{ color: '#00E676' }} />
          <h5 className="modal-title mb-0">Cập Nhật Tiến Độ Học Viên</h5>
        </div>
        <button type="button" className="btn-close" onClick={onHide}></button>
      </div>

      <div className="modal-body-dark">
        <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
          <img src={student.avatar} alt={student.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00E676' }} />
          <div>
            <h6 className="text-white fw-bold mb-0">{student.name}</h6>
            <div className="text-muted small">Cân nặng hiện tại: <strong className="text-white">{student.currentWeight} kg</strong></div>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="form-label-dark">
                  <FaWeight className="me-2" style={{ color: '#00E676' }} /> Cân nặng mới (kg)
                </Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.1" 
                  className="form-control-dark" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="form-label-dark">Tỷ lệ mỡ Body Fat (%)</Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.1" 
                  className="form-control-dark" 
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-4">
            <Form.Label className="form-label-dark">
              <FaCommentMedical className="me-2" style={{ color: '#00E676' }} /> Ghi chú chuyên môn HLV
            </Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              className="form-control-dark" 
              placeholder="Nhận xét về thể trạng, sức bền, việc tuân thủ dinh dưỡng của học viên..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Form.Group>

          <button type="submit" className="btn-card-action btn-green w-100 py-2.5">
            Lưu Cập Nhật Tiến Độ
          </button>
        </Form>
      </div>
    </Modal>
  );
};

export default UpdateStudentProgressModal;
