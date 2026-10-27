import React, { useState, useEffect } from 'react';
import {
  FaCalendarCheck, FaUserFriends, FaStar, FaCheckCircle,
  FaClock, FaExclamationCircle
} from 'react-icons/fa';
import { trainerApi, reviewApi } from '../api/apiClient';

/**
 * A3.2 — TrainerDashboardPage: dùng API thật — lịch dạy hôm nay, số hội viên,
 * rating tổng hợp và danh sách review mới nhất.
 */
const TrainerDashboardPage = ({ user }) => {
  const [todayBookings, setTodayBookings] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [reviewSummary, setReviewSummary] = useState({ ratingAverage: 0, ratingCount: 0 });
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError('');
    try {
      // Lấy lịch hôm nay
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const [scheduleRes, membersRes, reviewsRes] = await Promise.allSettled([
        trainerApi.getSchedule({ date: today }),
        trainerApi.getMembers(),
        reviewApi.getMyTrainerReviews()
      ]);

      if (scheduleRes.status === 'fulfilled') {
        setTodayBookings(scheduleRes.value.data.bookings || []);
      }
      if (membersRes.status === 'fulfilled') {
        setTotalMembers(membersRes.value.data.members?.length || 0);
      }
      if (reviewsRes.status === 'fulfilled') {
        const { reviews, summary } = reviewsRes.value.data;
        setReviewSummary(summary || { ratingAverage: 0, ratingCount: 0 });
        setRecentReviews((reviews || []).slice(0, 5));
      }
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu dashboard.');
    } finally {
      setLoading(false);
    }
  }

  const bookedToday = todayBookings.filter(b => b.status === 'booked').length;
  const completedToday = todayBookings.filter(b => b.status === 'completed').length;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" />
        <p className="text-muted mt-3" style={{ fontSize: '0.85rem' }}>Đang tải dashboard...</p>
      </div>
    );
  }

  return (
    <div className="trainer-dashboard-page">
      {/* Banner */}
      <div
        className="p-4 rounded-4 mb-4 position-relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f241e 0%, #0f172a 100%)', border: '1px solid #00E676' }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <span className="badge px-3 py-1 mb-2" style={{ background: '#00E676', color: '#080D16', fontWeight: 800 }}>
              PORTAL HUẤN LUYỆN VIÊN (PT)
            </span>
            <h2 className="text-white fw-bold display-6 mb-1">
              Xin chào, <span style={{ color: '#00E676' }}>{user?.fullName || user?.name}</span>! 🏋️‍♂️
            </h2>
            <p className="text-muted mb-0">
              Hôm nay bạn có <strong className="text-white">{bookedToday} buổi dạy chờ xác nhận</strong>
              {completedToday > 0 && <> và <strong style={{ color: '#00E676' }}>{completedToday} đã hoàn thành</strong></>}.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge p-2 rounded-3 fs-6" style={{ background: 'rgba(255,193,7,0.15)', color: '#FFC107' }}>
              <FaStar className="me-1" />
              {reviewSummary.ratingAverage > 0
                ? `${Number(reviewSummary.ratingAverage).toFixed(1)} Rating (${reviewSummary.ratingCount} đánh giá)`
                : 'Chưa có đánh giá'}
            </span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="d-flex align-items-center gap-2 p-3 mb-4 rounded-3"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
          <FaExclamationCircle /> {error}
        </div>
      )}

      {/* 4 Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>BUỔI DẠY HÔM NAY</span>
              <FaCalendarCheck style={{ color: '#00E676', fontSize: '1.2rem' }} />
            </div>
            <div className="fs-2 fw-bold text-white mb-1">{todayBookings.length} Buổi</div>
            <div style={{ fontSize: '0.78rem', color: '#00E676' }}>
              {bookedToday} chờ · {completedToday} xong
              {todayBookings.length > 0 && (
                <div className="text-muted mt-1">
                  {todayBookings.slice(0, 2).map(b => b.startTime).join(' & ')}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>HỌC VIÊN ĐANG KÈM</span>
              <FaUserFriends style={{ color: '#3B82F6', fontSize: '1.2rem' }} />
            </div>
            <div className="fs-2 fw-bold text-white mb-1">{totalMembers} Học viên</div>
            <div style={{ fontSize: '0.78rem', color: '#3B82F6' }}>Đã/đang có lịch tập với bạn</div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>ĐÁNH GIÁ TRUNG BÌNH</span>
              <FaStar style={{ color: '#FFC107', fontSize: '1.2rem' }} />
            </div>
            <div className="fs-2 fw-bold text-white mb-1">
              {reviewSummary.ratingAverage > 0 ? Number(reviewSummary.ratingAverage).toFixed(1) : '—'}
              <span className="fs-6 text-muted fw-normal ms-1">/ 5</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#FFC107' }}>
              {reviewSummary.ratingCount > 0 ? `${reviewSummary.ratingCount} lượt đánh giá` : 'Chưa có đánh giá'}
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>BUỔI HOÀN THÀNH HÔM NAY</span>
              <FaCheckCircle style={{ color: '#A855F7', fontSize: '1.2rem' }} />
            </div>
            <div className="fs-2 fw-bold text-white mb-1">{completedToday} Buổi</div>
            <div style={{ fontSize: '0.78rem', color: '#A855F7' }}>
              {bookedToday > 0 ? `Còn ${bookedToday} buổi chờ xác nhận` : 'Đã hoàn thành tất cả'}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Today's Schedule */}
        <div className="col-lg-7">
          <div className="p-4 rounded-4 h-100" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-white fw-bold mb-0">Lịch Dạy Hôm Nay</h5>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {todayBookings.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <FaCalendarCheck style={{ fontSize: '2rem', opacity: 0.4, marginBottom: 12 }} />
                <p>Hôm nay không có lịch dạy nào.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {todayBookings.map(b => (
                  <div key={b._id} className="d-flex align-items-center gap-3 p-3 rounded-3"
                    style={{ background: '#0A0F1E', border: '1px solid #1E293B' }}>
                    {/* Avatar */}
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #00E676, #00B0FF)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#0A0F1E', fontWeight: 700
                    }}>
                      {b.member?.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold text-white">{b.member?.fullName || '—'}</div>
                      <div className="text-muted small">{b.startTime} – {b.endTime}</div>
                    </div>
                    <div>
                      {b.status === 'booked' && (
                        <span className="badge bg-warning text-dark">Chờ dạy</span>
                      )}
                      {b.status === 'completed' && (
                        <span className="badge bg-success">✅ Hoàn thành</span>
                      )}
                      {b.status === 'no_show' && (
                        <span className="badge bg-danger">Vắng mặt</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="col-lg-5">
          <div className="p-4 rounded-4 h-100" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-white fw-bold mb-0">Đánh Giá Mới Nhất</h5>
              {reviewSummary.ratingAverage > 0 && (
                <span className="badge" style={{ background: 'rgba(255,193,7,0.15)', color: '#FFC107' }}>
                  ⭐ {Number(reviewSummary.ratingAverage).toFixed(1)}
                </span>
              )}
            </div>

            {recentReviews.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <FaStar style={{ fontSize: '2rem', opacity: 0.3, marginBottom: 12 }} />
                <p>Chưa có đánh giá nào.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {recentReviews.map(rev => (
                  <div key={rev._id} className="p-3 rounded-3" style={{ background: '#0A0F1E', border: '1px solid #1E293B' }}>
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div className="fw-bold text-white" style={{ fontSize: '0.88rem' }}>
                        {rev.member?.fullName || '—'}
                      </div>
                      <div className="d-flex text-warning" style={{ fontSize: '0.8rem' }}>
                        {[...Array(rev.rating)].map((_, i) => <FaStar key={i} />)}
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-muted mb-1" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                        "{rev.comment}"
                      </p>
                    )}
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboardPage;
