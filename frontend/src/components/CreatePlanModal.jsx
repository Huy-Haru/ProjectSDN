import React, { useState } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { FaDumbbell, FaCalendarAlt, FaBullseye, FaUserCheck } from 'react-icons/fa';

const CreatePlanModal = ({ show, onHide, student, onSubmitPlan }) => {
  const [planName, setPlanName] = useState('Lộ Trình Tăng Cơ & Siêu Giảm Mỡ 8 Tuần');
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [goal, setGoal] = useState('Giảm 3kg mỡ & Tăng 2kg cơ bắp');
  const [frequency, setFrequency] = useState('3 buổi / tuần');
  const [notes, setNotes] = useState('Tập trung các bài tập Compound (Bench Press, Squat, Deadlift) và bổ sung 25g Whey Protein sau tập.');

  if (!student) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitPlan({
      studentId: student.id,
      studentName: student.name,
      planName,
      durationWeeks,
      goal,
      frequency,
      notes,
      createdDate: new Date().toLocaleDateString('vi-VN')
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" contentClassName="modal-content-dark">
      <div className="modal-header-dark d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <FaDumbbell style={{ color: '#00E676' }} />
          <h5 className="modal-title mb-0">Tạo Kế Hoạch Tập Luyện Dành Cho Học Viên</h5>
        </div>
        <button type="button" className="btn-close" onClick={onHide}></button>
      </div>

      <div className="modal-body-dark">
        <div 
          className="p-3 mb-4 rounded-3 d-flex align-items-center gap-3"
          style={{ background: 'rgba(0, 230, 118, 0.08)', border: '1px solid rgba(0, 230, 118, 0.3)' }}
        >
          <img 
            src={student.avatar} 
            alt={student.name} 
            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00E676' }} 
          />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#00E676', fontWeight: 800 }}>HỌC VIÊN ĐƯỢC CHỈ ĐỊNH</div>
            <div className="fw-bold text-white fs-6">{student.name} — {student.packageName}</div>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Cân nặng hiện tại: {student.currentWeight} kg | Mục tiêu: {student.targetWeight} kg</div>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="form-label-dark">Tên Kế Hoạch / Lộ Trình</Form.Label>
            <Form.Control 
              type="text" 
              className="form-control-dark" 
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              required
            />
          </Form.Group>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="form-label-dark">
                  <FaCalendarAlt className="me-2" style={{ color: '#00E676' }} /> Thời lượng kế hoạch
                </Form.Label>
                <Form.Select 
                  className="form-control-dark"
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(e.target.value)}
                >
                  <option value={4}>4 Tuần (1 Tháng)</option>
                  <option value={8}>8 Tuần (2 Tháng)</option>
                  <option value={12}>12 Tuần (3 Tháng)</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="form-label-dark">Tần suất tập luyện cùng PT</Form.Label>
                <Form.Select 
                  className="form-control-dark"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="2 buổi / tuần">2 buổi / tuần</option>
                  <option value="3 buổi / tuần">3 buổi / tuần (Khuyên dùng)</option>
                  <option value="4 buổi / tuần">4 buổi / tuần</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="form-label-dark">
              <FaBullseye className="me-2" style={{ color: '#00E676' }} /> Mục tiêu chỉ số mong muốn
            </Form.Label>
            <Form.Control 
              type="text" 
              className="form-control-dark" 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="form-label-dark">Chi tiết bài tập & Hướng dẫn dinh dưỡng</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              className="form-control-dark" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Form.Group>

          <button type="submit" className="btn-card-action btn-green w-100 py-2.5">
            Lưu Kế Hoạch Tập Luyện
          </button>
        </Form>
      </div>
    </Modal>
  );
};

export default CreatePlanModal;
