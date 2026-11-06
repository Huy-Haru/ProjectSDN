import { useMemo, useState } from 'react';
import { FaArrowRight, FaQrcode, FaBolt } from 'react-icons/fa';

export function PageIntro({ eyebrow, title, description, action }) {
  return (
    <div className="page-intro">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, detail, icon, tone = 'green' }) {
  return (
    <article className={`stat-card stat-card-${tone}`}>
      <div className="stat-card-top"><span className="stat-label">{label}</span><span className="stat-icon">{icon}</span></div>
      <strong className="stat-number">{value}</strong>
      {detail && <span className="stat-detail">{detail}</span>}
    </article>
  );
}

export function SectionCard({ title, description, action, children, className = '' }) {
  return <section className={`section-card ${className}`}>
    {(title || description || action) && <div className="section-card-head"><div>{title && <h2>{title}</h2>}{description && <p>{description}</p>}</div>{action}</div>}
    {children}
  </section>;
}

export function EmptyState({ title, description, action }) {
  return <div className="empty-state"><div className="empty-state-mark">⌁</div><h3>{title}</h3><p>{description}</p>{action}</div>;
}

function makeMatrix(seed) {
  const size = 21;
  const matrix = Array.from({ length: size }, () => Array(size).fill(false));
  const hash = String(seed).split('').reduce((acc, char) => ((acc * 31) + char.charCodeAt(0)) >>> 0, 7);
  const finder = (x, y) => {
    for (let row = 0; row < 7; row += 1) for (let col = 0; col < 7; col += 1) {
      const edge = row === 0 || row === 6 || col === 0 || col === 6;
      matrix[y + row][x + col] = edge || (row >= 2 && row <= 4 && col >= 2 && col <= 4);
    }
  };
  finder(0, 0); finder(size - 7, 0); finder(0, size - 7);
  for (let row = 0; row < size; row += 1) for (let col = 0; col < size; col += 1) {
    if (matrix[row][col]) continue;
    matrix[row][col] = ((hash + row * 17 + col * 29 + row * col) % 7) < 3;
  }
  return matrix;
}

export function CheckInWallet({ user }) {
  const [amount, setAmount] = useState('500000');
  const [showQr, setShowQr] = useState(false);
  const seed = `${user?.email || 'guest'}-${amount}`;
  const matrix = useMemo(() => makeMatrix(seed), [seed]);
  return <SectionCard className="wallet-card" title="Ví hội viên" description="Nạp tiền mô phỏng để tạo mã QR check in tại quầy." action={<FaBolt className="text-warning" />}>
    <div className="wallet-layout">
      <div>
        <span className="stat-label">Số dư mô phỏng</span><strong className="wallet-balance">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(0)}</strong>
        <label className="field-label" htmlFor="top-up-amount">Mệnh giá nạp</label>
        <select id="top-up-amount" className="form-select form-control-dark" value={amount} onChange={event => setAmount(event.target.value)}><option value="200000">200.000 ₫</option><option value="500000">500.000 ₫</option><option value="1000000">1.000.000 ₫</option></select>
        <button className="btn btn-success w-100 mt-3" type="button" onClick={() => setShowQr(true)}><FaQrcode className="me-2" />Tạo QR nạp tiền</button>
      </div>
      <div className={`qr-preview ${showQr ? 'is-visible' : ''}`} aria-label={showQr ? 'Mã QR nạp tiền mô phỏng' : 'Chưa tạo mã QR'}>
        {showQr ? <><div className="qr-grid">{matrix.flatMap((row, rowIndex) => row.map((cell, colIndex) => <span key={`${rowIndex}-${colIndex}`} className={cell ? 'qr-dark' : ''} />))}</div><small>QR mô phỏng · {Number(amount).toLocaleString('vi-VN')} ₫</small></> : <><FaQrcode /><span>QR sẽ hiện ở đây</span></>}
      </div>
    </div>
  </SectionCard>;
}

export function LinkButton({ children, onClick }) { return <button className="link-button" type="button" onClick={onClick}>{children}<FaArrowRight /></button>; }
