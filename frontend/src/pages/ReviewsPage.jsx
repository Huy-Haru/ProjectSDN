import { useCallback, useState } from 'react';
import { reviewApi } from '../api/apiClient';
import { useApiResource } from '../hooks/useApiResource';
const day = date => date ? date.slice(0,10) : '—';
export default function ReviewsPage({ role = 'member' }) {
  const isTrainer = role === 'trainer';
  const load = useCallback(() => (isTrainer ? reviewApi.forTrainer() : reviewApi.mine()).then(r => r.data), [isTrainer]);
  const {data, loading, error, reload} = useApiResource(load, role);
  const [bookingId, setBooking] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState('');
  const [message, setMessage] = useState('');
  async function submit(e) {
    e.preventDefault(); setSaving(true); setFailure(''); setMessage('');
    try { await reviewApi.create({bookingId,rating:Number(rating),comment}); setBooking(''); setComment(''); setRating('5'); setMessage('Đã gửi đánh giá.'); reload(); }
    catch(err) { setFailure(err.message); }
    finally { setSaving(false); }
  }
  return <section><h2>{isTrainer ? 'Đánh giá từ học viên' : 'Đánh giá PT của tôi'}</h2>
    {loading && <p role="status">Đang tải đánh giá...</p>}
    {error && <div role="alert">{error} <button onClick={reload}>Thử lại</button></div>}
    {failure && <p role="alert">{failure}</p>}{message && <p role="status">{message}</p>}
    {!loading && !error && <>
      {isTrainer ? <p>{data.summary.count} đánh giá · {data.summary.count ? `${data.summary.average}/5 sao` : 'Chưa có điểm đánh giá'}</p> :
        data.eligible.length ? <form className="border rounded-3 p-4 mb-4" onSubmit={submit}>
          <fieldset disabled={saving}>
            <p>Chỉ đánh giá buổi đã hoàn thành, mỗi buổi một lần.</p>
            <label htmlFor="review-booking">Buổi tập</label><select id="review-booking" className="form-select mb-3" required value={bookingId} onChange={e=>setBooking(e.target.value)}>
              <option value="">Chọn buổi tập</option>{data.eligible.map(b=><option key={b._id} value={b._id}>{b.trainer?.user?.fullName || 'PT'} · {day(b.date)} {b.startTime}</option>)}
            </select>
            <label htmlFor="review-rating">Số sao</label><select id="review-rating" className="form-select mb-3" value={rating} onChange={e=>setRating(e.target.value)}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} sao</option>)}</select>
            <label htmlFor="review-comment">Nhận xét</label><textarea id="review-comment" className="form-control mb-3" maxLength={2000} value={comment} onChange={e=>setComment(e.target.value)} />
            <button className="btn btn-success">{saving ? 'Đang gửi...' : 'Gửi đánh giá'}</button>
          </fieldset>
        </form> : <p>Chưa có buổi đã hoàn thành nào cần đánh giá.</p>}
      {!data.reviews.length && <p>Chưa có đánh giá.</p>}
      {data.reviews.map(review=><article className="border rounded-3 p-4 mb-3" key={review._id}>
        <h3>{isTrainer ? review.member?.fullName || 'Hội viên' : review.trainer?.user?.fullName || 'PT'}</h3>
        <p>{review.rating}/5 sao · Buổi {day(review.booking?.date)} {review.booking?.startTime}</p><p>{review.comment || 'Không có nhận xét.'}</p>
      </article>)}
    </>}
  </section>;
}
