import React, { useState, useEffect, useCallback } from 'react';
import {
  FaCalendarCheck, FaCheckCircle, FaSearch, FaFilter,
  FaExclamationCircle, FaSyncAlt, FaUserSlash, FaWeight,
  FaRuler, FaPercentage, FaTimes, FaEdit
} from 'react-icons/fa';
import { trainerApi, bookingApi, progressApi } from '../api/apiClient';

const STATUS_MAP = {
  booked: { label: 'Chờ dạy', badge: 'bg-warning text-dark' },
  completed: { label: 'Đã hoàn thành', badge: 'bg-success' },
  cancelled: { label: 'Đã hủy', badge: 'bg-secondary' },
  no_show: { label: 'Học viên vắng', badge: 'bg-danger' }
};

/**
 * Modal xác nhận kết quả buổi tập — A3.1
 */
function ConfirmResultModal({ booking, onClose, onConfirmed }) {
  const [status, setStatus] = useState('completed');
  const [note, setNote] = useState(booking?.note || '');
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [height, setHeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { status, note: note || undefined };
      if (status === 'completed') {
        if (weight) payload.weight = Number(weight);
        if (bodyFat) payload.bodyFat = Number(bodyFat);
        if (height) payload.height = Number(height);
        payload.attendedSessions = 1;
      }
      await bookingApi.confirmResult(booking._id, payload);
      onConfirmed();
    } catch (err) {
      setError(err.message || 'Không thể xác nhận kết quả.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: 'rgba(0,0,0,0.75)', zIndex: 9999 }}
    >
      <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B', width: '100%', maxWidth: 480 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="text-white fw-bold mb-0">Xác nhận kết quả buổi tập</h5>
          <button className="btn-close" onClick={onClose} />
        </div>

        {/* Booking info */}
        <div className="p-3 rounded-3 mb-4" style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)' }}>
          <div className="fw-bold text-white">{booking?.member?.fullName}</div>
          <div className="text-muted small">
            {booking?.date ? new Date(booking.date).toLocaleDateString('vi-VN') : ''} · {booking?.startTime} – {booking?.endTime}
          </div>
        </div>

        {error && (
          <div className="d-flex align-items-center gap-2 p-3 mb-3 rounded-3"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
            <FaExclamationCircle /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Status */}
          <div className="mb-4">
            <label className="form-label-dark mb-2">Kết quả buổi tập *</label>
            <div className="d-flex gap-3">
              <label className="d-flex align-items-center gap-2 cursor-pointer" style={{ cursor: 'pointer' }}>
                <input type="radio" value="completed" checked={status === 'completed'} onChange={() => setStatus('completed')} />
                <span style={{ color: '#00E676', fontWeight: 600 }}>✅ Hoàn thành</span>
              </label>
              <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                <input type="radio" value="no_show" checked={status === 'no_show'} onChange={() => setStatus('no_show')} />
                <span style={{ color: '#EF4444', fontWeight: 600 }}>❌ Học viên vắng</span>
              </label>
            </div>
          </div>

          {/* Chỉ số thể trạng (nếu completed) */}
          {status === 'completed' && (
            <div className="mb-4">
              <label className="form-label-dark mb-2">Ghi chỉ số thể trạng (tùy chọn)</label>
              <div className="row g-2">
                <div className="col-4">
                  <label className="text-muted" style={{ fontSize: '0.75rem' }}><FaWeight className="me-1" />Cân nặng (kg)</label>
                  <input
                    type="number" step="0.1" min="0"
                    className="form-control form-control-dark mt-1"
                    placeholder="68.5"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                  />
                </div>
                <div className="col-4">
                  <label className="text-muted" style={{ fontSize: '0.75rem' }}><FaPercentage className="me-1" />Tỷ lệ mỡ (%)</label>
                  <input
                    type="number" step="0.1" min="0" max="100"
                    className="form-control form-control-dark mt-1"
                    placeholder="18.5"
                    value={bodyFat}
                    onChange={e => setBodyFat(e.target.value)}
                  />
                </div>
                <div className="col-4">
                  <label className="text-muted" style={{ fontSize: '0.75rem' }}><FaRuler className="me-1" />Chiều cao (cm)</label>
                  <input
                    type="number" step="0.1" min="0"
                    className="form-control form-control-dark mt-1"
                    placeholder="170"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Ghi chú */}
          <div className="mb-4">
            <label className="form-label-dark">Ghi chú buổi tập</label>
            <textarea
              className="form-control form-control-dark mt-1"
              rows={2}
              placeholder="Nhận xét về buổi tập, tiến bộ của học viên..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <div className="d-flex gap-3">
            <button
              type="submit"
              className="btn-card-action btn-green flex-grow-1 py-2"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Xác nhận kết quả'}
            </button>
            <button type="button" className="btn-card-action py-2 px-4" style={{ background: '#1E293B', width: 'auto' }} onClick={onClose}>
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * A3.1 — TrainerSchedulePage: PT chỉ thấy lịch liên quan đến mình, có thể xác nhận completed/no_show.
 */
const TrainerSchedulePage = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null); // booking đang xác nhận
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterDate) params.date = filterDate;
      const res = await trainerApi.getSchedule(params);
      setBookings(res.data.bookings || []);
    } catch (err) {
      setError(err.message || 'Không thể tải lịch dạy.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterDate]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const filtered = bookings.filter(b => {
    if (!searchTerm) return true;
    const name = b.member?.fullName?.toLowerCase() || '';
    return name.includes(searchTerm.toLowerCase());
  });

  const handleConfirmed = () => {
    setConfirmTarget(null);
    setSuccessMsg('Xác nhận kết quả thành công! Tiến độ đã được ghi vào hệ thống.');
    setTimeout(() => setSuccessMsg(''), 4000);
    fetchSchedule();
  };

  return (
    <div className="trainer-schedule-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="section-tag">QUẢN LÝ LỊCH DẠY PT</span>
          <h2 className="section-header-title">Lịch Dạy Của Tôi</h2>
          <p className="text-muted mb-0">Xác nhận kết quả buổi tập và ghi tiến độ học viên.</p>
        </div>
        <button
          className="btn-card-action px-3 py-2 d-flex align-items-center gap-2"
          style={{ width: 'auto', background: '#1E293B', fontSize: '0.82rem' }}
          onClick={fetchSchedule}
        >
          <FaSyncAlt /> Làm mới
        </button>
      </div>

      {/* Success */}
      {successMsg && (
        <div className="d-flex align-items-center gap-2 p-3 mb-4 rounded-3"
          style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', color: '#00E676' }}>
          <FaCheckCircle /> {successMsg}
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-3 mb-4 rounded-3 d-flex flex-wrap gap-3 align-items-center" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        {/* Search */}
        <div className="search-box position-relative" style={{ width: '240px' }}>
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Tìm tên học viên..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter status */}
        <div className="d-flex align-items-center gap-2">
          <FaFilter style={{ color: '#64748B', fontSize: '0.8rem' }} />
          <select
            className="form-control form-control-dark"
            style={{ width: 170, fontSize: '0.82rem', padding: '6px 10px' }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_MAP).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* Filter date */}
        <input
          type="date"
          className="form-control form-control-dark"
          style={{ width: 160, fontSize: '0.82rem', padding: '6px 10px' }}
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          title="Lọc theo ngày"
        />

        <div className="text-muted small ms-auto">
          Hiển thị: <strong className="text-white">{filtered.length}</strong> buổi
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="d-flex align-items-center gap-2 p-3 mb-4 rounded-3"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
          <FaExclamationCircle /> {error}
        </div>
      )}

      {/* Table */}
      <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-success" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <FaCalendarCheck style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.4 }} />
            <p>Chưa có lịch dạy nào{filterStatus || filterDate ? ' phù hợp bộ lọc' : ''}.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>HỌC VIÊN</th>
                  <th>NGÀY & GIỜ</th>
                  <th>GÓI TẬP</th>
                  <th>GHI CHÚ</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const st = STATUS_MAP[b.status] || { label: b.status, badge: 'bg-secondary' };
                  return (
                    <tr key={b._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #00E676, #00B0FF)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#0A0F1E', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0
                          }}>
                            {b.member?.fullName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="fw-bold text-white" style={{ fontSize: '0.9rem' }}>{b.member?.fullName || '—'}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{b.member?.phone || b.member?.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ color: '#00E676', fontWeight: 600 }}>
                          {b.date ? new Date(b.date).toLocaleDateString('vi-VN') : '—'}
                        </div>
                        <div className="text-muted small">{b.startTime} – {b.endTime}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                          {b.subscription?.status === 'active' ? '✅ Đang hoạt động' : b.subscription?.status || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted small">{b.note || '—'}</span>
                      </td>
                      <td>
                        <span className={`badge ${st.badge}`}>{st.label}</span>
                      </td>
                      <td>
                        {b.status === 'booked' ? (
                          <button
                            className="btn-card-action btn-green py-1 px-3"
                            style={{ fontSize: '0.78rem', width: 'auto' }}
                            onClick={() => setConfirmTarget(b)}
                          >
                            <FaCheckCircle className="me-1" /> Xác nhận
                          </button>
                        ) : b.status === 'completed' ? (
                          <span style={{ color: '#00E676', fontSize: '0.8rem' }}>✅ Đã xác nhận</span>
                        ) : b.status === 'no_show' ? (
                          <span style={{ color: '#EF4444', fontSize: '0.8rem' }}><FaUserSlash className="me-1" />Vắng mặt</span>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmTarget && (
        <ConfirmResultModal
          booking={confirmTarget}
          onClose={() => setConfirmTarget(null)}
          onConfirmed={handleConfirmed}
        />
      )}
    </div>
  );
};

export default TrainerSchedulePage;
