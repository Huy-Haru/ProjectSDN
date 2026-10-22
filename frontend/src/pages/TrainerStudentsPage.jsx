import { useState, useEffect } from 'react';
import { FaUserFriends, FaDumbbell, FaSearch, FaExclamationCircle, FaSyncAlt } from 'react-icons/fa';
import { trainerApi } from '../api/apiClient';
import CreatePlanModal from '../components/CreatePlanModal';

/**
 * A2.2 — TrainerStudentsPage: PT chỉ thấy hội viên liên quan (có booking với mình), dùng API thật.
 * Cho phép tạo giáo án qua modal kết nối API.
 */
const TrainerStudentsPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    setError('');
    try {
      const res = await trainerApi.getMembers();
      setMembers(res.data.members || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách học viên.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = members.filter(m =>
    m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenPlanModal = (member) => {
    setSelectedMember(member);
    setShowPlanModal(true);
  };

  // Callback sau khi tạo giáo án thành công
  const handlePlanCreated = () => {
    setShowPlanModal(false);
  };

  return (
    <div className="trainer-students-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="section-tag">QUẢN LÝ HỌC VIÊN KÈM 1:1</span>
          <h2 className="section-header-title">Học Viên Của Tôi</h2>
          <p className="text-muted mb-0">Danh sách học viên đã/đang có lịch tập với bạn.</p>
        </div>
        <button
          className="btn-card-action px-3 py-2 d-flex align-items-center gap-2"
          style={{ width: 'auto', background: '#1E293B', fontSize: '0.82rem' }}
          onClick={fetchMembers}
        >
          <FaSyncAlt /> Làm mới
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 mb-4 rounded-3 d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <div className="search-box position-relative" style={{ width: '320px' }}>
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm học viên..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-muted small">
          Tổng số học viên: <strong style={{ color: '#00E676' }}>{filtered.length} học viên</strong>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="d-flex align-items-center gap-2 p-3 mb-4 rounded-3"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
          <FaExclamationCircle /> {error}
        </div>
      )}

      {/* Members Grid */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-success" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <FaUserFriends style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.4 }} />
          <p>Chưa có học viên nào. Học viên sẽ xuất hiện khi họ đặt lịch với bạn.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map(member => (
            <div key={member._id} className="col-lg-6">
              <div className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
                <div>
                  {/* Header */}
                  <div className="d-flex gap-3 align-items-center mb-3">
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #00E676, #00B0FF)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#0A0F1E', fontWeight: 700, fontSize: '1.3rem'
                    }}>
                      {member.fullName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="text-white fw-bold mb-0">{member.fullName}</h5>
                      <div className="text-muted small">{member.phone || member.email}</div>
                    </div>
                    <span className="badge bg-success" style={{ fontSize: '0.7rem' }}>Học viên</span>
                  </div>

                  {/* Stats */}
                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <div className="p-2 rounded-3 text-center" style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.15)' }}>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Tổng buổi</div>
                        <strong style={{ color: '#00E676' }}>{member.totalBookings}</strong>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 rounded-3 text-center" style={{ background: 'rgba(0,176,255,0.06)', border: '1px solid rgba(0,176,255,0.15)' }}>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Hoàn thành</div>
                        <strong style={{ color: '#00B0FF' }}>{member.completedBookings}</strong>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 rounded-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1E293B' }}>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Tham gia</div>
                        <strong className="text-white" style={{ fontSize: '0.75rem' }}>
                          {member.createdAt ? new Date(member.createdAt).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }) : '--'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Latest booking */}
                  {member.latestBooking && (
                    <div className="p-2 rounded-3" style={{ background: 'rgba(0,230,118,0.06)', border: '1px dashed rgba(0,230,118,0.2)', fontSize: '0.78rem' }}>
                      <span className="text-muted">Buổi gần nhất: </span>
                      <strong className="text-white">
                        {new Date(member.latestBooking.date).toLocaleDateString('vi-VN')} {member.latestBooking.startTime}
                      </strong>
                      <span className="ms-2" style={{ color: member.latestBooking.status === 'completed' ? '#00E676' : '#94A3B8' }}>
                        ({member.latestBooking.status})
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="d-flex gap-2 pt-3 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    className="btn-card-action flex-grow-1 py-2"
                    style={{ background: '#1E293B', fontSize: '0.82rem' }}
                    onClick={() => handleOpenPlanModal(member)}
                  >
                    <FaDumbbell className="me-1" /> Tạo Giáo Án
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Workout Plan Modal */}
      <CreatePlanModal
        show={showPlanModal}
        onHide={() => setShowPlanModal(false)}
        student={selectedMember}
        onSubmitPlan={handlePlanCreated}
        useApi={true}
      />
    </div>
  );
};

export default TrainerStudentsPage;
