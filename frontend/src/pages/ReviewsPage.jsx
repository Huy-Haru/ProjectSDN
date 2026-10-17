import React, { useState } from 'react';
import { FaStar, FaPlus, FaQuoteLeft } from 'react-icons/fa';

const ReviewsPage = ({ reviews, onOpenReviewModal }) => {
  const [selectedTrainerFilter, setSelectedTrainerFilter] = useState('Tất cả');

  const filteredReviews = reviews.filter(r => {
    if (selectedTrainerFilter === 'Tất cả') return true;
    return r.trainerName === selectedTrainerFilter;
  });

  return (
    <div className="reviews-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="section-tag">ĐÁNH GIÁ & PHẢN HỒI</span>
          <h2 className="section-header-title">Đánh Giá Huấn Luyện Viên (PT)</h2>
          <p className="text-muted mb-0">Nhận xét chất lượng giảng dạy, thái độ phục vụ và hiệu quả tập luyện.</p>
        </div>

        <button 
          className="btn-card-action btn-green d-flex align-items-center gap-2 py-2 px-4"
          style={{ width: 'auto' }}
          onClick={() => onOpenReviewModal(null)}
        >
          <FaPlus /> Viết Đánh Giá Mới
        </button>
      </div>

      {/* Reviews Summary Stats Header */}
      <div className="p-4 rounded-4 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="display-4 fw-bold text-warning">4.9</div>
          <div>
            <div className="d-flex text-warning fs-5 gap-1 mb-1">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>Dựa trên 400+ đánh giá từ học viên</div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="text-muted small fw-bold">Lọc theo HLV:</span>
          {['Tất cả', 'HLV. Trần Minh Đức', 'HLV. Nguyễn Thu Trang'].map((tName) => (
            <button
              key={tName}
              className={`toggle-btn py-1 px-3 style-sm ${selectedTrainerFilter === tName ? 'active' : ''}`}
              style={{ fontSize: '0.78rem' }}
              onClick={() => setSelectedTrainerFilter(tName)}
            >
              {tName}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="row g-4">
        {filteredReviews.map((rev) => (
          <div key={rev.id} className="col-lg-6">
            <div className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
              <div>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <img 
                      src={rev.trainerAvatar} 
                      alt={rev.trainerName} 
                      style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00E676' }} 
                    />
                    <div>
                      <h6 className="text-white fw-bold mb-0">{rev.trainerName}</h6>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Đã hướng dẫn 12 buổi PT</span>
                    </div>
                  </div>
                  <div className="d-flex text-warning">
                    {[...Array(rev.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                </div>

                <p className="text-muted fst-italic mb-3" style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
                  <FaQuoteLeft className="me-2 text-secondary" />"{rev.comment}"
                </p>
              </div>

              <div className="d-flex justify-content-between align-items-center pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-white fw-semibold" style={{ fontSize: '0.8rem' }}>
                  Học viên: <strong style={{ color: '#00E676' }}>{rev.studentName}</strong>
                </span>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{rev.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;
