import React, { useState } from 'react';
import { Form, Modal } from 'react-bootstrap';
import { FaWeight, FaFire, FaPlus, FaPercentage, FaDumbbell } from 'react-icons/fa';
import { initialProgress } from '../data/mockData';

const ProgressPage = () => {
  const [progress, setProgress] = useState(initialProgress);
  const [showAddWeightModal, setShowAddWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newBodyFat, setNewBodyFat] = useState('');

  const handleAddWeight = (e) => {
    e.preventDefault();
    if (!newWeight) return;

    const todayStr = new Date().toLocaleDateString('vi-VN');
    const updatedHistory = [
      ...progress.weightHistory,
      {
        date: todayStr,
        weight: parseFloat(newWeight),
        bodyFat: newBodyFat ? parseFloat(newBodyFat) : progress.bodyFat
      }
    ];

    setProgress({
      ...progress,
      currentWeight: parseFloat(newWeight),
      bodyFat: newBodyFat ? parseFloat(newBodyFat) : progress.bodyFat,
      weightHistory: updatedHistory
    });

    setNewWeight('');
    setNewBodyFat('');
    setShowAddWeightModal(false);
  };

  const completionPercent = Math.round((progress.completedSessions / progress.totalSessionsGoal) * 100);

  return (
    <div className="progress-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="section-tag">TIẾN ĐỘ & THỂ TRẠNG</span>
          <h2 className="section-header-title">Theo Dõi Cân Nặng & Chỉ Số Thể Hình</h2>
          <p className="text-muted mb-0">Cập nhật chỉ số InBody và số buổi tập đã hoàn thành để giữ vững mục tiêu.</p>
        </div>

        <button 
          className="btn-card-action btn-green d-flex align-items-center gap-2 py-2 px-4"
          style={{ width: 'auto' }}
          onClick={() => setShowAddWeightModal(true)}
        >
          <FaPlus /> Ghi Cân Nặng Mới
        </button>
      </div>

      {/* 4 Key Stat Cards */}
      <div className="row g-4 mb-4">
        {/* Current Weight */}
        <div className="col-md-6 col-xl-3">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted style-sm fw-bold">CÂN NẶNG HIỆN TẠI</span>
              <div className="p-2 rounded-3" style={{ background: 'rgba(0, 230, 118, 0.1)', color: '#00E676' }}>
                <FaWeight />
              </div>
            </div>
            <div className="fs-2 fw-bold text-white mb-1">
              {progress.currentWeight} <span className="fs-6 text-muted font-normal">kg</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#00E676', fontWeight: 600 }}>
              ↓ Giảm { (progress.startWeight - progress.currentWeight).toFixed(1) } kg so với ban đầu ({progress.startWeight}kg)
            </div>
          </div>
        </div>

        {/* Body Fat */}
        <div className="col-md-6 col-xl-3">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted style-sm fw-bold">TỶ LỆ MỠ (BODY FAT)</span>
              <div className="p-2 rounded-3" style={{ background: 'rgba(255, 193, 7, 0.1)', color: '#FFC107' }}>
                <FaPercentage />
              </div>
            </div>
            <div className="fs-2 fw-bold text-white mb-1">
              {progress.bodyFat}%
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Mục tiêu lý tưởng: 15.0%
            </div>
          </div>
        </div>

        {/* Sessions Completed */}
        <div className="col-md-6 col-xl-3">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted style-sm fw-bold">SỐ BUỔI ĐÃ TẬP</span>
              <div className="p-2 rounded-3" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                <FaDumbbell />
              </div>
            </div>
            <div className="fs-2 fw-bold text-white mb-1">
              {progress.completedSessions} / {progress.totalSessionsGoal} <span className="fs-6 text-muted font-normal">buổi</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#3B82F6', fontWeight: 600 }}>
              Đạt {completionPercent}% tiến độ lộ trình
            </div>
          </div>
        </div>

        {/* Calories Burned */}
        <div className="col-md-6 col-xl-3">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted style-sm fw-bold">CALORIES ĐỐT CHÁY</span>
              <div className="p-2 rounded-3" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                <FaFire />
              </div>
            </div>
            <div className="fs-2 fw-bold text-white mb-1">
              {progress.caloriesBurnedTotal.toLocaleString()} <span className="fs-6 text-muted font-normal">kcal</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Trung bình ~550 kcal / buổi
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4 rounded-4 mb-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="text-white fw-bold mb-0">Tiến Độ Hoàn Thành Lộ Trình 36 Buổi PT</h5>
          <span style={{ color: '#00E676', fontWeight: 800 }}>{completionPercent}%</span>
        </div>
        <div className="progress mb-3" style={{ height: '12px', background: '#1E293B', borderRadius: '6px' }}>
          <div 
            className="progress-bar" 
            role="progressbar" 
            style={{ width: `${completionPercent}%`, background: 'linear-gradient(90deg, #00E676, #00C853)' }}
          ></div>
        </div>
        <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.78rem' }}>
          <span>Bắt đầu: 0 Buổi</span>
          <span>Hiện tại: {progress.completedSessions} Buổi</span>
          <span>Mục tiêu: {progress.totalSessionsGoal} Buổi</span>
        </div>
      </div>

      {/* Weight History Table */}
      <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-white fw-bold mb-0">Lịch Sử Cân Nặng Qua Các Lần Đo</h5>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Tổng số {progress.weightHistory.length} mốc ghi nhận</span>
        </div>

        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>NGÀY GHI NHẬN</th>
                <th>CÂN NẶNG (KG)</th>
                <th>BODY FAT (%)</th>
                <th>THAY ĐỔI SO VỚI MỐC ĐẦU</th>
              </tr>
            </thead>
            <tbody>
              {progress.weightHistory.map((item, index) => {
                const diff = (item.weight - progress.startWeight).toFixed(1);
                return (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td className="fw-bold text-white">{item.weight} kg</td>
                    <td style={{ color: '#FFC107' }}>{item.bodyFat}%</td>
                    <td>
                      {diff <= 0 ? (
                        <span style={{ color: '#00E676', fontWeight: 700 }}>{diff} kg</span>
                      ) : (
                        <span className="text-danger fw-bold">+{diff} kg</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Weight */}
      <Modal show={showAddWeightModal} onHide={() => setShowAddWeightModal(false)} centered contentClassName="modal-content-dark">
        <div className="modal-header-dark d-flex justify-content-between align-items-center">
          <h5 className="modal-title mb-0">Ghi Cân Nặng Mới</h5>
          <button type="button" className="btn-close" onClick={() => setShowAddWeightModal(false)}></button>
        </div>
        <div className="modal-body-dark">
          <Form onSubmit={handleAddWeight}>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-dark">Cân nặng hiện tại (kg)</Form.Label>
              <Form.Control 
                type="number" 
                step="0.1" 
                className="form-control-dark" 
                placeholder="Ví dụ: 67.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="form-label-dark">Tỷ lệ mỡ Body Fat (%) (Không bắt buộc)</Form.Label>
              <Form.Control 
                type="number" 
                step="0.1" 
                className="form-control-dark" 
                placeholder="Ví dụ: 17.8"
                value={newBodyFat}
                onChange={(e) => setNewBodyFat(e.target.value)}
              />
            </Form.Group>

            <button type="submit" className="btn-card-action btn-green w-100 py-2.5">
              Lưu Chỉ Số
            </button>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default ProgressPage;
