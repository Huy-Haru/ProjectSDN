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
        <div className="row g-4">
          {cards.map(([label, value]) => (
            <div className="col-sm-6 col-xl-4" key={label}>
              <div
                className="p-4 rounded-4 h-100"
                style={{ background: "#0F172A", border: "1px solid #1E293B" }}
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
