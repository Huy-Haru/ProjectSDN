import { useState } from "react";
import { adminRequest, queryString } from "../api/adminApi";
import {
  AdminShell,
  DataState,
  Feedback,
  Pager,
  Status,
} from "../components/admin/AdminUI";
import { date, useAdminData } from "../components/admin/adminHooks";
export default function AdminSchedulesPage() {
  const [filters, setFilters] = useState({ status: "", from: "", to: "" }),
    [page, setPage] = useState(1),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false);
  const state = useAdminData("/bookings" + queryString({ ...filters, page }));
  const change = (e) => {
    setFilters((s) => ({ ...s, [e.target.name]: e.target.value }));
    setPage(1);
  };
  const update = async (item, status) => {
    if (!window.confirm("Xác nhận cập nhật trạng thái buổi tập?")) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await adminRequest("/bookings/" + item._id + "/status", "PATCH", {
        status,
      });
      setSuccess("Đã cập nhật lịch");
      state.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <AdminShell
      title="Quản lý lịch tập"
      description="Giữ lịch sử khi hủy. Trạng thái kết thúc không được chuyển ngược."
    >
      <Feedback error={error} success={success} />
      <div className="d-flex flex-wrap gap-3 mb-4">
        <label>
          Trạng thái
          <select
            className="form-select"
            name="status"
            value={filters.status}
            onChange={change}
          >
            <option value="">Tất cả</option>
            {["booked", "completed", "cancelled", "no_show"].map((s) => (
              <option value={s} key={s}>
                {
                  {
                    booked: "Đã đặt",
                    completed: "Hoàn thành",
                    cancelled: "Đã hủy",
                    no_show: "Vắng mặt",
                  }[s]
                }
              </option>
            ))}
          </select>
        </label>
        <label>
          Từ ngày
          <input
            className="form-control"
            type="date"
            name="from"
            value={filters.from}
            onChange={change}
          />
        </label>
        <label>
          Đến ngày
          <input
            className="form-control"
            type="date"
            name="to"
            value={filters.to}
            onChange={change}
          />
        </label>
      </div>
      <DataState state={state}>
        <div className="table-responsive">
          <table className="table table-dark align-middle">
            <thead>
              <tr>
                <th>Hội viên</th>
                <th>PT</th>
                <th>Ngày / giờ</th>
                <th>Gói</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {state.data?.items.map((item) => (
                <tr key={item._id}>
                  <td>
                    {item.member?.fullName || "Tài khoản không còn tồn tại"}
                  </td>
                  <td>{item.trainer?.user?.fullName || "—"}</td>
                  <td>
                    {date(item.date)}
                    <br />
                    {item.startTime}–{item.endTime}
                  </td>
                  <td>{item.subscription?.package?.name || "—"}</td>
                  <td>
                    <Status value={item.status} />
                  </td>
                  <td>
                    {item.status === "booked" && (
                      <div className="d-flex flex-wrap gap-2">
                        {["completed", "no_show", "cancelled"].map((s) => (
                          <button
                            key={s}
                            disabled={busy}
                            className="btn btn-sm btn-outline-light"
                            onClick={() => update(item, s)}
                          >
                            {
                              {
                                completed: "Hoàn thành",
                                no_show: "Vắng mặt",
                                cancelled: "Hủy",
                              }[s]
                            }
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {state.data?.items.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    Chưa có lịch phù hợp
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
