import React, { useState } from 'react';
import { FaUserCheck, FaPlus, FaEdit, FaLock, FaUnlock, FaStar } from 'react-icons/fa';
import { trainersData } from '../data/mockData';
import ManageTrainerModal from '../components/ManageTrainerModal';

const AdminTrainersPage = () => {
  const [trainersList, setTrainersList] = useState(trainersData);
  const [showModal, setShowModal] = useState(false);
  const [trainerToEdit, setTrainerToEdit] = useState(null);

  const handleOpenAddModal = () => {
    setTrainerToEdit(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (pt) => {
    setTrainerToEdit(pt);
    setShowModal(true);
  };

  const handleSaveTrainer = (savedPt) => {
    if (trainerToEdit) {
      setTrainersList(prev => prev.map(pt => pt.id === savedPt.id ? savedPt : pt));
    } else {
      setTrainersList(prev => [...prev, savedPt]);
    }
  };

  const handleToggleLockTrainer = (id) => {
    setTrainersList(prev => prev.map(pt => {
      if (pt.id === id) {
        const nextStatus = pt.status === 'Hoạt động' ? 'Tạm khóa' : 'Hoạt động';
        return { ...pt, status: nextStatus };
      }
      return pt;
    }));
  };

  return (
    <div className="admin-trainers-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="section-tag">QUẢN LÝ HUẤN LUYỆN VIÊN (ADMIN)</span>
          <h2 className="section-header-title">Danh Sách Đội Ngũ PT Hệ Thống</h2>
          <p className="text-muted mb-0">Thêm mới HLV, cập nhật chuyên môn và quản lý hồ sơ nhân sự.</p>
        </div>

        <button 
          className="btn-card-action btn-green d-flex align-items-center gap-2 py-2 px-4"
          style={{ width: 'auto' }}
          onClick={handleOpenAddModal}
        >
          <FaPlus /> Thêm HLV Mới
        </button>
      </div>

      <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>HỌ TÊN HLV</th>
                <th>CHỨC DANH & CHUYÊN MÔN</th>
                <th>SỐ ĐIỆN THOẠI</th>
                <th>ĐÁNH GIÁ</th>
                <th>HỌC VIÊN KÈM</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC ADMIN</th>
              </tr>
            </thead>
            <tbody>
              {trainersList.map((pt) => (
                <tr key={pt.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img src={pt.avatar} alt={pt.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00E676' }} />
                      <span className="fw-bold text-white">{pt.name}</span>
                    </div>
                  </td>
                  <td>
                    <div>{pt.title}</div>
                    <div className="text-muted small">#{pt.specialties.join(', #')}</div>
                  </td>
                  <td>{pt.phone || '0912345678'}</td>
                  <td className="text-warning fw-bold">★ {pt.rating} ({pt.reviewsCount})</td>
                  <td>{pt.assignedStudentsCount || 12} Học viên</td>
                  <td>
                    <span className={`badge px-2.5 py-1 ${pt.status === 'Hoạt động' ? 'bg-success' : 'bg-secondary'}`}>
                      {pt.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center">
                      <button 
                        className="btn-card-action px-2.5 py-1"
                        style={{ fontSize: '0.75rem', width: 'auto', background: '#1E293B' }}
                        onClick={() => handleOpenEditModal(pt)}
                      >
                        <FaEdit className="me-1" /> Sửa
                      </button>
                      <button 
                        className={`btn-card-action px-2.5 py-1 ${pt.status === 'Hoạt động' ? 'text-danger border-danger' : 'btn-green'}`}
                        style={{ fontSize: '0.75rem', width: 'auto', background: 'transparent' }}
                        onClick={() => handleToggleLockTrainer(pt.id)}
                      >
                        {pt.status === 'Hoạt động' ? <><FaLock className="me-1" /> Khóa</> : <><FaUnlock className="me-1" /> Mở khóa</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ManageTrainerModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        trainerToEdit={trainerToEdit} 
        onSaveTrainer={handleSaveTrainer} 
      />
    </div>
  );
};

export default AdminTrainersPage;
