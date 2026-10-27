import React, { useState, useEffect } from 'react';
import { Modal, Form, Spinner } from 'react-bootstrap';
import { FaStar, FaCommentAlt, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import { reviewApi } from '../api/apiClient';

/**
 * A3.2 — RateTrainerModal: Member gửi đánh giá PT sau buổi tập completed.
 * Yêu cầu bookingId (booking đã completed, chưa review).
 *
 * Props:
 *  - show: boolean
 *  - onHide: function
 *  - trainerToReview: { bookingId, trainerName } — thông tin về buổi cần review
 *  - onSubmitReview: function(review) — callback khi gửi thành công
 */
const RateTrainerModal = ({ show, onHide, trainerToReview, onSubmitReview }) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (show) {
      // Reset khi mở modal
      setRating(5);
      setHoveredRating(0);
      setComment('');
      setError('');
      setSuccess(false);
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trainerToReview?.bookingId) {
      setError('Không tìm thấy thông tin buổi tập để đánh giá. Chọn một buổi đã hoàn thành.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await reviewApi.create({
        bookingId: trainerToReview.bookingId,
        rating,
        comment: comment.trim() || undefined
      });
      setSuccess(true);
      if (onSubmitReview) onSubmitReview(res.data.review);
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Gửi đánh giá thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) onHide();
  };

  const displayRating = hoveredRating || rating;

  const ratingLabels = { 1: 'Rất tệ', 2: 'Tệ', 3: 'Bình thường', 4: 'Tốt', 5: 'Xuất sắc' };

  return (
    <Modal show={show} onHide={handleClose} centered contentClassName="modal-content-dark">
      <div className="modal-header-dark d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <FaCommentAlt style={{ color: '#00E676' }} />
          <h5 className="modal-title mb-0">Đánh Giá Huấn Luyện Viên</h5>
        </div>
        <button type="button" className="btn-close" onClick={handleClose} disabled={loading} />
      </div>

      <div className="modal-body-dark">
        {/* Trainer info */}
        {trainerToReview?.trainerName && (
          <div className="p-3 mb-4 rounded-3 d-flex align-items-center gap-3"
            style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, #00E676, #00B0FF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0A0F1E', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0
            }}>
              {trainerToReview.trainerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="fw-bold text-white">{trainerToReview.trainerName}</div>
              {trainerToReview.date && (
                <div className="text-muted small">
                  Buổi tập: {new Date(trainerToReview.date).toLocaleDateString('vi-VN')}
                  {trainerToReview.startTime ? ` · ${trainerToReview.startTime}` : ''}
                </div>
              )}
            </div>
          </div>
        )}

        {/* No bookingId warning */}
        {!trainerToReview?.bookingId && (
          <div className="d-flex align-items-center gap-2 p-3 mb-4 rounded-3"
            style={{ background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.3)', color: '#FFC107' }}>
            <FaExclamationCircle />
            <span style={{ fontSize: '0.88rem' }}>
              Bạn cần chọn một buổi tập đã hoàn thành để đánh giá. Vui lòng vào trang Lịch tập.
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="d-flex align-items-center gap-2 p-3 mb-3 rounded-3"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
            <FaExclamationCircle />
            <span style={{ fontSize: '0.88rem' }}>{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="d-flex align-items-center gap-2 p-3 mb-3 rounded-3"
            style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', color: '#00E676' }}>
            <FaCheckCircle />
            <span style={{ fontSize: '0.88rem' }}>Đánh giá đã được gửi thành công!</span>
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <Form.Group className="mb-4">
            <Form.Label className="form-label-dark">Mức độ hài lòng *</Form.Label>
            <div className="d-flex gap-2 align-items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="btn p-0 border-0 bg-transparent"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={loading || success}
                >
                  <FaStar
                    style={{
                      fontSize: '2rem',
                      color: star <= displayRating ? '#FFC107' : '#334155',
                      cursor: 'pointer',
                      transition: 'color 0.15s, transform 0.15s',
                      transform: star <= displayRating ? 'scale(1.15)' : 'scale(1)'
                    }}
                  />
                </button>
              ))}
              <span className="ms-2 fw-bold text-warning">
                {ratingLabels[displayRating]}
              </span>
            </div>
          </Form.Group>

          {/* Comment */}
          <Form.Group className="mb-4">
            <Form.Label className="form-label-dark">Nhận xét chi tiết (tùy chọn)</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              className="form-control-dark mt-1"
              placeholder="Chia sẻ nhận xét về phương pháp huấn luyện, thái độ và hiệu quả của PT..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loading || success}
            />
          </Form.Group>

          <button
            type="submit"
            className="btn-card-action btn-green w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            disabled={loading || success || !trainerToReview?.bookingId}
          >
            {loading && <Spinner animation="border" size="sm" />}
            {success ? '✅ Đã gửi đánh giá!' : loading ? 'Đang gửi...' : 'Gửi Đánh Giá'}
          </button>
        </Form>
      </div>
    </Modal>
  );
};

export default RateTrainerModal;
