import { useCallback, useState } from 'react';
import { progressApi } from '../api/apiClient';
import { useApiResource } from '../hooks/useApiResource';
export default function TrainerProgressPanel({ member, onClose }) {
  const load = useCallback(() => progressApi.forMember(member._id).then(r => r.data.logs), [member._id]);
  const {data, loading, error, reload} = useApiResource(load, member._id);
  const [date, setDate] = useState(() => new Date(Date.now()+7*3600000).toISOString().slice(0,10));
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bodyFat, setFat] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [failure, setFailure] = useState('');
  async function submit(e) {
    e.preventDefault(); setSaving(true); setMessage(''); setFailure('');
    const payload = {date,note};
    for (const [key,value] of Object.entries({weight,height,bodyFat})) if(value !== '') payload[key] = Number(value);
    try { await progressApi.create(member._id,payload); setWeight(''); setHeight(''); setFat(''); setNote(''); setMessage('Đã lưu tiến độ.'); reload(); }
    catch(err) { setFailure(err.message); }
    finally { setSaving(false); }
  }
  return <section className="border rounded-3 p-4 mt-4" aria-label="Tiến độ học viên">
    <h3>Tiến độ: {member.fullName}</h3>
    <button className="btn btn-secondary mb-3" disabled={saving} onClick={onClose}>Đóng tiến độ</button>
    <form onSubmit={submit}>
      <fieldset disabled={saving}>
        <label htmlFor="progress-date">Ngày ghi nhận</label><input id="progress-date" className="form-control mb-2" type="date" required value={date} onChange={e=>setDate(e.target.value)} />
        <label htmlFor="progress-weight">Cân nặng (kg)</label><input id="progress-weight" className="form-control mb-2" type="number" min="0" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)} />
        <label htmlFor="progress-height">Chiều cao (cm)</label><input id="progress-height" className="form-control mb-2" type="number" min="0" step="0.1" value={height} onChange={e=>setHeight(e.target.value)} />
        <label htmlFor="progress-fat">Tỷ lệ mỡ (%)</label><input id="progress-fat" className="form-control mb-2" type="number" min="0" max="100" step="0.1" value={bodyFat} onChange={e=>setFat(e.target.value)} />
        <label htmlFor="progress-note">Nhận xét tiến độ</label><textarea id="progress-note" className="form-control mb-3" maxLength={2000} value={note} onChange={e=>setNote(e.target.value)} />
        <button className="btn btn-success">{saving ? 'Đang lưu...' : 'Lưu tiến độ'}</button>
      </fieldset>
    </form>
    {message && <p role="status">{message}</p>}{failure && <p role="alert">{failure}</p>}
    {loading && <p role="status">Đang tải tiến độ...</p>}
    {error && <div role="alert">{error} <button onClick={reload}>Thử lại</button></div>}
    {!loading && !error && !data.length && <p>Chưa có ghi nhận của bạn cho học viên này.</p>}
    {data.map(log=><article className="border rounded-3 p-3 mt-3" key={log._id}>
      <strong>{new Date(log.date).toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})}</strong>
      <p>Cân nặng: {log.weight ?? '—'} kg · Chiều cao: {log.height ?? '—'} cm · Tỷ lệ mỡ: {log.bodyFat ?? '—'}%</p><p>{log.note}</p>
    </article>)}
  </section>;
}
