import { FaArrowRight, FaCalendarCheck, FaDumbbell, FaHeart, FaQrcode, FaShieldAlt, FaUsers } from 'react-icons/fa';

const highlights = [
  { icon: <FaCalendarCheck />, title: 'Lịch tập rõ ràng', text: 'Đặt lịch PT, xem ca tập và nhận nhắc lịch trong một không gian dễ dùng.' },
  { icon: <FaUsers />, title: 'Đúng người, đúng mục tiêu', text: 'Tìm PT theo chuyên môn, mục tiêu và lịch rảnh trước khi đặt buổi đầu tiên.' },
  { icon: <FaQrcode />, title: 'Check in nhanh', text: 'Tạo QR hội viên mô phỏng để ra vào phòng tập thuận tiện hơn mỗi ngày.' },
];

export function HomePage({ onNavigate }) {
  return <div className="public-page">
    <section className="public-hero">
      <div className="public-hero-copy">
        <span className="public-kicker">FITMANAGER · FITNESS OPERATING SYSTEM</span>
        <h1>Phòng tập vận hành gọn. Hội viên tập đều hơn.</h1>
        <p>FitManager kết nối chủ phòng tập, huấn luyện viên và hội viên trên một nền tảng. Từ gói tập, lịch PT đến tiến độ mỗi ngày.</p>
        <div className="public-actions">
          <button className="btn btn-primary btn-lg" onClick={() => onNavigate('/register')}>Bắt đầu tập luyện <FaArrowRight /></button>
          <button className="btn btn-outline-light btn-lg" onClick={() => onNavigate('/about')}>Khám phá hệ thống</button>
        </div>
        <div className="public-proof"><span><FaHeart /> Theo sát mục tiêu</span><span><FaShieldAlt /> Phân quyền an toàn</span></div>
      </div>
      <div className="public-hero-visual" role="img" aria-label="Không gian phòng tập hiện đại">
        <div className="hero-visual-badge"><FaDumbbell /><span>MOVE WITH PURPOSE</span></div>
        <div className="hero-visual-stat"><strong>24/7</strong><span>Quyền truy cập theo gói</span></div>
      </div>
    </section>

    <section className="public-section public-section-light">
      <div className="public-section-heading"><span className="public-kicker">MỘT HỆ THỐNG · BA TRẢI NGHIỆM</span><h2>Mọi vai trò có một không gian riêng</h2><p>Giao diện được thiết kế theo cách mỗi người thực sự làm việc tại phòng tập.</p></div>
      <div className="highlight-grid">{highlights.map(item => <article className="highlight-card" key={item.title}><div className="highlight-icon">{item.icon}</div><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
    </section>

    <section className="public-section public-section-image">
      <div className="public-image-copy"><span className="public-kicker">KHÔNG GIAN CỦA BẠN</span><h2>Đẹp từ sảnh đón khách đến dashboard quản lý</h2><p>Hình ảnh phòng tập, thông tin gói và lịch huấn luyện được trình bày rõ ràng để thương hiệu của bạn tạo ấn tượng ngay từ lần đầu.</p><button className="btn btn-primary" onClick={() => onNavigate('/context')}>Xem cách hệ thống vận hành <FaArrowRight /></button></div>
    </section>

    <section className="public-section public-section-light public-cta"><div><span className="public-kicker">SẴN SÀNG MỞ PHÒNG TẬP</span><h2>Khởi động FitManager cho đội ngũ của bạn</h2><p>Tạo tài khoản hội viên để trải nghiệm luồng đặt lịch, gói tập và theo dõi tiến độ.</p></div><button className="btn btn-primary btn-lg" onClick={() => onNavigate('/register')}>Tạo tài khoản</button></section>
  </div>;
}

export function AboutPage({ onNavigate }) {
  return <div className="public-page"><section className="public-inner-page"><span className="public-kicker">ABOUT FITMANAGER</span><h1>Quản lý phòng tập theo cách đội ngũ của bạn làm việc</h1><p className="lead">FitManager là nền tảng quản lý phòng tập và huấn luyện viên dành cho những câu lạc bộ muốn vận hành minh bạch, chăm hội viên tốt hơn và mở rộng bền vững.</p><div className="about-grid"><article><span>01</span><h2>Chủ phòng tập</h2><p>Quản lý PT, hội viên, gói tháng/quý/năm, thanh toán chờ duyệt và doanh thu từ một portal quản trị.</p></article><article><span>02</span><h2>Huấn luyện viên</h2><p>Điều phối lịch dạy, xem học viên liên quan, tạo giáo án và ghi lại tiến độ sau từng buổi.</p></article><article><span>03</span><h2>Hội viên</h2><p>Chọn gói, đặt PT, xem lịch, tạo QR check in và gửi đường dẫn ảnh hoặc video làm bằng chứng luyện tập.</p></article></div><button className="btn btn-primary" onClick={() => onNavigate('/register')}>Trải nghiệm FitManager <FaArrowRight /></button></section></div>;
}

export function ContextPage() {
  return <div className="public-page"><section className="public-inner-page"><span className="public-kicker">SYSTEM CONTEXT</span><h1>Một luồng liền mạch từ mục tiêu đến kết quả</h1><p className="lead">Mỗi mũi tên trong hệ thống đại diện cho một luồng nghiệp vụ rõ ràng, giúp đội ngũ không bị mất thông tin giữa quầy lễ tân, PT và hội viên.</p><div className="context-map"><div className="context-node context-node-accent"><FaDumbbell /><strong>FitManager</strong><span>Web + REST API</span></div><div className="context-flow"><div><b>Chủ phòng tập</b><span>gói · PT · thanh toán · doanh thu</span></div><div><b>Huấn luyện viên</b><span>lịch · học viên · giáo án · tiến độ</span></div><div><b>Hội viên</b><span>đăng ký · đặt lịch · QR · bằng chứng tập</span></div></div><div className="context-node"><strong>MongoDB</strong><span>users · bookings · plans · progress</span></div></div></section></div>;
}

export function Footer({ onNavigate }) {
  return <footer className="public-footer"><div><div className="footer-brand"><span className="brand-mark"><FaDumbbell /></span><strong>FitManager</strong></div><p>Quản lý phòng tập và huấn luyện viên cho hành trình tập luyện bền vững.</p></div><div className="footer-links"><button onClick={() => onNavigate('/')}>Trang chủ</button><button onClick={() => onNavigate('/about')}>Về FitManager</button><button onClick={() => onNavigate('/context')}>Cách hoạt động</button><button onClick={() => onNavigate('/login')}>Đăng nhập</button></div><small>© 2026 FitManager · Dự án phòng tập mẫu</small></footer>;
}

export function AccessGate({ onNavigate }) {
  return <div className="access-gate"><div className="access-gate-icon"><FaShieldAlt /></div><h1>Khu vực dành cho thành viên</h1><p>Đăng nhập để mở workspace riêng cho vai trò của bạn. Khách chưa đăng nhập vẫn có thể xem thông tin hệ thống và gói tập.</p><div className="public-actions"><button className="btn btn-primary" onClick={() => onNavigate('/login')}>Đăng nhập</button><button className="btn btn-outline-secondary" onClick={() => onNavigate('/register')}>Tạo tài khoản</button></div></div>;
}
