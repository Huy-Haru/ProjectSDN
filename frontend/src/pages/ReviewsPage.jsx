import React, { useState, useEffect, useCallback } from 'react';
import { FaStar, FaQuoteLeft, FaExclamationCircle, FaSyncAlt } from 'react-icons/fa';
import { reviewApi } from '../api/apiClient';

/**
 * A3.2 — ReviewsPage: Dùng được cho cả 2 trường hợp:
 *  1. PT xem reviews của mình (role=trainer) — dùng reviewApi.getMyTrainerReviews()
 *  2. Member xem danh sách review (prop: reviews) — giữ nguyên flow cũ cho Hiếu tích hợp
 *
 * Props:
 *  - role: 'trainer' | 'member'
 *  - reviews: array (cho member, từ App.jsx)
 *  - onOpenReviewModal: function (cho member)
 */
const ReviewsPage = ({ role, reviews: propReviews, onOpenReviewModal }) => {
  const isTrainer = role === 'trainer';

  // Trainer: load từ API
  const [apiReviews, setApiReviews] = useState([]);
  const [summary, setSummary] = useState({ ratingAverage: 0, ratingCount: 0 });
  const [loading, setLoading] = useState(isTrainer);
  const [error, setError] = useState('');

  const fetchMyReviews = useCallback(async () => {
    if (!isTrainer) return;
    setLoading(true);
    setError('');
    try {
      const res = await reviewApi.getMyTrainerReviews();
      setApiReviews(res.data.reviews || []);
      setSummary(res.data.summary || { ratingAverage: 0, ratingCount: 0 });
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách đánh giá.');
    } finally {
      setLoading(false);
    }
  }, [isTrainer]);

  useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  const reviews = isTrainer ? apiReviews : (propReviews || []);

  // Distribution of ratings
  const ratingDist = [5, 4, 3, 2, 1].map(r => ({
    star: r,
    count: reviews.filter(rv => rv.rating === r).length
  }));

  return (
    <div className="reviews-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="section-tag">ĐÁNH GIÁ & PHẢN HỒI</span>
          <h2 className="section-header-title">
            {isTrainer ? 'Đánh Giá Từ Học Viên' : 'Đánh Giá Huấn Luyện Viên (PT)'}
          </h2>
          <p className="text-muted mb-0">
            {isTrainer
              ? 'Phản hồi từ học viên sau các buổi tập hoàn thành.'
              : 'Nhận xét chất lượng giảng dạy, thái độ phục vụ và hiệu quả tập luyện.'}
          </p>
        </div>

        {isTrainer ? (
          <button
            className="btn-card-action px-3 py-2 d-flex align-items-center gap-2"
            style={{ width: 'auto', background: '#1E293B', fontSize: '0.82rem' }}
            onClick={fetchMyReviews}
          >
            <FaSyncAlt /> Làm mới
          </button>
        ) : (
          <button
            className="btn-card-action btn-green d-flex align-items-center gap-2 py-2 px-4"
            style={{ width: 'auto' }}
            onClick={() => onOpenReviewModal && onOpenReviewModal(null)}
          >
            <FaStar className="me-1" /> Viết Đánh Giá
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="d-flex align-items-center gap-2 p-3 mb-4 rounded-3"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
          <FaExclamationCircle /> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-success" /></div>
      ) : (
        <>
          {/* Summary Header */}
          <div className="p-4 rounded-4 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-4"
            style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex align-items-center gap-4">
              <div>
                <div className="display-4 fw-bold text-warning">
                  {summary.ratingAverage > 0 ? Number(summary.ratingAverage).toFixed(1) : '—'}
                </div>
                <div className="d-flex text-warning fs-5 gap-1 my-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <FaStar key={s} style={{ color: s <= Math.round(summary.ratingAverage) ? '#FFC107' : '#334155' }} />
                  ))}
                </div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {summary.ratingCount > 0 ? `Dựa trên ${summary.ratingCount} đánh giá` : 'Chưa có đánh giá'}
                </div>
              </div>

              {/* Rating distribution (chỉ hiển thị khi có data) */}
              {reviews.length > 0 && (
                <div className="d-flex flex-column gap-1" style={{ minWidth: 200 }}>
                  {ratingDist.map(({ star, count }) => (
                    <div key={star} className="d-flex align-items-center gap-2" style={{ fontSize: '0.78rem' }}>
                      <span className="text-muted" style={{ width: 16 }}>{star}</span>
                      <FaStar style={{ color: '#FFC107', fontSize: '0.75rem' }} />
                      <div style={{ flex: 1, height: 6, background: '#1E293B', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%`,
                          height: '100%',
                          background: '#FFC107',
                          borderRadius: 3,
                          transition: 'width 0.5s'
                        }} />
                      </div>
                      <span className="text-muted" style={{ width: 20, textAlign: 'right' }}>{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-5 text-muted p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
              <FaStar style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.3 }} />
              <p>Chưa có đánh giá nào.{isTrainer ? ' Đánh giá sẽ xuất hiện sau khi học viên gửi nhận xét.' : ''}</p>
            </div>
          ) : (
            <div className="row g-4">
              {reviews.map((rev, idx) => (
                <div key={rev._id || rev.id || idx} className="col-lg-6">
                  <div className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between"
                    style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-3">
                          {/* Avatar */}
                          {rev.member?.avatar ? (
                            <img
                              src={rev.member.avatar}
                              alt={rev.member?.fullName}
                              style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #00E676' }}
                            />
                          ) : (
                            <div style={{
                              width: 48, height: 48, borderRadius: '50%',
                              background: 'linear-gradient(135deg, #00E676, #00B0FF)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#0A0F1E', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0
                            }}>
                              {(rev.member?.fullName || rev.studentName || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h6 className="text-white fw-bold mb-0">
                              {rev.member?.fullName || rev.trainerName || rev.studentName || '—'}
                            </h6>
                            {rev.booking?.date && (
                              <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                Buổi: {new Date(rev.booking.date).toLocaleDateString('vi-VN')}
                                {rev.booking.startTime ? ` · ${rev.booking.startTime}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="d-flex text-warning">
                          {[...Array(rev.rating)].map((_, i) => <FaStar key={i} />)}
                        </div>
                      </div>

                      {rev.comment && (
                        <p className="text-muted fst-italic mb-3" style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
                          <FaQuoteLeft className="me-2 text-secondary" />
                          "{rev.comment}"
                        </p>
                      )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-3"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="badge" style={{ background: 'rgba(255,193,7,0.15)', color: '#FFC107' }}>
                        {'⭐'.repeat(rev.rating)} {rev.rating}/5
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : rev.date || ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewsPage;
