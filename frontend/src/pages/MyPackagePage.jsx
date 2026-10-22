import { memberApi } from '../api/apiClient';
import { useApiResource } from '../hooks/useApiResource';
const load = () => memberApi.subscriptions().then(r => r.data.subscriptions);
const statuses = { pending: 'Chờ xác nhận', active: 'Đã kích hoạt', expired: 'Hết hạn', cancelled: 'Đã hủy' };
const day = date => new Date(date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
export default function MyPackagePage({ onNavigateToPackages }) {
  const { data, loading, error, reload } = useApiResource(load, 'my-subscriptions');
  return <section>
    <h2>Gói tập của tôi</h2>
    <button className="btn btn-success mb-3" onClick={onNavigateToPackages}>Đăng ký gói tập</button>
    {loading && <p role="status">Đang tải đăng ký...</p>}
    {error && <div role="alert">{error} <button onClick={reload}>Thử lại</button></div>}
    {!loading && !error && !data.length && <p>Bạn chưa đăng ký gói tập nào.</p>}
    {data.map(sub => <article className="border rounded-3 p-4 mb-3" key={sub._id}>
      <h3>{sub.package?.name || 'Gói không còn trong danh mục'}</h3>
      <p>{statuses[sub.status]} · {sub.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
      <p>{day(sub.startDate)} – {day(sub.endDate)} (giờ Việt Nam)</p>
      <p>Số tiền đăng ký: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sub.amount)}</p>
      {sub.status === 'pending' && <p>Vui lòng thanh toán tại quầy. Admin sẽ xác nhận để kích hoạt gói.</p>}
      {sub.status === 'active' && new Date(sub.endDate) <= new Date() && <p>Thời hạn sử dụng đã kết thúc.</p>}
    </article>)}
  </section>;
}
