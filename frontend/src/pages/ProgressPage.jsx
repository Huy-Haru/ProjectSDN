import { progressApi, trainerApi } from '../api/apiClient';
import { useApiResource } from '../hooks/useApiResource';
const load = async () => {
  const [logs, plans] = await Promise.all([progressApi.mine(), trainerApi.getMemberWorkoutPlans()]);
  return {logs:logs.data.logs, plans:plans.data.plans};
};
const day = value => new Date(value).toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'});
const statuses = {active:'Đang áp dụng',completed:'Hoàn thành',cancelled:'Đã hủy'};
export default function ProgressPage() {
  const {data, loading, error, reload} = useApiResource(load,'member-progress');
  if(loading) return <p role="status">Đang tải tiến độ và giáo án...</p>;
  if(error) return <div role="alert">{error} <button onClick={reload}>Thử lại</button></div>;
  return <section><h2>Tiến độ & Thể trạng</h2>
    <p>Các chỉ số và nhận xét do PT ghi nhận. Những chỉ số chưa đo được hiển thị bằng dấu —.</p>
    {!data.logs.length && <p>Chưa có dữ liệu thể trạng từ PT.</p>}
    {data.logs.map(log=><article className="border rounded-3 p-4 mb-3" key={log._id}>
      <h3>{day(log.date)}</h3><p>PT: {log.trainer?.user?.fullName || 'Không còn hồ sơ PT'}</p>
      <p>Cân nặng: {log.weight ?? '—'} kg · Chiều cao: {log.height ?? '—'} cm · Tỷ lệ mỡ: {log.bodyFat ?? '—'}%</p>
      <p>Số buổi hoàn thành với PT này đến ngày ghi nhận: {log.attendedSessions}</p><p>{log.note}</p>
    </article>)}
    <h2>Giáo án của tôi</h2>
    {!data.plans.length && <p>PT chưa giao giáo án cho bạn.</p>}
    {data.plans.map(plan=><article className="border rounded-3 p-4 mb-3" key={plan._id}>
      <h3>{plan.title}</h3><p>{plan.trainerUser?.fullName || 'PT không còn hồ sơ'} · {statuses[plan.status]}</p>
      <p>{day(plan.startDate)} – {day(plan.endDate)}</p><p>Mục tiêu: {plan.goal || '—'}</p>
      <ul>{plan.items.map(item=><li key={item._id}>{item.dayOfWeek}: {item.exerciseName} · {item.sets} hiệp × {item.reps} lần {item.note && `· ${item.note}`}</li>)}</ul>
    </article>)}
  </section>;
}
