import { useEffect, useState } from 'react';
import { checkConnection } from '../services/api';
export default function ConnectionStatus() {
  const [status, setStatus] = useState('Đang kiểm tra kết nối...');
  useEffect(() => {
    let active = true;
    checkConnection().then(() => { if (active) setStatus('Đã kết nối máy chủ và cơ sở dữ liệu'); }).catch(() => { if (active) setStatus('Chưa kết nối được máy chủ hoặc cơ sở dữ liệu'); });
    return () => { active = false; };
  }, []);
  return <div role="status" className="px-4 py-2 text-secondary small">{status}</div>;
}
