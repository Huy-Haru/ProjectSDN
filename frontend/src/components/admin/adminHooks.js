import { useCallback, useEffect, useState } from "react";
import { adminRequest } from "../../api/adminApi";
export function useAdminData(path) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: "",
    path,
  });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    adminRequest(path)
      .then((data) => {
        if (active) setState({ data, loading: false, error: "", path });
      })
      .catch((error) => {
        if (active)
          setState({ data: null, loading: false, error: error.message, path });
      });
    return () => {
      active = false;
    };
  }, [path, revision]);
  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    setRevision((n) => n + 1);
  }, []);
  return {
    ...state,
    data: state.path === path ? state.data : null,
    loading: state.loading || state.path !== path,
    reload,
  };
}
export const money = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value || 0,
  );
export const date = (value) =>
  value
    ? new Date(value).toLocaleDateString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      })
    : "—";
export const labels = {
  booked: "Đã đặt",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  no_show: "Vắng mặt",
  pending: "Chờ xác nhận",
  active: "Có hiệu lực",
  expired: "Hết hạn",
  paid: "Đã thanh toán",
  unpaid: "Chưa thanh toán",
};
