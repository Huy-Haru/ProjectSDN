import React, { useState, useEffect, useCallback } from 'react';
import { FaWeight, FaFire, FaPlus, FaPercentage, FaDumbbell, FaExclamationCircle, FaSyncAlt, FaRuler } from 'react-icons/fa';
import { progressApi } from '../api/apiClient';

/**
 * A3.1 — ProgressPage: Member xem ProgressLog thật từ MongoDB.
 * PT có thể ghi chỉ số tại TrainerSchedulePage (khi confirm completed).
 */
const ProgressPage = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await progressApi.getLogs();
      setLogs(res.data.logs || []);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu tiến độ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Lấy log mới nhất
  const latestLog = logs.length > 0 ? logs[0] : null;

  // Tính số buổi attended (tổng)
  const totalAttended = logs.reduce((sum, l) => sum + (l.attendedSessions || 0), 0);

  // Tính thay đổi cân nặng (so với log cũ nhất có weight)
  const logsWithWeight = logs.filter(l => l.weight != null);
  const latestWeight = logsWithWeight.length > 0 ? logsWithWeight[0].weight : null;
  const firstWeight = logsWithWeight.length > 0 ? logsWithWeight[logsWithWeight.length - 1].weight : null;
  const weightDiff = (latestWeight != null && firstWeight != null) ? (latestWeight - firstWeight).toFixed(1) : null;

  return (
    <div className="progress-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span className="section-tag">TIẾN ĐỘ & THỂ TRẠNG</span>
          <h2 className="section-header-title">Theo Dõi Chỉ Số Thể Hình</h2>
          <p className="text-muted mb-0">Lịch sử chỉ số được ghi nhận bởi PT sau mỗi buổi tập hoàn thành.</p>
        </div>
        <button
          className="btn-card-action px-3 py-2 d-flex align-items-center gap-2"
          style={{ width: 'auto', background: '#1E293B', fontSize: '0.82rem' }}
          onClick={fetchLogs}
        >
          <FaSyncAlt /> Làm mới
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="d-flex align-items-center gap-2 p-3 mb-4 rounded-3"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
          <FaExclamationCircle /> {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-success" /></div>
      ) : (
        <>
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
                  {latestWeight != null ? <>{latestWeight} <span className="fs-6 text-muted font-normal">kg</span></> : <span className="text-muted fs-5">Chưa có</span>}
                </div>
                <div style={{ fontSize: '0.78rem', color: weightDiff !== null ? (Number(weightDiff) <= 0 ? '#00E676' : '#EF4444') : '#64748B', fontWeight: 600 }}>
                  {weightDiff !== null
                    ? (Number(weightDiff) <= 0 ? `↓ Giảm ${Math.abs(weightDiff)} kg` : `↑ Tăng ${weightDiff} kg`)
                    : 'Chưa đủ dữ liệu so sánh'}
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
                  {latestLog?.bodyFat != null ? <>{latestLog.bodyFat}%</> : <span className="text-muted fs-5">Chưa có</span>}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  Mục tiêu lý tưởng: 15.0%
                </div>
              </div>
            </div>

            {/* Sessions Attended */}
            <div className="col-md-6 col-xl-3">
              <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted style-sm fw-bold">BUỔI ĐÃ HOÀN THÀNH</span>
                  <div className="p-2 rounded-3" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                    <FaDumbbell />
                  </div>
                </div>
                <div className="fs-2 fw-bold text-white mb-1">
                  {totalAttended} <span className="fs-6 text-muted font-normal">buổi</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#3B82F6', fontWeight: 600 }}>
                  {logs.length} lần ghi nhận
                </div>
              </div>
            </div>

            {/* Height */}
            <div className="col-md-6 col-xl-3">
              <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted style-sm fw-bold">CHIỀU CAO</span>
                  <div className="p-2 rounded-3" style={{ background: 'rgba(168,85,247,0.1)', color: '#A855F7' }}>
                    <FaRuler />
                  </div>
                </div>
                <div className="fs-2 fw-bold text-white mb-1">
                  {latestLog?.height != null ? <>{latestLog.height} <span className="fs-6 text-muted font-normal">cm</span></> : <span className="text-muted fs-5">Chưa có</span>}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  {latestLog?.date ? `Cập nhật: ${new Date(latestLog.date).toLocaleDateString('vi-VN')}` : 'Chưa có dữ liệu'}
                </div>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-white fw-bold mb-0">Lịch Sử Ghi Nhận Chỉ Số</h5>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Tổng {logs.length} mốc ghi nhận từ PT</span>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <FaDumbbell style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.4 }} />
                <p>Chưa có dữ liệu tiến độ. PT sẽ ghi chỉ số sau mỗi buổi tập hoàn thành.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table-custom">
                  <thead>
                    <tr>
                      <th>NGÀY GHI NHẬN</th>
                      <th>CÂN NẶNG (KG)</th>
                      <th>BODY FAT (%)</th>
                      <th>CHIỀU CAO (CM)</th>
                      <th>BUỔI HOÀN THÀNH</th>
                      <th>GHI CHÚ PT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => {
                      const prevLog = logsWithWeight[index + 1];
                      const diff = (log.weight != null && prevLog?.weight != null)
                        ? (log.weight - prevLog.weight).toFixed(1)
                        : null;
                      return (
                        <tr key={log._id || index}>
                          <td style={{ color: '#00E676', fontWeight: 600 }}>
                            {log.date ? new Date(log.date).toLocaleDateString('vi-VN') : '—'}
                          </td>
                          <td className="fw-bold text-white">
                            {log.weight != null ? (
                              <>
                                {log.weight} kg
                                {diff !== null && (
                                  <span className="ms-2" style={{ fontSize: '0.75rem', color: Number(diff) <= 0 ? '#00E676' : '#EF4444' }}>
                                    ({Number(diff) <= 0 ? diff : `+${diff}`})
                                  </span>
                                )}
                              </>
                            ) : <span className="text-muted">—</span>}
                          </td>
                          <td style={{ color: '#FFC107' }}>
                            {log.bodyFat != null ? `${log.bodyFat}%` : <span className="text-muted">—</span>}
                          </td>
                          <td className="text-white">
                            {log.height != null ? `${log.height} cm` : <span className="text-muted">—</span>}
                          </td>
                          <td>
                            <span style={{ color: '#3B82F6', fontWeight: 600 }}>{log.attendedSessions || 0}</span>
                          </td>
                          <td className="text-muted" style={{ fontSize: '0.82rem' }}>
                            {log.note || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressPage;
