import { useState } from 'react';
import { Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import { FaDumbbell, FaPlus, FaTrash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { trainerApi } from '../api/apiClient';

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

const emptyItem = () => ({ dayOfWeek: '', exerciseName: '', sets: '', reps: '', note: '' });

/**
 * A2.2 — CreatePlanModal: Tạo giáo án tập luyện.
 * Props:
 *   - useApi (bool): nếu true thì gọi API thật, nếu false dùng mock callback cũ
 *   - student: { _id, fullName } hoặc { id, name } (tùy mode)
 *   - onSubmitPlan: callback sau khi tạo xong
 */
const CreatePlanModal = ({ show, onHide, student, onSubmitPlan, useApi = false }) => {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    title: '',
    goal: '',
    startDate: today,
    endDate: '',
    items: [emptyItem()]
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!student) return null;

  // Hỗ trợ cả 2 kiểu data: API thật (_id) và mock (id)
  const memberId = student._id || student.id;
  const memberName = student.fullName || student.name;

  function handleItemChange(idx, field, value) {
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, items };
    });
  }

  function addItem() {
    setForm(prev => ({ ...prev, items: [...prev.items, emptyItem()] }));
  }

  function removeItem(idx) {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) { setError('Tiêu đề giáo án là bắt buộc.'); return; }
    if (!form.endDate) { setError('Ngày kết thúc là bắt buộc.'); return; }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError('Ngày kết thúc phải sau ngày bắt đầu.'); return;
    }

    // Validate items
    for (const item of form.items) {
      if (!item.exerciseName.trim()) { setError('Tên bài tập không được để trống.'); return; }
      if (!item.sets || isNaN(item.sets) || Number(item.sets) < 1) { setError('Số hiệp phải là số dương.'); return; }
      if (!item.reps.trim()) { setError('Số lần lặp không được để trống.'); return; }
    }

    setLoading(true);
    try {
      if (useApi) {
        // Gọi API thật
        const payload = {
          memberId,
          title: form.title.trim(),
          goal: form.goal.trim() || undefined,
          startDate: form.startDate,
          endDate: form.endDate,
          items: form.items.map(it => ({
            dayOfWeek: it.dayOfWeek || undefined,
            exerciseName: it.exerciseName.trim(),
            sets: Number(it.sets),
            reps: it.reps.trim(),
            note: it.note.trim() || undefined
          }))
        };
        await trainerApi.createWorkoutPlan(payload);
        setSuccess(true);
        onSubmitPlan && onSubmitPlan();
      } else {
        // Fallback mock mode
        onSubmitPlan && onSubmitPlan({ studentId: memberId, planName: form.title });
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Không thể tạo giáo án. Thử lại.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setForm({ title: '', goal: '', startDate: today, endDate: '', items: [emptyItem()] });
    setSuccess(false);
    setError('');
    onHide();
  }

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" contentClassName="modal-content-dark">
      <div className="modal-header-dark d-flex justify-content-between align-items-center">
        <div>
          <span className="section-tag d-block mb-1" style={{ fontSize: '0.6rem' }}>TẠO GIÁO ÁN TẬP LUYỆN</span>
          <h5 className="modal-title mb-0 d-flex align-items-center gap-2">
            <FaDumbbell style={{ color: '#00E676' }} />
            Kế hoạch cho: <span style={{ color: '#00E676' }}>{memberName}</span>
          </h5>
        </div>
        <button type="button" className="btn-close" onClick={handleClose} aria-label="Close" />
      </div>

      <div className="modal-body-dark">
        {success ? (
          <div className="text-center py-4">
            <FaCheckCircle style={{ fontSize: '3rem', color: '#00E676' }} className="mb-3" />
            <h5 className="text-white fw-bold">Tạo giáo án thành công!</h5>
            <p className="text-muted">Giáo án đã được lưu vào MongoDB. Học viên có thể xem ngay.</p>
            <button className="btn-card-action btn-green px-5" onClick={handleClose}>Đóng</button>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && (
              <div className="d-flex align-items-center gap-2 p-3 mb-3 rounded-3"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
                <FaExclamationCircle /> <span style={{ fontSize: '0.88rem' }}>{error}</span>
              </div>
            )}

            <Row className="g-3 mb-3">
              <Col md={8}>
                <Form.Label className="form-label-dark">Tiêu đề giáo án *</Form.Label>
                <Form.Control
                  className="form-control-dark"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="VD: Giảm mỡ - Tháng 1"
                  required
                />
              </Col>
              <Col md={4}>
                <Form.Label className="form-label-dark">Mục tiêu</Form.Label>
                <Form.Control
                  className="form-control-dark"
                  value={form.goal}
                  onChange={e => setForm(p => ({ ...p, goal: e.target.value }))}
                  placeholder="Giảm 5kg, tăng cơ..."
                />
              </Col>
              <Col md={6}>
                <Form.Label className="form-label-dark">Ngày bắt đầu *</Form.Label>
                <Form.Control
                  type="date"
                  className="form-control-dark"
                  value={form.startDate}
                  onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label className="form-label-dark">Ngày kết thúc *</Form.Label>
                <Form.Control
                  type="date"
                  className="form-control-dark"
                  value={form.endDate}
                  onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                  required
                />
              </Col>
            </Row>

            {/* Exercise Items */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="form-label-dark mb-0">Danh sách bài tập *</Form.Label>
                <button
                  type="button"
                  className="btn-card-action btn-green px-3 py-1 d-flex align-items-center gap-1"
                  style={{ width: 'auto', fontSize: '0.78rem' }}
                  onClick={addItem}
                >
                  <FaPlus /> Thêm bài tập
                </button>
              </div>

              <div className="d-flex flex-column gap-2">
                {form.items.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-3" style={{ background: '#0A0F1E', border: '1px solid #1E293B' }}>
                    <Row className="g-2 align-items-end">
                      <Col md={2}>
                        <Form.Label className="form-label-dark" style={{ fontSize: '0.72rem' }}>Ngày</Form.Label>
                        <Form.Select
                          className="form-control-dark"
                          style={{ fontSize: '0.8rem', padding: '6px 8px' }}
                          value={item.dayOfWeek}
                          onChange={e => handleItemChange(idx, 'dayOfWeek', e.target.value)}
                        >
                          <option value="">--</option>
                          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </Form.Select>
                      </Col>
                      <Col md={4}>
                        <Form.Label className="form-label-dark" style={{ fontSize: '0.72rem' }}>Tên bài tập *</Form.Label>
                        <Form.Control
                          className="form-control-dark"
                          style={{ fontSize: '0.8rem' }}
                          value={item.exerciseName}
                          onChange={e => handleItemChange(idx, 'exerciseName', e.target.value)}
                          placeholder="Push-up, Squat..."
                          required
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Label className="form-label-dark" style={{ fontSize: '0.72rem' }}>Hiệp *</Form.Label>
                        <Form.Control
                          type="number" min="1"
                          className="form-control-dark"
                          style={{ fontSize: '0.8rem' }}
                          value={item.sets}
                          onChange={e => handleItemChange(idx, 'sets', e.target.value)}
                          required
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Label className="form-label-dark" style={{ fontSize: '0.72rem' }}>Lần (reps) *</Form.Label>
                        <Form.Control
                          className="form-control-dark"
                          style={{ fontSize: '0.8rem' }}
                          value={item.reps}
                          onChange={e => handleItemChange(idx, 'reps', e.target.value)}
                          placeholder="12 hoặc 8-12"
                          required
                        />
                      </Col>
                      <Col md={1} className="d-flex align-items-end">
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6 }}
                          onClick={() => removeItem(idx)}
                          disabled={form.items.length === 1}
                          title="Xóa bài tập"
                        >
                          <FaTrash />
                        </button>
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <Form.Control
                          className="form-control-dark"
                          style={{ fontSize: '0.78rem' }}
                          value={item.note}
                          onChange={e => handleItemChange(idx, 'note', e.target.value)}
                          placeholder="Ghi chú thêm cho bài tập này..."
                        />
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-2">
              <button type="button" className="btn-card-action px-4" style={{ width: 'auto' }} onClick={handleClose} disabled={loading}>
                Hủy
              </button>
              <button
                id="create-plan-submit-btn"
                type="submit"
                className="btn-card-action btn-green px-5 d-flex align-items-center gap-2"
                style={{ width: 'auto' }}
                disabled={loading}
              >
                {loading && <Spinner animation="border" size="sm" />}
                {loading ? 'Đang lưu...' : 'Tạo giáo án'}
              </button>
            </div>
          </Form>
        )}
      </div>
    </Modal>
  );
};

export default CreatePlanModal;
