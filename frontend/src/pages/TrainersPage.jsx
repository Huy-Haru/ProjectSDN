import React, { useState } from 'react';
import { FaStar, FaSearch, FaCalendarPlus, FaCommentAlt, FaAward, FaUserCheck } from 'react-icons/fa';
import { trainersData } from '../data/mockData';

const TrainersPage = ({ onSelectPtForBooking, onOpenReviewModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Tất cả');

  const specialtiesList = ['Tất cả', 'Tăng cơ', 'Giảm mỡ', 'Pilates', 'Phục hồi', 'Dinh dưỡng'];

  const filteredTrainers = trainersData.filter(pt => {
    const matchesSearch = pt.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pt.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'Tất cả' || pt.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="trainers-page">
      {/* Header Banner */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="section-tag">ĐỘI NGŨ HUẤN LUYỆN VIÊN</span>
          <h2 className="section-header-title">Danh sách Huấn luyện viên Chuyên nghiệp</h2>
          <p className="text-muted mb-0">Hơn 50+ HLV đạt chứng chỉ quốc tế NASM, Stott Pilates đồng hành cùng bạn.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 mb-4 rounded-3 d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <div className="search-box position-relative" style={{ width: '320px' }}>
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Tìm kiếm tên HLV..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Chuyên môn:</span>
          {specialtiesList.map(spec => (
            <button
              key={spec}
              className={`toggle-btn py-1 px-3 style-sm ${selectedSpecialty === spec ? 'active' : ''}`}
              style={{ fontSize: '0.78rem' }}
              onClick={() => setSelectedSpecialty(spec)}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Trainers Grid */}
      <div className="row g-4">
        {filteredTrainers.map(pt => (
          <div key={pt.id} className="col-lg-6 col-xl-6">
            <div 
              className="p-4 rounded-4 position-relative d-flex flex-column justify-content-between h-100"
              style={{ background: '#0F172A', border: '1px solid #1E293B', transition: 'all 0.2s ease' }}
            >
              <div>
                <div className="d-flex gap-3 align-items-start mb-3">
                  <img 
                    src={pt.avatar} 
                    alt={pt.name} 
                    style={{ width: '84px', height: '84px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #00E676' }} 
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <h4 className="text-white fw-bold mb-1 fs-5">{pt.name}</h4>
                      <span className="badge px-2 py-1" style={{ background: 'rgba(0, 230, 118, 0.15)', color: '#00E676', fontSize: '0.7rem' }}>
                        <FaUserCheck className="me-1" /> {pt.status}
                      </span>
                    </div>
                    <div style={{ color: '#00E676', fontSize: '0.82rem', fontWeight: 600 }} className="mb-2">
                      {pt.title}
                    </div>

                    <div className="d-flex align-items-center gap-3" style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                      <div className="d-flex align-items-center text-warning gap-1">
                        <FaStar /> <strong className="text-white">{pt.rating}</strong> ({pt.reviewsCount} đánh giá)
                      </div>
                      <div>•</div>
                      <div className="d-flex align-items-center gap-1">
                        <FaAward style={{ color: '#00E676' }} /> {pt.experience}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-muted" style={{ fontSize: '0.83rem', lineHeight: '1.5' }}>
                  {pt.bio}
                </p>

                {/* Specialties Badges */}
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {pt.specialties.map((spec, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 rounded-2"
                      style={{ background: '#1E293B', color: '#CBD5E1', fontSize: '0.72rem', fontWeight: 600 }}
                    >
                      #{spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button 
                  className="btn-card-action flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2"
                  style={{ background: '#1E293B', fontSize: '0.85rem' }}
                  onClick={() => onOpenReviewModal(pt)}
                >
                  <FaCommentAlt /> Đánh giá HLV
                </button>
                <button 
                  className="btn-card-action btn-green flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2"
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => onSelectPtForBooking(pt)}
                >
                  <FaCalendarPlus /> Đặt lịch tập ngay
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainersPage;
