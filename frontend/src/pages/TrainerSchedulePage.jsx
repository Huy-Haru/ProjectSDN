import { useState, useCallback } from 'react';
import { FaCalendarCheck, FaSearch, FaFilter, FaExclamationCircle, FaSyncAlt } from 'react-icons/fa';
import { trainerApi } from '../api/apiClient';
import { useApiResource } from '../hooks/useApiResource';

const STATUS_MAP = {
  booked: { label: 'Chờ dạy', badge: 'bg-warning text-dark' },
  completed: { label: 'Đã dạy xong', badge: 'bg-success' },
  cancelled: { label: 'Đã hủy', badge: 'bg-secondary' },
  no_show: { label: 'Học viên vắng', badge: 'bg-danger' }
};

/**
 * A2.2 — TrainerSchedulePage: PT chỉ thấy lịch liên quan đến mình, dùng API thật.
 */
const TrainerSchedulePage = () => {
  const [pending, setPending] = useState(null);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState('');
  const [message, setMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const load = useCallback(async () => {
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterDate) params.date = filterDate;
    const res = await trainerApi.getSchedule(params);
    return res.data.bookings || [];
  }, [filterStatus, filterDate]);
  const { data: bookings, loading, error, reload: fetchSchedule } = useApiResource(load, JSON.stringify([filterStatus, filterDate]));

  async function confirmStatus() {
    setSaving(true); setFailure(''); setMessage('');
    try {
      await trainerApi.setBookingStatus(pending.id, pending.status);
      setPending(null); setMessage('Đã cập nhật buổi tập.'); fetchSchedule();
    } catch (err) { setFailure(err.message); }
    finally { setSaving(false); }
  }
  const filtered = bookings.filter(b => {
    if (!searchTerm) return true;
    const name = b.member?.fullName?.toLowerCase() || '';
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="trainer-schedule-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="section-tag">QUẢN LÝ LỊCH DẠY PT</span>
          <h2 className="section-header-title">Lịch Dạy Của Tôi</h2>
          <p className="text-muted mb-0">Chỉ hiển thị các buổi tập được đặt với bạn từ MongoDB.</p>
        </div>
        <button
          className="btn-card-action px-3 py-2 d-flex align-items-center gap-2"
          style={{ width: 'auto', background: '#1E293B', fontSize: '0.82rem' }}
          onClick={fetchSchedule}
        >
          <FaSyncAlt /> Làm mới
        </button>
      </div>

      {message && <p role="status">{message}</p>}
      {failure && <p role="alert">{failure}</p>}
      {pending && <div role="group" aria-label="Xác nhận buổi tập" className="border rounded-3 p-3 mb-3">
        <p>Xác nhận {pending.status === 'completed' ? 'hoàn thành' : 'học viên vắng mặt'}: {pending.name}, {pending.date} {pending.time}?</p>
        <button className="btn btn-success me-2" disabled={saving} onClick={confirmStatus}>Xác nhận buổi tập</button>
        <button className="btn btn-secondary" disabled={saving} onClick={() => { setPending(null); setFailure(''); }}>Quay lại</button>
      </div>}
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
                  <th>XÁC NHẬN</th>
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
                          {b.date ? new Date(b.date).toLocaleDateString('vi-VN', {timeZone:'UTC'}) : '—'}
                        </div>
                        <div className="text-muted small">{b.startTime} – {b.endTime}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                          {b.subscription?.status === 'active' ? '✅ Gói đang hoạt động' : b.subscription?.status || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted small">{b.note || '—'}</span>
                      </td>
                      <td>
                        <span className={`badge ${st.badge}`}>{st.label}</span>
                      </td>
                      <td>
                        {b.status === 'booked' && <div className="d-flex gap-2">
                          {['completed', 'no_show'].map(status => <button key={status} className="btn btn-sm btn-outline-success" disabled={saving} onClick={() => { setFailure(''); setMessage(''); setPending({id:b._id,status,name:b.member?.fullName || 'Hội viên',date:b.date?.slice(0,10),time:b.startTime}); }}>{status === 'completed' ? 'Hoàn thành buổi' : 'Ghi nhận vắng'}</button>)}
                        </div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerSchedulePage;
