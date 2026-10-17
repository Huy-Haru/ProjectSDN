import React, { useState } from 'react';
import { Form, Alert } from 'react-bootstrap';
import { FaCalendarPlus, FaClock, FaUserCheck, FaDumbbell, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { trainersData } from '../data/mockData';

const BookingPage = ({ preSelectedTrainer, onAddScheduleSuccess }) => {
  const [selectedPtId, setSelectedPtId] = useState(preSelectedTrainer ? preSelectedTrainer.id : trainersData[0].id);
  const [bookingDate, setBookingDate] = useState('2026-10-09');
  const [timeSlot, setTimeSlot] = useState('09:00 - 10:00');
  const [workoutType, setWorkoutType] = useState('Tập Ngực & Tay Sau (Upper Body)');
  const [location, setLocation] = useState('Khu A - Máy cơ Technogym');
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const availableTimeSlots = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:30 - 11:30',
    '14:00 - 15:00',
    '17:30 - 18:30',
    '19:00 - 20:00'
  ];

  const workoutOptions = [
    'Tập Ngực & Tay Sau (Upper Body)',
    'Tập Lưng & Bắp Tay (Back & Biceps)',
    'Tập Mông & Đùi (Leg Day & Glutes)',
    'Pilates Reformer & Chỉnh Tư Thế',
    'Cardio HIIT & Đốt Mỡ Siêu Tốc',
    'Đo InBody & Tư Vấn Phác Đồ Dinh Dưỡng'
  ];

  const currentTrainer = trainersData.find(pt => pt.id === selectedPtId) || trainersData[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSession = {
      id: `sch_${Date.now()}`,
      trainerId: currentTrainer.id,
      trainerName: currentTrainer.name,
      trainerAvatar: currentTrainer.avatar,
      date: bookingDate,
      time: timeSlot,
      workoutType: workoutType,
      location: location,
      status: 'Sắp diễn ra',
      note: note || 'Không có ghi chú thêm'
    };

    onAddScheduleSuccess(newSession);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <div className="booking-page">
      <div className="mb-4">
        <span className="section-tag">ĐẶT LỊCH TẬP PT 1:1</span>
        <h2 className="section-header-title">Đăng ký Buổi Tập cùng Huấn Luyện Viên</h2>
        <p className="text-muted">Chọn khung giờ và mục tiêu tập luyện phù hợp với thời gian biểu của bạn.</p>
      </div>

      {isSuccess && (
        <Alert variant="success" className="alert-custom-green d-flex align-items-center gap-3">
          <FaCheckCircle className="fs-3 text-success" />
          <div>
            <strong className="d-block text-white">Đã đặt lịch tập thành công!</strong>
            <span style={{ fontSize: '0.85rem' }}>
              Buổi tập với <strong>{currentTrainer.name}</strong> vào ngày <strong>{bookingDate} ({timeSlot})</strong> đã được thêm vào Lịch tập cá nhân.
            </span>
          </div>
        </Alert>
      )}

      <div className="row g-4">
        {/* Booking Form Column */}
        <div className="col-lg-7">
          <div className="p-4 rounded-4" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <Form onSubmit={handleSubmit}>
              {/* Select Trainer */}
              <Form.Group className="mb-4">
                <Form.Label className="form-label-dark">
                  <FaUserCheck className="me-2" style={{ color: '#00E676' }} /> Chọn Huấn luyện viên (PT)
                </Form.Label>
                <Form.Select 
                  className="form-control-dark"
                  value={selectedPtId}
                  onChange={(e) => setSelectedPtId(e.target.value)}
                >
                  {trainersData.map(pt => (
                    <option key={pt.id} value={pt.id}>
                      {pt.name} — {pt.title} ({pt.rating} ★)
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Date & Location */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="form-label-dark">
                      <FaCalendarPlus className="me-2" style={{ color: '#00E676' }} /> Ngày tập
                    </Form.Label>
                    <Form.Control 
                      type="date" 
                      className="form-control-dark"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="form-label-dark">
                      <FaMapMarkerAlt className="me-2" style={{ color: '#00E676' }} /> Khu vực tập
                    </Form.Label>
                    <Form.Select 
                      className="form-control-dark"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      <option value="Khu A - Máy cơ Technogym">Khu A - Máy cơ Technogym</option>
                      <option value="Khu B - Free Weights Zone">Khu B - Free Weights Zone</option>
                      <option value="Phòng Studio Pilates VIP">Phòng Studio Pilates VIP</option>
                      <option value="Khu Functional Training & Boxing">Khu Functional Training & Boxing</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>

              {/* Select Time Slot */}
              <Form.Group className="mb-4">
                <Form.Label className="form-label-dark">
                  <FaClock className="me-2" style={{ color: '#00E676' }} /> Chọn khung giờ trống
                </Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {availableTimeSlots.map(slot => (
                    <button
                      type="button"
                      key={slot}
                      className={`toggle-btn py-2 px-3 ${timeSlot === slot ? 'active' : ''}`}
                      style={{ fontSize: '0.82rem' }}
                      onClick={() => setTimeSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </Form.Group>

              {/* Workout Type */}
              <Form.Group className="mb-4">
                <Form.Label className="form-label-dark">
                  <FaDumbbell className="me-2" style={{ color: '#00E676' }} /> Nội dung buổi tập
                </Form.Label>
                <Form.Select 
                  className="form-control-dark"
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                >
                  {workoutOptions.map((w, idx) => (
                    <option key={idx} value={w}>{w}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Notes */}
              <Form.Group className="mb-4">
                <Form.Label className="form-label-dark">Ghi chú cho PT (Nhức mỏi, tiền sử chấn thương...)</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  className="form-control-dark"
                  placeholder="Ví dụ: Cần tập trung giãn cơ lưng dưới, mỏi cổ vai xô..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Form.Group>

              <button type="submit" className="btn-card-action btn-green w-100 py-3 fs-6">
                Xác nhận Đặt Lịch Tập
              </button>
            </Form>
          </div>
        </div>

        {/* PT Preview Summary Info Column */}
        <div className="col-lg-5">
          <div className="p-4 rounded-4 h-100 d-flex flex-column justify-content-between" style={{ background: '#0F172A', border: '1px solid #1E293B' }}>
            <div>
              <div className="section-tag mb-2">HLV ĐÃ CHỌN</div>
              <div className="d-flex gap-3 align-items-center mb-3">
                <img 
                  src={currentTrainer.avatar} 
                  alt={currentTrainer.name} 
                  style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00E676' }} 
                />
                <div>
                  <h4 className="text-white fw-bold mb-1 fs-5">{currentTrainer.name}</h4>
                  <div style={{ color: '#00E676', fontSize: '0.82rem' }}>{currentTrainer.title}</div>
                  <div className="text-warning small mt-1">★ {currentTrainer.rating} ({currentTrainer.reviewsCount} học viên đánh giá)</div>
                </div>
              </div>

              <div className="p-3 rounded-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed #334155' }}>
                <div className="d-flex justify-content-between mb-2 style-sm">
                  <span className="text-muted">Ngày tập chọn:</span>
                  <strong className="text-white">{bookingDate}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2 style-sm">
                  <span className="text-muted">Khung giờ:</span>
                  <strong style={{ color: '#00E676' }}>{timeSlot}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2 style-sm">
                  <span className="text-muted">Nội dung:</span>
                  <strong className="text-white">{workoutType}</strong>
                </div>
                <div className="d-flex justify-content-between style-sm">
                  <span className="text-muted">Địa điểm:</span>
                  <strong className="text-white">{location}</strong>
                </div>
              </div>

              <div className="p-3 rounded-3" style={{ background: 'rgba(0, 230, 118, 0.08)', border: '1px solid rgba(0, 230, 118, 0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: '#00E676', fontWeight: 700 }} className="mb-1">
                  💡 LƯU Ý KHI THAM GIA BUỔI TẬP:
                </div>
                <ul className="mb-0 text-muted ps-3" style={{ fontSize: '0.78rem', lineHeight: '1.6' }}>
                  <li>Vui lòng có mặt trước 10 phút để thực hiện thủ tục Check-in RFID.</li>
                  <li>Nếu cần hủy lịch, hãy thực hiện trước 02 tiếng để PT xếp lịch học viên khác.</li>
                  <li>Được phục vụ khăn tập custom & nước uống ion kiềm miễn phí tại quầy.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
