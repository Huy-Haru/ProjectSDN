import React, { useState } from 'react';
import { FaUserFriends, FaDumbbell, FaChartLine, FaPlus, FaCheckCircle, FaSearch } from 'react-icons/fa';
import { assignedStudentsData } from '../data/mockData';
import CreatePlanModal from '../components/CreatePlanModal';
import UpdateStudentProgressModal from '../components/UpdateStudentProgressModal';

const TrainerStudentsPage = ({ user }) => {
  const [studentsList, setStudentsList] = useState(assignedStudentsData);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleOpenPlanModal = (student) => {
    setSelectedStudent(student);
    setShowPlanModal(true);
  };

  const handleOpenProgressModal = (student) => {
    setSelectedStudent(student);
    setShowProgressModal(true);
  };

  const handleSubmitPlan = (planData) => {
    setStudentsList(prev => prev.map(s => {
      if (s.id === planData.studentId) {
        return { ...s, currentPlan: planData.planName };
      }
      return s;
    }));
  };

  const handleUpdateProgress = (progressData) => {
    setStudentsList(prev => prev.map(s => {
      if (s.id === progressData.studentId) {
        return { ...s, currentWeight: progressData.weight, bodyFat: progressData.bodyFat };
      }
      return s;
    }));
  };

  const filteredStudents = studentsList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.packageName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="trainer-students-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="section-tag">QUẢN LÝ HỌC VIÊN KÈM 1:1</span>
          <h2 className="section-header-title">Danh Sách Học Viên Phụ Trách</h2>
          <p className="text-muted mb-0">Tạo lộ trình tập luyện cá nhân hóa và cập nhật chỉ số thể trạng định kỳ.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 mb-4 rounded-3 d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
        <div className="search-box position-relative" style={{ width: '320px' }}>
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Tìm kiếm học viên..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-muted small">
          Tổng số học viên phụ trách: <strong style={{ color: '#00E676' }}>{filteredStudents.length} học viên</strong>
        </div>
      </div>

      {/* Students Cards Grid */}
      <div className="row g-4">
        {filteredStudents.map((st) => (
          <div key={st.id} className="col-lg-6">
            <div className="p-4 rounded-4 position-relative d-flex flex-column justify-content-between h-100" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
              <div>
                <div className="d-flex gap-3 align-items-center mb-3">
                  <img src={st.avatar} alt={st.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00E676' }} />
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <h4 className="text-white fw-bold mb-0 fs-5">{st.name}</h4>
                      <span className="badge bg-success">{st.status}</span>
                    </div>
                    <div style={{ color: '#00E676', fontSize: '0.82rem', fontWeight: 600 }}>{st.packageName}</div>
                    <div className="text-muted small">{st.phone} • {st.email}</div>
                  </div>
                </div>

                {/* Sub Stats */}
                <div className="row g-2 mb-3">
                  <div className="col-4">
                    <div className="p-2 rounded-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1E293B' }}>
                      <div className="text-muted small">Cân Nặng</div>
                      <strong className="text-white">{st.currentWeight} kg</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 rounded-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1E293B' }}>
                      <div className="text-muted small">Body Fat</div>
                      <strong className="text-warning">{st.bodyFat}%</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 rounded-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1E293B' }}>
                      <div className="text-muted small">Số Buổi Tập</div>
                      <strong style={{ color: '#00E676' }}>{st.completedSessions}/{st.totalSessions}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-3 mb-3" style={{ background: 'rgba(0, 230, 118, 0.08)', border: '1px dashed rgba(0, 230, 118, 0.3)' }}>
                  <span className="text-muted small">Lộ trình hiện tại: </span>
                  <strong className="text-white small">{st.currentPlan}</strong>
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button 
                  className="btn-card-action flex-grow-1 py-2" 
                  style={{ background: '#1E293B', fontSize: '0.82rem' }}
                  onClick={() => handleOpenPlanModal(st)}
                >
                  <FaDumbbell className="me-1" /> Tạo Kế Hoạch Tập
                </button>
                <button 
                  className="btn-card-action btn-green flex-grow-1 py-2" 
                  style={{ fontSize: '0.82rem' }}
                  onClick={() => handleOpenProgressModal(st)}
                >
                  <FaChartLine className="me-1" /> Cập Nhật Tiến Độ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <CreatePlanModal 
        show={showPlanModal} 
        onHide={() => setShowPlanModal(false)} 
        student={selectedStudent} 
        onSubmitPlan={handleSubmitPlan} 
      />

      <UpdateStudentProgressModal 
        show={showProgressModal} 
        onHide={() => setShowProgressModal(false)} 
        student={selectedStudent} 
        onUpdateProgress={handleUpdateProgress} 
      />
    </div>
  );
};

export default TrainerStudentsPage;
