import { useState } from "react";
import { queryString } from "../api/adminApi";
import { AdminShell, DataState } from "../components/admin/AdminUI";
import { money, useAdminData } from "../components/admin/adminHooks";
export default function AdminRevenuePage() {
  const [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const state = useAdminData("/reports/revenue" + queryString({ from, to }));
  return (
    <AdminShell
      title="Báo cáo doanh thu"
      description="Tính theo ngày thu tiền paidAt, múi giờ Việt Nam. Không tính các đăng ký chưa thanh toán."
    >
      <div className="d-flex flex-wrap gap-3 mb-4">
        <label>
          Từ ngày
          <input
            className="form-control"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          Đến ngày
          <input
            className="form-control"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <button
          className="btn btn-outline-success align-self-end"
          onClick={() => {
            setFrom("");
            setTo("");
          }}
        >
          Tất cả thời gian
        </button>
      </div>
      <DataState state={state}>
        {state.data?.missingPaidAt > 0 && (
          <div className="alert alert-warning">
            Có {state.data.missingPaidAt} đăng ký paid thiếu ngày thu, chưa được
            tính vào báo cáo. Cần đối soát dữ liệu cũ.
          </div>
        )}
        <div className="p-4 rounded-4 mb-4" style={{ background: "#0F172A" }}>
          <p className="text-secondary">Tổng doanh thu đã thu</p>
          <strong className="h2 text-success">
            {money(state.data?.amount)}
          </strong>
          <p className="mb-0 mt-2">
            {state.data?.count || 0} đăng ký đã thanh toán
          </p>
        </div>
        <div className="table-responsive">
          <table className="table table-dark">
            <thead>
              <tr>
                <th>Ngày thu (Việt Nam)</th>
                <th>Số đăng ký</th>
                <th>Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {state.data?.daily.map((row) => (
                <tr key={row._id}>
                  <td>{row._id}</td>
                  <td>{row.count}</td>
                  <td>{money(row.amount)}</td>
                </tr>
              ))}
              {state.data?.daily.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-5">
                    Chưa có khoản thu trong khoảng ngày này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DataState>
    </AdminShell>
  );
}
