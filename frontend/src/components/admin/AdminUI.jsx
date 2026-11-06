import { labels } from "./adminHooks";
export function Status({ value }) {
  return (
    <span
      className={
        "badge " +
        (["paid", "active", "completed"].includes(value)
          ? "bg-success"
          : value === "cancelled"
            ? "bg-secondary"
            : "bg-primary")
      }
    >
      {labels[value] || value}
    </span>
  );
}
export function AdminShell({ title, description, children, action }) {
  return (
    <section className="admin-live">
      <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
        <div>
          <div className="text-success small fw-bold mb-2">
            FITMANAGER · QUẢN TRỊ
          </div>
          <h1 className="h3 text-white">{title}</h1>
          <p className="text-secondary mb-0">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function Feedback({ error, success }) {
  return (
    <>
      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="alert alert-success">
          {success}
        </div>
      )}
    </>
  );
}
export function DataState({ state, children }) {
  if (state.loading) return <p role="status">Đang tải dữ liệu…</p>;
  if (state.error)
    return (
      <div role="alert" className="alert alert-danger">
        {state.error}{" "}
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={state.reload}
        >
          Thử lại
        </button>
      </div>
    );
  return children;
}
export function Pager({ data, setPage }) {
  if (!data) return null;
  return (
    <div className="d-flex align-items-center justify-content-between gap-3 mt-3">
      <span>
        {data.total} bản ghi · Trang {data.page}/{data.pages}
      </span>
      <div className="d-flex gap-2">
        <button
          className="btn btn-outline-light btn-sm"
          disabled={data.page <= 1}
          onClick={() => setPage(data.page - 1)}
        >
          Trước
        </button>
        <button
          className="btn btn-outline-light btn-sm"
          disabled={data.page >= data.pages}
          onClick={() => setPage(data.page + 1)}
        >
          Sau
        </button>
      </div>
    </div>
  );
}
export function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  step,
  children,
}) {
  return (
    <label className="d-block mb-3">
      <span className="d-block mb-1">{label}</span>
      {children || (
        <input
          className="form-control"
          name={name}
          value={value ?? ""}
          onChange={onChange}
          type={type}
          required={required}
          min={min}
          step={step}
        />
      )}
    </label>
  );
}
