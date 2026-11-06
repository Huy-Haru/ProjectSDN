import { useState } from "react";
import { adminRequest, queryString } from "../api/adminApi";
import {
  AdminShell,
  DataState,
  Feedback,
  Pager,
  Status,
} from "../components/admin/AdminUI";
import { date, money, useAdminData } from "../components/admin/adminHooks";
export default function AdminPaymentsPage() {
  const [paymentStatus, setStatus] = useState("unpaid"),
    [page, setPage] = useState(1),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false);
  const state = useAdminData(
    "/subscriptions" + queryString({ paymentStatus, page }),
  );
  const confirm = async (item) => {
    if (
      !window.confirm(
        "Xác nhận đã nhận " + money(item.amount) + " từ hội viên?",
      )
    )
      return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await adminRequest(
        "/subscriptions/" + item._id + "/confirm-payment",
        "POST",
      );
      setSuccess("Đã xác nhận thanh toán và cập nhật gói");
      state.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <AdminShell
      title="Xác nhận thanh toán"
      description="Chỉ xác nhận sau khi thực tế đã thu tiền. Hệ thống lưu thời điểm thu và giữ nguyên giá đăng ký."
    >
      <Feedback error={error} success={success} />
      <label className="mb-4">
        Thanh toán
        <select
          className="form-select"
          value={paymentStatus}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="unpaid">Chưa thanh toán</option>
          <option value="paid">Đã thanh toán</option>
          <option value="">Tất cả</option>
        </select>
      </label>
      <DataState state={state}>
        <div className="table-responsive">
          <table className="table table-dark align-middle">
            <thead>
              <tr>
                <th>Hội viên / gói</th>
                <th>Thời hạn</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Ngày thu</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {state.data?.items.map((item) => (
                <tr key={item._id}>
                  <td>
                    {item.member?.fullName || "—"}
                    <br />
                    <small>{item.package?.name || "—"}</small>
                  </td>
                  <td>
                    {date(item.startDate)}–{date(item.endDate)}
                  </td>
                  <td>{money(item.amount)}</td>
                  <td>
                    <Status value={item.paymentStatus} />
                    <br />
                    <Status value={item.status} />
                  </td>
                  <td>{date(item.paidAt)}</td>
                  <td>
                    {item.paymentStatus === "unpaid" &&
                      item.status === "pending" && (
                        <button
                          disabled={busy}
                          className="btn btn-success btn-sm"
                          onClick={() => confirm(item)}
                        >
                          Xác nhận đã thu tiền
                        </button>
                      )}
                  </td>
                </tr>
              ))}
              {state.data?.items.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    Chưa có đăng ký phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pager data={state.data} setPage={setPage} />
      </DataState>
    </AdminShell>
  );
}
