import { useState, useEffect } from 'react';
import { FaUser, FaDumbbell, FaLock, FaCheckCircle, FaExclamationCircle, FaSave, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa';
import { profileApi } from '../api/apiClient';

/**
 * A2.1 — ProfilePage: Xem và cập nhật hồ sơ cá nhân cho cả 3 role.
 * - Không cho tự đổi role/isActive/ratingAverage
 * - Đổi mật khẩu qua luồng riêng
 * - Trainer thấy thêm tab TrainerProfile
 */
const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: '', msg: '' });

  // Form state cho thông tin cá nhân
  const [form, setForm] = useState({ fullName: '', phone: '', gender: '', dateOfBirth: '' });

  // Form state cho TrainerProfile
  const [trainerForm, setTrainerForm] = useState({
    specialties: '',
    experienceYears: '',
    bio: '',
    certificates: '',
    pricePerSession: ''
  });

  // Form state đổi mật khẩu
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    let active = true;
    profileApi.getMyProfile().then(res => {
      if (!active) return;
      const data = res.data;
      setProfile(data);
      setForm({ fullName: data.fullName || '', phone: data.phone || '', gender: data.gender || '', dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '' });
      if (data.trainerProfile) {
        const tp = data.trainerProfile;
        setTrainerForm({ specialties: (tp.specialties || []).join(', '), experienceYears: tp.experienceYears ?? '', bio: tp.bio || '', certificates: (tp.certificates || []).join(', '), pricePerSession: tp.pricePerSession ?? '' });
      }
    }).catch(error => { if (active) setAlert({ type: 'error', msg: error.message }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function showAlert(type, msg) {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: '', msg: '' }), 4000);
  }

  async function handleSaveInfo(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone || undefined,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined
      };
      await profileApi.updateMyProfile(payload);
      showAlert('success', 'Cập nhật hồ sơ thành công!');
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveTrainer(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        specialties: trainerForm.specialties ? trainerForm.specialties.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        experienceYears: trainerForm.experienceYears !== '' ? Number(trainerForm.experienceYears) : undefined,
        bio: trainerForm.bio || undefined,
        certificates: trainerForm.certificates ? trainerForm.certificates.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        pricePerSession: trainerForm.pricePerSession !== '' ? Number(trainerForm.pricePerSession) : undefined
      };
      await profileApi.updateTrainerProfile(payload);
      showAlert('success', 'Cập nhật hồ sơ huấn luyện viên thành công!');
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showAlert('error', 'Mật khẩu xác nhận không khớp.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      showAlert('error', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    setSaving(true);
    try {
      await profileApi.changePassword(pwForm.currentPassword, pwForm.newPassword);
      showAlert('success', 'Đổi mật khẩu thành công!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setSaving(false);
    }
  }

  const isTrainer = profile?.role === 'trainer';

  const roleBadge = profile?.role === 'admin' ? { cls: 'bg-danger', label: 'Admin' }
    : profile?.role === 'trainer' ? { cls: 'bg-primary', label: 'Huấn luyện viên' }
    : { cls: 'bg-success', label: 'Học viên' };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-success" />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="mb-4">
        <span className="section-tag">TÀI KHOẢN CÁ NHÂN</span>
        <h2 className="section-header-title">Hồ Sơ Của Tôi</h2>
        <p className="text-muted mb-0">Quản lý thông tin cá nhân và bảo mật tài khoản.</p>
      </div>

      {/* Alert */}
      {alert.msg && (
        <div
          className="d-flex align-items-center gap-2 p-3 mb-4 rounded-3"
          style={{
            background: alert.type === 'success' ? 'rgba(0,230,118,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${alert.type === 'success' ? 'rgba(0,230,118,0.4)' : 'rgba(239,68,68,0.4)'}`,
            color: alert.type === 'success' ? '#00E676' : '#EF4444'
          }}
        >
          {alert.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span>{alert.msg}</span>
        </div>
      )}

      {/* User Card */}
      <div className="p-4 rounded-4 mb-4 d-flex align-items-center gap-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #00E676, #00B0FF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#0A0F1E', fontWeight: 700, flexShrink: 0
        }}>
          {profile?.fullName?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h4 className="text-white fw-bold mb-1">{profile?.fullName}</h4>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className={`badge ${roleBadge.cls}`}>{roleBadge.label}</span>
            <span className="text-muted small">{profile?.email}</span>
          </div>
          <div className="text-muted small">
            Tham gia: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : '--'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="billing-toggle-container m-0 mb-4">
        <button className={`toggle-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
          <FaUser className="me-1" /> Thông tin cơ bản
        </button>
        {isTrainer && (
          <button className={`toggle-btn ${activeTab === 'trainer' ? 'active' : ''}`} onClick={() => setActiveTab('trainer')}>
            <FaDumbbell className="me-1" /> Hồ sơ HLV
          </button>
        )}
        <button className={`toggle-btn ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
          <FaLock className="me-1" /> Đổi mật khẩu
        </button>
      </div>

      {/* Tab: Thông tin cơ bản */}
      {activeTab === 'info' && (
        <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
          <h5 className="text-white fw-bold mb-4">Thông tin cá nhân</h5>
          <form onSubmit={handleSaveInfo}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label-dark"><FaUser className="me-1" style={{ color: '#00E676' }} /> Họ và tên *</label>
                <input
                  className="form-control form-control-dark"
                  value={form.fullName}
                  onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label-dark"><FaEnvelope className="me-1" style={{ color: '#00E676' }} /> Email</label>
                <input className="form-control form-control-dark" value={profile?.email || ''} disabled style={{ opacity: 0.5 }} />
                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>Email không thể thay đổi.</div>
              </div>
              <div className="col-md-6">
                <label className="form-label-dark"><FaPhone className="me-1" style={{ color: '#00E676' }} /> Số điện thoại</label>
                <input
                  className="form-control form-control-dark"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="0987654321"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label-dark"><FaCalendarAlt className="me-1" style={{ color: '#00E676' }} /> Ngày sinh</label>
                <input
                  type="date"
                  className="form-control form-control-dark"
                  value={form.dateOfBirth}
                  onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label-dark">Giới tính</label>
                <select
                  className="form-control form-control-dark"
                  value={form.gender}
                  onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                >
                  <option value="">-- Chọn --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="col-md-6 d-flex align-items-end">
                <div className="p-3 rounded-3 w-100" style={{ background: 'rgba(0,230,118,0.06)', border: '1px dashed rgba(0,230,118,0.2)', fontSize: '0.78rem', color: '#64748B' }}>
                  Vai trò: <strong style={{ color: '#00E676' }}>{roleBadge.label}</strong><br />
                  Để thay đổi vai trò, liên hệ quản trị viên.
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button type="submit" className="btn-card-action btn-green px-5 py-2 d-inline-flex align-items-center gap-2" style={{ width: 'auto' }} disabled={saving}>
                <FaSave /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Hồ sơ HLV */}
      {activeTab === 'trainer' && isTrainer && (
        <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
          <h5 className="text-white fw-bold mb-1">Hồ sơ Huấn luyện viên</h5>
          <p className="text-muted small mb-4">Rating và trạng thái hoạt động do Admin quản lý, bạn không thể tự thay đổi.</p>
          {profile?.trainerProfile && (
            <div className="d-flex gap-3 mb-4">
              <div className="p-3 rounded-3 text-center flex-grow-1" style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)' }}>
                <div className="text-muted small">Rating</div>
                <strong style={{ color: '#00E676', fontSize: '1.4rem' }}>⭐ {profile.trainerProfile.ratingAverage}</strong>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>({profile.trainerProfile.ratingCount} đánh giá)</div>
              </div>
              <div className="p-3 rounded-3 text-center flex-grow-1" style={{ background: 'rgba(0,176,255,0.06)', border: '1px solid rgba(0,176,255,0.2)' }}>
                <div className="text-muted small">Giá / buổi</div>
                <strong style={{ color: '#00B0FF', fontSize: '1.2rem' }}>{(profile.trainerProfile.pricePerSession || 0).toLocaleString('vi-VN')} đ</strong>
              </div>
            </div>
          )}
          {!profile?.trainerProfile ? (
            <div className="text-center py-4 text-muted">
              <FaDumbbell style={{ fontSize: '2rem', marginBottom: 8 }} />
              <p>Chưa có hồ sơ HLV. Liên hệ Admin để được tạo.</p>
            </div>
          ) : (
            <form onSubmit={handleSaveTrainer}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label-dark">Chuyên môn (cách nhau bằng dấu phẩy)</label>
                  <input
                    className="form-control form-control-dark"
                    value={trainerForm.specialties}
                    onChange={e => setTrainerForm(p => ({ ...p, specialties: e.target.value }))}
                    placeholder="Gym, Yoga, Cardio..."
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-dark">Số năm kinh nghiệm</label>
                  <input
                    type="number" min="0"
                    className="form-control form-control-dark"
                    value={trainerForm.experienceYears}
                    onChange={e => setTrainerForm(p => ({ ...p, experienceYears: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-dark">Giá / buổi (VNĐ)</label>
                  <input
                    type="number" min="0"
                    className="form-control form-control-dark"
                    value={trainerForm.pricePerSession}
                    onChange={e => setTrainerForm(p => ({ ...p, pricePerSession: e.target.value }))}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label-dark">Giới thiệu bản thân</label>
                  <textarea
                    className="form-control form-control-dark"
                    rows={4}
                    value={trainerForm.bio}
                    onChange={e => setTrainerForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Mô tả kinh nghiệm, phong cách huấn luyện..."
                  />
                </div>
                <div className="col-12">
                  <label className="form-label-dark">Chứng chỉ (cách nhau bằng dấu phẩy)</label>
                  <input
                    className="form-control form-control-dark"
                    value={trainerForm.certificates}
                    onChange={e => setTrainerForm(p => ({ ...p, certificates: e.target.value }))}
                    placeholder="ACE CPT, NSCA, ISSA..."
                  />
                </div>
              </div>
              <div className="mt-4">
                <button type="submit" className="btn-card-action btn-green px-5 py-2 d-inline-flex align-items-center gap-2" style={{ width: 'auto' }} disabled={saving}>
                  <FaSave /> {saving ? 'Đang lưu...' : 'Lưu hồ sơ HLV'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab: Đổi mật khẩu */}
      {activeTab === 'password' && (
        <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
          <h5 className="text-white fw-bold mb-4">Đổi mật khẩu</h5>
          <form onSubmit={handleChangePassword} style={{ maxWidth: 480 }}>
            <div className="mb-3">
              <label className="form-label-dark"><FaLock className="me-1" style={{ color: '#00E676' }} /> Mật khẩu hiện tại *</label>
              <input
                type="password"
                className="form-control form-control-dark"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="mb-3">
              <label className="form-label-dark"><FaLock className="me-1" style={{ color: '#00E676' }} /> Mật khẩu mới * (ít nhất 6 ký tự)</label>
              <input
                type="password"
                className="form-control form-control-dark"
                value={pwForm.newPassword}
                onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="mb-4">
              <label className="form-label-dark"><FaLock className="me-1" style={{ color: '#00E676' }} /> Xác nhận mật khẩu mới *</label>
              <input
                type="password"
                className="form-control form-control-dark"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                required
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn-card-action btn-green px-5 py-2 d-inline-flex align-items-center gap-2" style={{ width: 'auto' }} disabled={saving}>
              <FaLock /> {saving ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
