import React from 'react';
import { FaDollarSign, FaChartLine, FaCreditCard, FaArrowUp } from 'react-icons/fa';
import { revenueReportData } from '../data/mockData';

const AdminRevenuePage = () => {
  return (
    <div className="admin-revenue-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="section-tag">BÁO CÁO TÀI CHÍNH & DOANH THU (ADMIN)</span>
          <h2 className="section-header-title">Thống Kê Doanh Thu & Tăng Trưởng FitManager</h2>
          <p className="text-muted mb-0">Theo dõi dòng tiền bán gói tập, hoa hồng PT và chỉ số kinh doanh toàn phòng tập.</p>
        </div>
      </div>

      {/* 3 Metric Header Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted style-sm fw-bold">TỔNG DOANH THU THÁNG NÀY</span>
              <div className="p-2 rounded-3" style={{ background: 'rgba(0, 230, 118, 0.1)', color: '#00E676' }}>
                <FaDollarSign />
              </div>
            </div>
            <div className="fs-2 fw-bold text-white mb-1">{revenueReportData.totalRevenue}</div>
            <div style={{ fontSize: '0.78rem', color: '#00E676', fontWeight: 700 }}>
              <FaArrowUp className="me-1" /> {revenueReportData.growthPercent} so với tháng trước
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted style-sm fw-bold">MỤC TIÊU KPI DOANH THU</span>
              <div className="p-2 rounded-3" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                <FaChartLine />
              </div>
            </div>
            <div className="fs-2 fw-bold text-white mb-1">{revenueReportData.monthlyTarget}</div>
            <div style={{ fontSize: '0.78rem', color: '#3B82F6', fontWeight: 700 }}>
              Đã hoàn thành 91.7% chỉ tiêu tháng
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted style-sm fw-bold">SỐ HỢP ĐỒNG KÝ MỚI</span>
              <div className="p-2 rounded-3" style={{ background: 'rgba(255, 193, 7, 0.1)', color: '#FFC107' }}>
                <FaCreditCard />
              </div>
            </div>
            <div className="fs-2 fw-bold text-white mb-1">142 Hợp Đồng</div>
            <div style={{ fontSize: '0.78rem', color: '#FFC107' }}>85% đăng ký gói thanh toán năm</div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown by Package & Monthly Trends */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="p-4 rounded-4 h-100" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <h5 className="text-white fw-bold mb-3">Tỷ Tỉ Trọng Doanh Thu Theo Gói Tập</h5>
            <div className="d-flex flex-column gap-3">
              {revenueReportData.breakdown.map((item, index) => (
                <div key={index} className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1E293B' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-white fw-bold">{item.name}</span>
                    <strong style={{ color: '#00E676' }}>{item.amount} ({item.percent})</strong>
                  </div>
                  <div className="progress" style={{ height: '8px', background: '#1E293B' }}>
                    <div 
                      className="progress-bar" 
                      style={{ width: item.percent, background: index === 0 ? '#00E676' : index === 1 ? '#3B82F6' : '#FFC107' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="p-4 rounded-4 h-100" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <h5 className="text-white fw-bold mb-3">Xu Hướng Doanh Thu Qua Các Tháng</h5>
            <div className="d-flex flex-column gap-3">
              {revenueReportData.monthlyTrends.map((item, index) => (
                <div key={index} className="d-flex align-items-center justify-content-between p-2.5 rounded-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-muted fw-semibold">{item.month}</span>
                  <span className="text-white fw-bold">{(item.revenue / 1000000).toFixed(1)} Triệu VNĐ</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenuePage;
