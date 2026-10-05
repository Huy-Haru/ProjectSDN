import React from 'react';
import { FaTimes } from 'react-icons/fa';

const FacilityBanner = () => {
  return (
    <div className="middle-banner-grid">
      {/* Left Facility Box */}
      <div 
        className="facility-box" 
        style={{ backgroundImage: `url('/gym_facility.jpg')` }}
      >
        <div className="facility-overlay"></div>
        <div className="facility-content">
          <div className="facility-tag">KHÔNG GIAN ĐẲNG CẤP QUỐC TẾ</div>
          <h3 className="facility-title">
            Cơ sở vật chất hiện đại, tiêu chuẩn công thái học đỉnh cao
          </h3>
          <p className="facility-desc">
            Toàn bộ trang thiết bị nhập khẩu từ Technogym & Life Fitness, nhằm tối ưu hiệu quả tập luyện kết hợp với giảm thiểu chấn thương khớp.
          </p>
        </div>
      </div>

      {/* Right Satisfaction Box */}
      <div className="satisfaction-box">
        <div>
          <div className="satisfaction-header">
            <span className="satisfaction-title">Tỷ lệ hài lòng học viên</span>
            <button className="close-btn" aria-label="Close">
              <FaTimes />
            </button>
          </div>

          <div className="stat-value">98.6%</div>
          <div className="stat-sublabel">đạt mục tiêu thể hình</div>
        </div>

        {/* Sparkline chart SVG */}
        <div>
          <div className="sparkline-container">
            <svg width="100%" height="50" viewBox="0 0 200 50" fill="none">
              {/* Grid lines */}
              <line x1="0" y1="45" x2="200" y2="45" stroke="#1E293B" strokeDasharray="2 2" />
              <line x1="0" y1="25" x2="200" y2="25" stroke="#1E293B" strokeDasharray="2 2" />

              {/* Gradient glow line */}
              <defs>
                <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00E676" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#00E676" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00E676" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00E676" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <path 
                d="M 10 40 Q 60 38 100 25 T 190 8 L 190 45 L 10 45 Z" 
                fill="url(#areaGradient)" 
              />

              {/* Neon sparkline */}
              <path 
                d="M 10 40 Q 60 38 100 25 T 190 8" 
                stroke="#00E676" 
                strokeWidth="3" 
                fill="none" 
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="10" cy="40" r="3" fill="#00E676" />
              <circle cx="100" cy="25" r="3" fill="#00E676" />
              <circle cx="190" cy="8" r="4" fill="#FFFFFF" stroke="#00E676" strokeWidth="2" />
            </svg>
          </div>

          <div className="timeline-labels">
            <span>Tháng 1</span>
            <span>Tháng 3 (InBody + PT)</span>
            <span>Tháng 6</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityBanner;
