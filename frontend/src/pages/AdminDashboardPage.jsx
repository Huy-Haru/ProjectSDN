import { AdminShell, DataState } from "../components/admin/AdminUI";
import { money, useAdminData } from "../components/admin/adminHooks";
export default function AdminDashboardPage() {
  const state = useAdminData("/dashboard");
  const cards = [
    ["Hội viên hoạt động", state.data?.members],
    ["PT hoạt động", state.data?.trainers],
    ["Gói đang bán", state.data?.packages],
    ["Lịch đang đặt", state.data?.booked],
    ["Chờ thanh toán", state.data?.pendingPayments],
    ["Doanh thu đã thu", money(state.data?.revenue)],
  ];
  return (
    <AdminShell
      title="Tổng quan quản trị"
      description="Số liệu trực tiếp từ MongoDB. Doanh thu chỉ gồm đăng ký đã paid và có paidAt."
      action={
        <button
          className="btn btn-outline-success align-self-start"
          onClick={state.reload}
        >
          Làm mới
        </button>
      }
    >
      <DataState state={state}>
        <div className="admin-command-banner"><div><span className="eyebrow">CONTROL ROOM</span><h2>Phòng tập đang vận hành ổn định</h2><p>Theo dõi hội viên, PT, doanh thu và các khoản cần xác nhận trong cùng một màn hình.</p></div><div className="admin-command-mark">FM<span>+</span></div></div>
        <div className="row g-4">
          {cards.map(([label, value]) => (
            <div className="col-sm-6 col-xl-4" key={label}>
              <div
                className="admin-stat-tile"
              >
                <div className="text-secondary mb-3">{label}</div>
                <strong className="h2 text-success">{value ?? 0}</strong>
              </div>
            </div>
          ))}
        </div>
      </DataState>
    </AdminShell>
  );
}
