const {
  User,
  TrainerProfile,
  MembershipPackage,
  Subscription,
  Booking,
} = require("../models");
const AppError = require("../utils/AppError");
const fail = (message, code = 400) => {
  throw new AppError(message, code);
};
const fields = (body, allowed) =>
  Object.fromEntries(
    Object.entries(body).filter(([key]) => allowed.includes(key)),
  );
function objectId(value) {
  if (typeof value !== "string" || !/^[a-f0-9]{24}$/i.test(value))
    fail("ID không hợp lệ");
  return value;
}
function pagination(query) {
  const page = Number(query.page || 1),
    limit = Number(query.limit || 10);
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  )
    fail("Phân trang không hợp lệ");
  return { page, limit, skip: (page - 1) * limit };
}
function textFilter(query, keys) {
  if (!query.search) return {};
  if (typeof query.search !== "string" || query.search.length > 120)
    fail("Tìm kiếm không hợp lệ");
  const escaped = [...query.search]
    .map((c) => (".*+?^${}()|[]\\".includes(c) ? "\\" + c : c))
    .join("");
  return {
    $or: keys.map((key) => ({ [key]: { $regex: escaped, $options: "i" } })),
  };
}
function activeFilter(query) {
  if (query.isActive === undefined || query.isActive === "") return {};
  if (!["true", "false"].includes(query.isActive))
    fail("Trạng thái không hợp lệ");
  return { isActive: query.isActive === "true" };
}
async function list(Model, filter, query, populate) {
  const { page, limit, skip } = pagination(query);
  let cursor = Model.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(limit);
  if (populate) cursor = cursor.populate(populate);
  const [items, total] = await Promise.all([
    cursor,
    Model.countDocuments(filter),
  ]);
  return {
    items,
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}
async function find(Model, id) {
  const doc = await Model.findById(objectId(id));
  if (!doc) fail("Không tìm thấy dữ liệu", 404);
  return doc;
}
const userFields = [
  "fullName",
  "email",
  "phone",
  "gender",
  "dateOfBirth",
  "avatar",
  "isActive",
];
const ptFields = [
  "specialties",
  "experienceYears",
  "bio",
  "certificates",
  "pricePerSession",
  "isActive",
];
const packageFields = [
  "name",
  "description",
  "durationDays",
  "price",
  "sessionLimit",
  "includesPT",
  "isActive",
];
function validateBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    fail("Dữ liệu không hợp lệ");
}
function booleans(body) {
  for (const field of ["isActive", "includesPT"])
    if (field in body && typeof body[field] !== "boolean")
      fail(field + " phải là boolean");
}
async function packages(query) {
  return list(
    MembershipPackage,
    { ...textFilter(query, ["name"]), ...activeFilter(query) },
    query,
  );
}
async function savePackage(id, body) {
  validateBody(body);
  booleans(body);
  const data = fields(body, packageFields);
  const doc = id ? await find(MembershipPackage, id) : new MembershipPackage();
  Object.assign(doc, data);
  return doc.save();
}
async function users(query) {
  const role = query.role || "member";
  if (!["member", "trainer"].includes(role))
    fail("Chỉ quản lý Member hoặc PT tại đây");
  return list(
    User,
    {
      role,
      ...textFilter(query, ["fullName", "email", "phone"]),
      ...activeFilter(query),
    },
    query,
  );
}
async function saveUser(id, body, actor) {
  validateBody(body);
  booleans(body);
  let doc;
  if (id) {
    doc = await find(User, id);
    if (
      !["member", "trainer"].includes(doc.role) ||
      String(doc._id) === String(actor._id)
    )
      fail("Không được sửa tài khoản quản trị tại đây", 403);
  } else {
    if (!["member", "trainer"].includes(body.role))
      fail("Role phải là member hoặc trainer");
    if (typeof body.password !== "string") fail("Mật khẩu là bắt buộc");
    doc = new User({ role: body.role, password: body.password });
  }
  Object.assign(doc, fields(body, userFields));
  let profile;
  if (doc.role === "trainer") {
    if (body.trainerProfile !== undefined) validateBody(body.trainerProfile);
    const input = fields(body.trainerProfile || {}, ptFields);
    booleans(input);
    profile = id ? await TrainerProfile.findOne({ user: doc._id }) : null;
    if (!profile) profile = new TrainerProfile({ user: doc._id });
    Object.assign(profile, input);
    await profile.validate();
  }
  await doc.save();
  if (profile) {
    try {
      await profile.save();
    } catch (error) {
      // A new account has no dependants yet; compensate a failed profile insert.
      if (!id) await User.deleteOne({ _id: doc._id });
      throw error;
    }
  }
  return { user: doc, trainerProfile: profile || null };
}
async function getUser(id) {
  const user = await find(User, id);
  if (!["member", "trainer"].includes(user.role))
    fail("Không tìm thấy tài khoản", 404);
  return {
    user,
    trainerProfile:
      user.role === "trainer"
        ? await TrainerProfile.findOne({ user: user._id })
        : null,
  };
}
function dateValue(value, end = false) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    fail("Ngày phải có định dạng YYYY-MM-DD");
  const utc = new Date(value + "T00:00:00Z");
  if (Number.isNaN(utc.getTime()) || utc.toISOString().slice(0, 10) !== value)
    fail("Ngày không hợp lệ");
  return new Date(utc.getTime() - 7 * 3600000 + (end ? 86400000 : 0));
}
function range(query, field, local = true) {
  if (!query.from && !query.to) return {};
  const dates = {};
  if (query.from)
    dates.$gte = local
      ? dateValue(query.from)
      : new Date(dateValue(query.from).getTime() + 7 * 3600000);
  if (query.to)
    dates.$lt = local
      ? dateValue(query.to, true)
      : new Date(dateValue(query.to, true).getTime() + 7 * 3600000);
  if (dates.$gte && dates.$lt && dates.$gte >= dates.$lt)
    fail("Khoảng ngày không hợp lệ");
  return { [field]: dates };
}
async function bookings(query) {
  const filter = { ...range(query, "date", false) };
  if (query.status) {
    if (!["booked", "completed", "cancelled", "no_show"].includes(query.status))
      fail("Trạng thái lịch không hợp lệ");
    filter.status = query.status;
  }
  if (query.member) filter.member = objectId(query.member);
  if (query.trainer) filter.trainer = objectId(query.trainer);
  return list(Booking, filter, query, [
    { path: "member", select: "fullName email" },
    { path: "trainer", populate: { path: "user", select: "fullName email" } },
    { path: "subscription", populate: { path: "package", select: "name" } },
  ]);
}
async function setBookingStatus(id, status) {
  if (!["completed", "cancelled", "no_show"].includes(status))
    fail("Trạng thái đích không hợp lệ");
  const doc = await find(Booking, id);
  if (doc.status === status) return doc;
  if (doc.status !== "booked")
    fail("Không thể thay đổi trạng thái đã kết thúc", 409);
  const start = new Date(
    doc.date.toISOString().slice(0, 10) + "T" + doc.startTime + ":00+07:00",
  );
  const end = new Date(
    doc.date.toISOString().slice(0, 10) + "T" + doc.endTime + ":00+07:00",
  );
  if (status === "cancelled" && start <= new Date())
    fail("Chỉ hủy trước giờ bắt đầu", 409);
  if (status !== "cancelled" && end > new Date())
    fail("Chưa đến giờ kết thúc buổi tập", 409);
  doc.status = status;
  return doc.save();
}
async function subscriptions(query) {
  const filter = {};
  if (query.paymentStatus) {
    if (!["paid", "unpaid"].includes(query.paymentStatus))
      fail("Trạng thái thanh toán không hợp lệ");
    filter.paymentStatus = query.paymentStatus;
  }
  if (query.member) filter.member = objectId(query.member);
  return list(Subscription, filter, query, [
    { path: "member", select: "fullName email isActive role" },
    { path: "package", select: "name isActive" },
  ]);
}
async function confirmPayment(id) {
  const doc = await find(Subscription, id);
  if (doc.paymentStatus === "paid") return doc;
  if (doc.status !== "pending") fail("Chỉ xác nhận đăng ký đang chờ", 409);
  if (doc.endDate <= new Date() || doc.startDate >= doc.endDate)
    fail("Gói hết hạn hoặc khoảng ngày không hợp lệ", 409);
  const [member, pkg] = await Promise.all([
    User.findById(doc.member),
    MembershipPackage.findById(doc.package),
  ]);
  if (
    !member ||
    member.role !== "member" ||
    !member.isActive ||
    !pkg ||
    !pkg.isActive
  )
    fail("Hội viên hoặc gói không còn hoạt động", 409);
  doc.paymentStatus = "paid";
  doc.paidAt = new Date();
  doc.status = "active";
  return doc.save();
}
async function revenue(query) {
  const match = {
    paymentStatus: "paid",
    paidAt: { $type: "date" },
    ...range(query, "paidAt"),
  };
  const [summary, daily] = await Promise.all([
    Subscription.aggregate([
      { $match: match },
      {
        $group: { _id: null, amount: { $sum: "$amount" }, count: { $sum: 1 } },
      },
    ]),
    Subscription.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$paidAt",
              timezone: "Asia/Ho_Chi_Minh",
            },
          },
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);
  const missingPaidAt = await Subscription.countDocuments({
    paymentStatus: "paid",
    paidAt: null,
  });
  return {
    amount: summary[0]?.amount || 0,
    count: summary[0]?.count || 0,
    daily,
    missingPaidAt,
  };
}
async function dashboard() {
  const [members, trainers, packagesCount, booked, pendingPayments, report] =
    await Promise.all([
      User.countDocuments({ role: "member", isActive: true }),
      User.countDocuments({ role: "trainer", isActive: true }),
      MembershipPackage.countDocuments({ isActive: true }),
      Booking.countDocuments({ status: "booked" }),
      Subscription.countDocuments({
        paymentStatus: "unpaid",
        status: "pending",
      }),
      revenue({}),
    ]);
  return {
    members,
    trainers,
    packages: packagesCount,
    booked,
    pendingPayments,
    revenue: report.amount,
    paidSubscriptions: report.count,
  };
}
module.exports = {
  packages,
  savePackage,
  users,
  saveUser,
  getUser,
  bookings,
  setBookingStatus,
  subscriptions,
  confirmPayment,
  revenue,
  dashboard,
  pagination,
  range,
};
