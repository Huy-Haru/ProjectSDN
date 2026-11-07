import { useState } from "react";
import { Modal } from "react-bootstrap";
import { adminRequest, queryString } from "../../api/adminApi";
import { AdminShell, DataState, Feedback, Field, Pager } from "./AdminUI";
import { money, useAdminData } from "./adminHooks";
import { FaAward, FaDumbbell, FaEnvelope, FaPhone, FaStar, FaTimes, FaUser } from "react-icons/fa";
const blankPackage = {
  name: "",
  description: "",
  durationDays: 30,
  price: 0,
  sessionLimit: "",
  includesPT: false,
  isActive: true,
};
function Editor({ kind, item, onClose, onSaved }) {
  const isPackage = kind === "packages",
    isTrainer = kind === "trainer";
  const initial = isPackage
    ? { ...blankPackage, ...item, sessionLimit: item?.sessionLimit ?? "" }
    : {
        fullName: "",
        email: "",
        phone: "",
        password: "",
        isActive: true,
        ...item?.user,
        specialties: (item?.trainerProfile?.specialties || []).join(", "),
        certificates: (item?.trainerProfile?.certificates || []).join(", "),
        experienceYears: item?.trainerProfile?.experienceYears ?? 0,
        pricePerSession: item?.trainerProfile?.pricePerSession ?? 0,
        bio: item?.trainerProfile?.bio || "",
        ptActive: item?.trainerProfile?.isActive ?? true,
      };
  const [form, setForm] = useState(initial),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const change = (e) =>
    setForm((s) => ({
      ...s,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));
  const input = (label, name, type = "text", required = true, min) => (
    <Field
      label={label}
      name={name}
      type={type}
      required={required}
      value={form[name]}
      onChange={change}
      min={min}
      step={type === "number" ? 1 : undefined}
    />
  );
  const check = (name, label) => (
    <label className="d-block mb-3">
      <input
        name={name}
        type="checkbox"
        checked={form[name]}
        onChange={change}
      />{" "}
      {label}
    </label>
  );
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      let body;
      if (isPackage)
        body = {
          name: form.name,
          description: form.description,
          durationDays: Number(form.durationDays),
          price: Number(form.price),
          sessionLimit:
            form.sessionLimit === "" ? null : Number(form.sessionLimit),
          includesPT: form.includesPT,
          isActive: form.isActive,
        };
      else {
        body = {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          isActive: form.isActive,
        };
        if (!item) Object.assign(body, { password: form.password, role: kind });
        if (isTrainer)
          body.trainerProfile = {
            specialties: form.specialties
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            certificates: form.certificates
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            experienceYears: Number(form.experienceYears),
            pricePerSession: Number(form.pricePerSession),
            bio: form.bio,
            isActive: form.ptActive,
          };
      }
      const id = isPackage ? item?._id : item?.user?._id;
      await adminRequest(
        "/" + (isPackage ? "packages" : "users") + (id ? "/" + id : ""),
        id ? "PATCH" : "POST",
        body,
      );
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      show
      onHide={() => !busy && onClose()}
      centered
      contentClassName="modal-content-dark"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {item ? "Cập nhật" : "Thêm mới"}{" "}
          {isPackage ? "gói tập" : isTrainer ? "PT" : "hội viên"}
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={submit}>
        <Modal.Body>
          <Feedback error={error} />
          {isPackage ? (
            <>
              {input("Tên gói", "name")}
              {input("Mô tả", "description", "text", false)}
              {input("Thời hạn (ngày)", "durationDays", "number", true, 1)}
              {input("Giá (VND)", "price", "number", true, 0)}
              {input(
                "Giới hạn buổi (để trống = không giới hạn)",
                "sessionLimit",
                "number",
                false,
                1,
              )}
              {check("includesPT", "Bao gồm PT")}
            </>
          ) : (
            <>
              {input("Họ tên", "fullName")}
              {input("Email", "email", "email")}
              {input("Số điện thoại", "phone", "tel", false)}
              {!item &&
                input(
                  "Mật khẩu ban đầu (ít nhất 8 ký tự)",
                  "password",
                  "password",
                )}
              {isTrainer && (
                <>
                  {input(
                    "Chuyên môn (phân cách dấu phẩy)",
                    "specialties",
                    "text",
                    false,
                  )}
                  {input(
                    "Chứng chỉ (phân cách dấu phẩy)",
                    "certificates",
                    "text",
                    false,
                  )}
                  {input(
                    "Số năm kinh nghiệm",
                    "experienceYears",
                    "number",
                    true,
                    0,
                  )}
                  {input(
                    "Giá mỗi buổi (VND)",
                    "pricePerSession",
                    "number",
                    true,
                    0,
                  )}
                  {input("Giới thiệu", "bio", "text", false)}
                  {check("ptActive", "Hồ sơ PT hoạt động")}
                </>
              )}
            </>
          )}
          {check(
            "isActive",
            isPackage ? "Gói đang hoạt động" : "Tài khoản đang hoạt động",
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={busy}
            onClick={onClose}
          >
            Đóng
          </button>
          <button className="btn btn-success" disabled={busy}>
            {busy ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
export default function AdminCatalog({ kind }) {
  const isPackage = kind === "packages",
    isTrainer = kind === "trainer",
    title = isPackage
      ? "Quản lý gói tập"
      : kind === "trainer"
        ? "Quản lý huấn luyện viên"
        : "Quản lý hội viên";
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [draft, setDraft] = useState(""),
    [isActive, setIsActive] = useState("");
  const [editor, setEditor] = useState(null),
    [detail, setDetail] = useState(null),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false);
  const state = useAdminData(
    "/" +
      (isPackage ? "packages" : "users") +
      queryString({
        page,
        search,
        isActive,
        role: isPackage ? undefined : kind,
      }),
  );
  const edit = async (item) => {
    setError("");
    try {
      setEditor({
        item: isPackage ? item : await adminRequest("/users/" + item._id),
      });
    } catch (err) {
      setError(err.message);
    }
  };
  const showDetail = async (item) => {
    setError("");
    try {
      setDetail({ loading: true });
      setDetail(await adminRequest("/users/" + item._id));
    } catch (err) {
      setDetail(null);
      setError(err.message);
    }
  };
  const toggle = async (item) => {
    if (
      !window.confirm(
        (item.isActive ? "Khóa" : "Mở lại") +
          " mục này? Lịch sử vẫn được giữ nguyên.",
      )
    )
      return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await adminRequest(
        "/" + (isPackage ? "packages" : "users") + "/" + item._id,
        "PATCH",
        { isActive: !item.isActive },
      );
      setSuccess("Đã cập nhật trạng thái");
      state.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <AdminShell
      title={title}
      description="Dữ liệu được lưu tại MongoDB. Khóa mục không xóa lịch sử."
      action={
        <button
          className="btn btn-success align-self-start"
          onClick={() => setEditor({ item: null })}
        >
          Thêm mới
        </button>
      }
    >
      <Feedback error={error} success={success} />
      <form
        className="admin-filter-bar mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSearch(draft);
        }}
      >
        <input
          className="admin-filter-input"
          aria-label="Tìm kiếm"
          placeholder={
            isPackage ? "Tìm tên gói…" : "Tìm tên, email, điện thoại…"
          }
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <select
          className="admin-filter-select"
          aria-label="Trạng thái"
          value={isActive}
          onChange={(e) => {
            setIsActive(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Hoạt động</option>
          <option value="false">Đã khóa</option>
        </select>
        <button className="btn btn-filter-primary">Tìm kiếm</button>
      </form>
      <DataState state={state}>
        <div className="table-responsive">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>{isPackage ? "Tên gói" : "Họ tên"}</th>
                <th>{isPackage ? "Giá / thời hạn" : "Email / điện thoại"}</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {state.data?.items.map((item) => (
                <tr key={item._id}>
                  <td>{isPackage ? item.name : item.fullName}</td>
                  <td>
                    {isPackage ? (
                      <>
                        {money(item.price)} · {item.durationDays} ngày
                        <br />
                        <small>
                          {item.sessionLimit ?? "Không giới hạn"} buổi ·{" "}
                          {item.includesPT ? "Có PT" : "Không PT"}
                        </small>
                      </>
                    ) : (
                      <>
                        {item.email}
                        <br />
                        <small>{item.phone || "—"}</small>
                      </>
                    )}
                  </td>
                  <td>{item.isActive ? "Hoạt động" : "Đã khóa"}</td>
                  <td>
                    <div className="admin-table-actions">
                      {isTrainer && <button className="btn btn-sm btn-detail" onClick={() => showDetail(item)}>Chi tiết</button>}
                      <button
                        className="btn btn-sm btn-outline-light"
                        onClick={() => edit(item)}
                      >
                        Sửa
                      </button>
                      <button
                        disabled={busy}
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => toggle(item)}
                      >
                        {item.isActive ? "Khóa" : "Mở lại"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {state.data?.items.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    Chưa có dữ liệu phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pager data={state.data} setPage={setPage} />
      </DataState>
      {editor && (
        <Editor
          key={editor.item?._id || editor.item?.user?._id || "new"}
          kind={kind}
          item={editor.item}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            setSuccess("Đã lưu thành công");
            state.reload();
          }}
        />
      )}
      {detail && <div className="admin-detail-backdrop" role="presentation" onClick={() => setDetail(null)}>{detail.loading ? <div className="admin-detail-loading">Đang tải hồ sơ…</div> : <article className="admin-detail-panel" role="dialog" aria-modal="true" aria-label={`Chi tiết ${detail.user?.fullName || 'huấn luyện viên'}`} onClick={event => event.stopPropagation()}><button className="admin-detail-close" onClick={() => setDetail(null)} aria-label="Đóng"><FaTimes /></button><div className="admin-detail-cover"><div className="admin-detail-avatar">{detail.user?.avatar ? <img src={detail.user.avatar} alt={detail.user.fullName} /> : <FaUser />}</div><div><span className="eyebrow">TRAINER PROFILE</span><h2>{detail.user?.fullName}</h2><p>{detail.trainerProfile?.bio || 'Chưa có phần giới thiệu.'}</p></div></div><div className="admin-detail-contact"><span><FaEnvelope /> {detail.user?.email}</span><span><FaPhone /> {detail.user?.phone || 'Chưa cập nhật số điện thoại'}</span></div><div className="admin-detail-metrics"><div><FaStar /><strong>{detail.trainerProfile?.ratingAverage || '—'}</strong><small>{detail.trainerProfile?.ratingCount || 0} đánh giá</small></div><div><FaAward /><strong>{detail.trainerProfile?.experienceYears || 0}+</strong><small>năm kinh nghiệm</small></div><div><FaDumbbell /><strong>{money(detail.trainerProfile?.pricePerSession || 0)}</strong><small>mỗi buổi</small></div></div><div className="admin-detail-section"><h3>Chuyên môn & chứng chỉ</h3><div className="admin-detail-tags">{(detail.trainerProfile?.specialties || []).map(value => <span key={value}>{value}</span>)}{(detail.trainerProfile?.certificates || []).map(value => <span key={value}><FaAward /> {value}</span>)}</div></div><div className="admin-detail-status"><span className={`status-dot ${detail.user?.isActive && detail.trainerProfile?.isActive ? 'is-active' : ''}`} />{detail.user?.isActive && detail.trainerProfile?.isActive ? 'Đang hoạt động và nhận lịch' : 'Đang tạm khóa'}</div></article>}</div>}
    </AdminShell>
  );
}
