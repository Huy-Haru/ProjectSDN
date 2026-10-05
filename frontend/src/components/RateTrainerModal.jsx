import React, { useState, useEffect } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { FaStar, FaCommentAlt, FaUserCheck } from 'react-icons/fa';
import { trainersData } from '../data/mockData';

const RateTrainerModal = ({ show, onHide, trainerToReview, onSubmitReview }) => {
  const [trainerId, setTrainerId] = useState(trainersData[0].id);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (trainerToReview) {
      setTrainerId(trainerToReview.id);
    }
  }, [trainerToReview]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentPt = trainersData.find(pt => pt.id === trainerId) || trainersData[0];
    
    const newReview = {
      id: `rev_${Date.now()}`,
      trainerId: currentPt.id,
      trainerName: currentPt.name,
      trainerAvatar: currentPt.avatar,
      studentName: 'Nguyễn Văn An',
      rating: Number(rating),
      date: new Date().toLocaleDateString('vi-VN'),
      comment: comment
    };

    onSubmitReview(newReview);
    setComment('');
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="modal-content-dark">
      <div className="modal-header-dark d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <FaCommentAlt style={{ color: '#00E676' }} />
          <h5 className="modal-title mb-0">Đánh Giá Huấn Luyện Viên</h5>
        </div>
        <button type="button" className="btn-close" onClick={onHide}></button>
      </div>

      <div className="modal-body-dark">
        <Form onSubmit={handleSubmit}>
          {/* Select Trainer */}
          <Form.Group className="mb-3">
            <Form.Label className="form-label-dark">
              <FaUserCheck className="me-2" style={{ color: '#00E676' }} /> Chọn Huấn luyện viên
            </Form.Label>
            <Form.Select 
              className="form-control-dark"
              value={trainerId}
              onChange={(e) => setTrainerId(e.target.value)}
            >
              {trainersData.map(pt => (
                <option key={pt.id} value={pt.id}>
                  {pt.name} ({pt.title})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Rating Stars */}
          <Form.Group className="mb-3">
            <Form.Label className="form-label-dark">Mức độ hài lòng</Form.Label>
            <div className="d-flex gap-2 align-items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="btn p-0 border-0 bg-transparent"
                  onClick={() => setRating(star)}
                >
                  <FaStar 
                    style={{ 
                      fontSize: '1.8rem', 
                      color: star <= rating ? '#FFC107' : '#334155',
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }} 
                  />
                </button>
              ))}
              <span className="ms-2 fw-bold text-warning">{rating} / 5 Sao</span>
            </div>
          </Form.Group>

          {/* Comment */}
          <Form.Group className="mb-4">
            <Form.Label className="form-label-dark">Nhận xét chi tiết</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={4} 
              className="form-control-dark" 
              placeholder="Chia sẻ nhận xét của bạn về bài tập, phương pháp huấn luyện của PT..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </Form.Group>

          <button type="submit" className="btn-card-action btn-green w-100 py-2.5">
            Gửi Đánh Giá
          </button>
        </Form>
      </div>
    </Modal>
  );
};

export default RateTrainerModal;
