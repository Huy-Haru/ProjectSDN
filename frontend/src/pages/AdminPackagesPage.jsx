import React, { useState } from 'react';
import { FaCreditCard, FaPlus, FaCheckCircle, FaTrashAlt, FaEdit } from 'react-icons/fa';
import { packagesData } from '../data/mockData';
import ManagePackageModal from '../components/ManagePackageModal';

const AdminPackagesPage = () => {
  const [packagesList, setPackagesList] = useState(packagesData);
  const [showModal, setShowModal] = useState(false);
  const [packageToEdit, setPackageToEdit] = useState(null);

  const handleOpenAddModal = () => {
    setPackageToEdit(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (pkg) => {
    setPackageToEdit(pkg);
    setShowModal(true);
  };

  const handleSavePackage = (savedPkg) => {
    if (packageToEdit) {
      setPackagesList(prev => prev.map(p => p.id === savedPkg.id ? savedPkg : p));
    } else {
      setPackagesList(prev => [...prev, savedPkg]);
    }
  };

  const handleDeletePackage = (id) => {
    setPackagesList(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="admin-packages-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="section-tag">QUẢN LÝ GÓI TẬP (ADMIN)</span>
          <h2 className="section-header-title">Bảng Giá & Các Gói Tập Niêm Yết</h2>
          <p className="text-muted mb-0">Tạo mới, cập nhật giá gói tập và tính năng đi kèm.</p>
        </div>

        <button 
          className="btn-card-action btn-green d-flex align-items-center gap-2 py-2 px-4"
          style={{ width: 'auto' }}
          onClick={handleOpenAddModal}
        >
          <FaPlus /> Thêm Gói Tập Mới
        </button>
      </div>

      <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>TÊN GÓI TẬP</th>
                <th>PHÂN LOẠI</th>
                <th>GIÁ THEO NĂM</th>
                <th>GIÁ THEO THÁNG</th>
                <th>SỐ HỌC VIÊN ĐANG DÙNG</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC ADMIN</th>
              </tr>
            </thead>
            <tbody>
              {packagesList.map((pkg) => (
                <tr key={pkg.id}>
                  <td className="fw-bold text-white">{pkg.name}</td>
                  <td>{pkg.category}</td>
                  <td style={{ color: '#00E676', fontWeight: 700 }}>{pkg.priceYear} đ / năm</td>
                  <td>{pkg.priceMonth} đ / tháng</td>
                  <td>{pkg.activeMembers || 0} Học viên</td>
                  <td>
                    <span className="badge bg-success">{pkg.status || 'Hoạt động'}</span>
                  </td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center">
                      <button 
                        className="btn-card-action px-2.5 py-1"
                        style={{ fontSize: '0.75rem', width: 'auto', background: '#1E293B' }}
                        onClick={() => handleOpenEditModal(pkg)}
                      >
                        <FaEdit className="me-1" /> Sửa
                      </button>
                      <button 
                        className="btn-card-action px-2.5 py-1 text-danger border-danger"
                        style={{ fontSize: '0.75rem', width: 'auto', background: 'transparent' }}
                        onClick={() => handleDeletePackage(pkg.id)}
                      >
                        <FaTrashAlt className="me-1" /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ManagePackageModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        packageToEdit={packageToEdit} 
        onSavePackage={handleSavePackage} 
      />
    </div>
  );
};

export default AdminPackagesPage;
