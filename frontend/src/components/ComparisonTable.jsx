import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { comparisonFeatures } from '../data/mockData';

const ComparisonTable = () => {
  return (
    <div className="comparison-section">
      <div className="section-tag">MINH BẠCH & TOÀN DIỆN</div>
      <div className="d-flex justify-content-between align-items-baseline mb-4 flex-wrap">
        <h2 className="section-header-title mb-0">Bảng so sánh chi tiết tính năng</h2>
        <div className="section-header-subtitle mb-0">
          Tất cả các gói đều được áp dụng chính sách hoàn tiền/hủy linh hoạt trong 7 ngày đầu
        </div>
      </div>

      <div className="table-responsive">
        <table className="table-custom">
          <thead>
            <tr>
              <th>ĐẶC QUYỀN HỘI VIÊN</th>
              <th>CƠ BẢN (BASIC)</th>
              <th className="th-highlight">CAO CẤP (PREMIUM)</th>
              <th>VIP THƯỢNG ĐỈNH</th>
            </tr>
          </thead>
          <tbody>
            {comparisonFeatures.map((row, index) => (
              <tr key={index}>
                <td>{row.name}</td>
                <td>
                  {row.basic === 'check' ? (
                    <FaCheckCircle className="text-muted" />
                  ) : (
                    row.basic
                  )}
                </td>
                <td style={{ color: '#00E676', fontWeight: 600 }}>
                  {row.premium === 'check' ? (
                    <FaCheckCircle style={{ color: '#00E676', fontSize: '1.1rem' }} />
                  ) : (
                    row.premium
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>
                  {row.vip === 'check' ? (
                    <FaCheckCircle style={{ color: '#FFD700', fontSize: '1.1rem' }} />
                  ) : (
                    row.vip
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
