import { useCallback, useState } from 'react';
import { trainerApi } from '../api/apiClient';
import { useApiResource } from '../hooks/useApiResource';
const labels = {active:'Đang áp dụng',completed:'Hoàn thành',cancelled:'Đã hủy'};
const blankItem = () => ({dayOfWeek:'',exerciseName:'',sets:3,reps:'10',note:''});

function PlanEditor({plan,onSaved,onCancel}) {
  const [title,setTitle] = useState(plan.title);
  const [goal,setGoal] = useState(plan.goal || '');
  const [startDate,setStart] = useState(plan.startDate.slice(0,10));
  const [endDate,setEnd] = useState(plan.endDate.slice(0,10));
  const [status,setStatus] = useState(plan.status);
  const [items,setItems] = useState(() => plan.items.map(item=>({...item})));
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  function change(index,key,value) { setItems(old=>old.map((item,i)=>i===index ? {...item,[key]:value} : item)); }
  async function submit(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await trainerApi.updateWorkoutPlan(plan._id,{title,goal,startDate,endDate,status,expectedVersion:plan.__v,items:items.map(({dayOfWeek,exerciseName,sets,reps,note})=>({dayOfWeek,exerciseName,sets:Number(sets),reps,note}))});
      onSaved();
    } catch(err) {setError(err.message);}
    finally {setSaving(false);}
  }
  return <form className="border rounded-3 p-3 mt-3" aria-label="Chỉnh sửa giáo án" onSubmit={submit}>
    <h4>Chỉnh sửa giáo án</h4>
    <fieldset disabled={saving}>
      <label htmlFor="plan-title">Tên giáo án</label><input id="plan-title" className="form-control mb-2" required value={title} onChange={e=>setTitle(e.target.value)} />
      <label htmlFor="plan-goal">Mục tiêu giáo án</label><textarea id="plan-goal" className="form-control mb-2" value={goal} onChange={e=>setGoal(e.target.value)} />
      <label htmlFor="plan-start">Ngày bắt đầu giáo án</label><input id="plan-start" className="form-control mb-2" type="date" required value={startDate} onChange={e=>setStart(e.target.value)} />
      <label htmlFor="plan-end">Ngày kết thúc giáo án</label><input id="plan-end" className="form-control mb-2" type="date" required value={endDate} onChange={e=>setEnd(e.target.value)} />
      <label htmlFor="plan-status">Trạng thái giáo án</label><select id="plan-status" className="form-select mb-2" value={status} onChange={e=>setStatus(e.target.value)}>{Object.entries(labels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
      {items.map((item,index)=><div className="border rounded-3 p-3 mb-2" key={index}>
        <label htmlFor={`exercise-day-${index}`}>Ngày bài {index+1}</label><input id={`exercise-day-${index}`} className="form-control mb-2" value={item.dayOfWeek || ''} onChange={e=>change(index,'dayOfWeek',e.target.value)} />
        <label htmlFor={`exercise-name-${index}`}>Tên bài {index+1}</label><input id={`exercise-name-${index}`} className="form-control mb-2" required value={item.exerciseName} onChange={e=>change(index,'exerciseName',e.target.value)} />
        <label htmlFor={`exercise-sets-${index}`}>Số hiệp bài {index+1}</label><input id={`exercise-sets-${index}`} className="form-control mb-2" type="number" min="1" step="1" required value={item.sets} onChange={e=>change(index,'sets',e.target.value)} />
        <label htmlFor={`exercise-reps-${index}`}>Số lần lặp bài {index+1}</label><input id={`exercise-reps-${index}`} className="form-control mb-2" required value={item.reps} onChange={e=>change(index,'reps',e.target.value)} />
        <label htmlFor={`exercise-note-${index}`}>Ghi chú bài {index+1}</label><input id={`exercise-note-${index}`} className="form-control mb-2" value={item.note || ''} onChange={e=>change(index,'note',e.target.value)} />
        <button className="btn btn-outline-danger" type="button" onClick={()=>setItems(old=>old.filter((_,i)=>i!==index))}>Xóa bài {index+1}</button>
      </div>)}
      <button className="btn btn-secondary mb-3" type="button" onClick={()=>setItems(old=>[...old,blankItem()])}>Thêm bài vào giáo án</button>
      <div><button className="btn btn-success me-2">{saving ? 'Đang lưu...' : 'Lưu giáo án'}</button><button className="btn btn-secondary" type="button" onClick={onCancel}>Bỏ thay đổi</button></div>
    </fieldset>
    {error && <p role="alert">{error}</p>}
  </form>;
}
export default function TrainerPlansPanel({member,onClose}) {
  const [page,setPage] = useState(1);
  const [status,setStatus] = useState('');
  const load = useCallback(()=>trainerApi.getWorkoutPlans({memberId:member._id,page,limit:5,...(status ? {status} : {})}).then(r=>r.data),[member._id,page,status]);
  const {data,loading,error,reload} = useApiResource(load,JSON.stringify([member._id,page,status]));
  const plans = data.plans || [];
  const [editing,setEditing] = useState(null);
  const [message,setMessage] = useState('');
  return <section className="border rounded-3 p-4 mt-4" aria-label="Giáo án học viên"><h3>Giáo án: {member.fullName}</h3>
    <button className="btn btn-secondary me-2 mb-3" disabled={!!editing} onClick={onClose}>Đóng giáo án</button>
    <button className="btn btn-secondary mb-3" disabled={!!editing || loading} onClick={reload}>Tải lại giáo án</button>
    <label htmlFor="plans-status-filter">Lọc trạng thái giáo án</label>
    <select id="plans-status-filter" className="form-select mb-3" disabled={!!editing} value={status} onChange={e=>{setStatus(e.target.value);setPage(1);setMessage('');}}>
      <option value="">Tất cả</option>{Object.entries(labels).map(([k,v])=><option key={k} value={k}>{v}</option>)}
    </select>
    {!error && <nav aria-label="Phân trang giáo án" className="d-flex flex-wrap align-items-center gap-2 mb-3">
      <button className="btn btn-secondary" disabled={!!editing || loading || page<=1} onClick={()=>setPage(n=>n-1)}>Trang giáo án trước</button>
      <span>{loading ? 'Đang tải trang...' : `Giáo án: trang ${page}/${Math.max(1,data.pages || 0)} · ${data.total || 0} kết quả`}</span>
      <button className="btn btn-secondary" disabled={!!editing || loading || page>=Math.max(1,data.pages || 0)} onClick={()=>setPage(n=>n+1)}>Trang giáo án sau</button>
    </nav>}
    {message && <p role="status">{message}</p>}
    {loading && <p role="status">Đang tải giáo án...</p>}
    {error && <div role="alert">{error} <button onClick={reload}>Thử lại</button></div>}
    {!loading && !error && !plans.length && <p>Không có giáo án phù hợp ở trang này.</p>}
    {!editing && plans.map(plan=><article className="border rounded-3 p-3 mb-3" key={plan._id}>
      <h4>{plan.title}</h4><p>{labels[plan.status]} · {plan.startDate.slice(0,10)} – {plan.endDate.slice(0,10)}</p><p>{plan.goal}</p>
      <ul>{plan.items.map(item=><li key={item._id}>{item.dayOfWeek}: {item.exerciseName} · {item.sets} hiệp × {item.reps} lần {item.note && `· ${item.note}`}</li>)}</ul>
      <button className="btn btn-success" onClick={()=>{setMessage('');setEditing(plan);}}>Sửa giáo án</button>
    </article>)}
    {editing && <PlanEditor key={editing._id} plan={editing} onCancel={()=>setEditing(null)} onSaved={()=>{setEditing(null);setMessage('Đã cập nhật giáo án.');setPage(1);reload();}} />}
  </section>;
}
