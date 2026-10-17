import React from 'react';
import { FaCheckCircle, FaCrown } from 'react-icons/fa';
import { myPackageInfo } from '../data/mockData';

const MyPackagePage = ({ onNavigateToPackages }) => {
  return (
    <div className="my-package-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="section-tag">GÓI TẬP CỦA TÔI</span>
          <h2 className="section-header-title">Thông Tin Thẻ Hội Viên Hiện Tại</h2>
          <p className="text-muted mb-0">Quản lý hạn sử dụng, đặc quyền hội viên và số buổi PT còn lại.</p>
        </div>

        <button 
          className="btn-card-action btn-green d-flex align-items-center gap-2 py-2 px-4"
          style={{ width: 'auto' }}
          onClick={onNavigateToPackages}
        >
          <FaCrown /> Gia Hạn / Nâng Cấp Gói Tập
        </button>
      </div>

      {/* Main Active Package Card */}
      <div className="p-4 rounded-4 mb-4 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d211a 0%, #0f172a 100%)', border: '2px solid #00E676' }}>
        <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
          <div>
            <span className="badge px-3 py-1.5 mb-2" style={{ background: '#00E676', color: '#080D16', fontWeight: 800 }}>
              <FaCheckCircle className="me-1" /> {myPackageInfo.status}
            </span>
            <h2 className="text-white fw-bold display-6 mb-1">{myPackageInfo.packageName}</h2>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
              Thời hạn gói: <strong className="text-white">{myPackageInfo.startDate}</strong> đến <strong className="text-white">{myPackageInfo.endDate}</strong>
            </div>
          </div>

          <div className="text-end">
            <div className="fs-1 fw-bold" style={{ color: '#00E676' }}>
              {myPackageInfo.daysRemaining} <span className="fs-6 text-muted font-normal">ngày còn lại</span>
            </div>
          </div>
        </div>

        {/* 3 Metric Sub-boxes */}
        <div className="row g-3">
          <div className="col-md-4">
            <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B' }}>
              <div className="text-muted style-sm mb-1">BUỔI PT 1:1 CÒN LẠI</div>
              <div className="fs-3 fw-bold text-white">
                {myPackageInfo.remainingPtSessions} <span className="fs-6 text-muted">/ {myPackageInfo.totalPtSessions} buổi</span>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B' }}>
              <div className="text-muted style-sm mb-1">LẦN ĐO INBODY ĐÃ DÙNG</div>
              <div className="fs-3 fw-bold text-white">
                {myPackageInfo.inbodyScansUsed} <span className="fs-6 text-muted">lần</span>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B' }}>
              <div className="text-muted style-sm mb-1">KHUNG GIỜ TRUY CẬP</div>
              <div className="fs-3 fw-bold" style={{ color: '#00E676' }}>
                24/7 <span className="fs-6 text-muted">Toàn hệ thống</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privileges Included */}
      <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <h5 className="text-white fw-bold mb-3">Đặc Quyền Hội Viên Được Kích Hoạt</h5>
        <div className="row g-3">
          {myPackageInfo.privileges.map((priv, idx) => (
            <div key={idx} className="col-md-6">
              <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1E293B' }}>
                <FaCheckCircle className="text-success fs-5" />
                <span className="text-white fw-semibold" style={{ fontSize: '0.88rem' }}>{priv}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyPackagePage;
