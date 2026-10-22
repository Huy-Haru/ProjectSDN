// Integration suite: only writes to a randomly named disposable database.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
process.env.JWT_SECRET = crypto.randomBytes(48).toString("hex");
const createApp = require("../src/app");
const { signToken } = require("../src/utils/jwt");
const dbName = "fitmanager_admin_test_" + crypto.randomBytes(8).toString("hex");
let server;
async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/" + dbName, {
    serverSelectionTimeoutMS: 5000,
  });
  const {
    User,
    TrainerProfile,
    MembershipPackage,
    Subscription,
    Booking,
  } = require("../src/models");
  await Promise.all(
    Object.values(require("../src/models")).map((m) => m.init()),
  );
  const admin = await User.create({
    fullName: "Admin Test",
    email: "admin@test.example",
    password: "StrongPass123",
    role: "admin",
  });
  const member = await User.create({
    fullName: "Member Test",
    email: "member@test.example",
    password: "StrongPass123",
  });
  server = createApp({ corsOrigin: "http://localhost:3000" }).listen(
    0,
    "127.0.0.1",
  );
  await new Promise((resolve) => server.once("listening", resolve));
  const base = "http://127.0.0.1:" + server.address().port + "/api";
  const adminToken = signToken({ id: admin._id, role: admin.role });
  const memberToken = signToken({ id: member._id, role: "admin" }); // Role forged in signed claim must not override database role.
  async function call(
    path,
    method = "GET",
    body,
    expected = 200,
    token = adminToken,
  ) {
    const response = await fetch(base + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const result = await response.json();
    assert.equal(
      response.status,
      expected,
      path + ": " + JSON.stringify(result),
    );
    return result.data;
  }
  await call("/admin/dashboard", "GET", null, 401, null);
  await call("/admin/dashboard", "GET", null, 403, memberToken);
  await call("/admin/users", "POST", { role: "member", fullName: "Short password", email: "short@test.example", password: "short" }, 400);
  const login = await call(
    "/auth/login",
    "POST",
    { email: admin.email, password: "StrongPass123" },
    200,
    null,
  );
  assert.ok(login.token);
  assert.equal(login.user.password, undefined);
  await call(
    "/admin/packages",
    "POST",
    { name: "Invalid", durationDays: 0, price: -1 },
    400,
  );
  const pkg = await call(
    "/admin/packages",
    "POST",
    { name: "Gym [Pro]", durationDays: 30, price: 500000, includesPT: true },
    201,
  );
  assert.equal((await call("/admin/packages?search=%5BPro%5D")).total, 1);
  await call("/admin/packages/bad", "PATCH", { price: 1 }, 400);
  await call("/admin/packages/" + pkg._id, "PATCH", { isActive: "false" }, 400);
  const edited = await call("/admin/packages/" + pkg._id, "PATCH", {
    price: 600000,
  });
  assert.equal(edited.price, 600000);
  await call(
    "/admin/users",
    "POST",
    {
      role: "trainer",
      email: "badpt@test.example",
      fullName: "Bad PT",
      password: "StrongPass123",
      trainerProfile: { pricePerSession: -1 },
    },
    400,
  );
  assert.equal(await User.countDocuments({ email: "badpt@test.example" }), 0);
  const pt = await call(
    "/admin/users",
    "POST",
    {
      role: "trainer",
      email: "pt@test.example",
      fullName: "PT Test",
      password: "StrongPass123",
      trainerProfile: { pricePerSession: 150000, specialties: ["Strength"] },
    },
    201,
  );
  assert.equal(pt.user.password, undefined);
  assert.equal(pt.trainerProfile.user, pt.user._id);
  await call(
    "/admin/users",
    "POST",
    {
      role: "member",
      email: member.email,
      fullName: "Duplicate",
      password: "StrongPass123",
    },
    409,
  );
  await call("/admin/users/" + admin._id, "PATCH", { isActive: false }, 403);
  const changed = await call("/admin/users/" + member._id, "PATCH", {
    role: "admin",
    password: "Overwrite123",
    fullName: "Updated Member",
  });
  assert.equal(changed.user.role, "member");
  assert.equal(
    await (
      await User.findById(member._id).select("+password")
    ).comparePassword("StrongPass123"),
    true,
  );
  await call("/admin/users/" + member._id, "PATCH", { isActive: false });
  await call("/admin/dashboard", "GET", null, 403, memberToken);
  await call("/admin/users/" + member._id, "PATCH", { isActive: true });
  const now = new Date();
  const sub = await Subscription.create({
    member: member._id,
    package: pkg._id,
    startDate: new Date(now.getTime() - 86400000),
    endDate: new Date(now.getTime() + 86400000 * 29),
    amount: 500000,
  });
  await call(
    "/admin/subscriptions/" + sub._id + "/confirm-payment",
    "POST",
    {},
    403,
    memberToken,
  );
  const paid = await call(
    "/admin/subscriptions/" + sub._id + "/confirm-payment",
    "POST",
  );
  assert.equal(paid.paymentStatus, "paid");
  assert.equal(paid.status, "active");
  assert.ok(paid.paidAt);
  assert.equal(
    (await call("/admin/subscriptions/" + sub._id + "/confirm-payment", "POST"))
      .paidAt,
    paid.paidAt,
  );
  await Subscription.create({
    member: member._id,
    package: pkg._id,
    startDate: now,
    endDate: new Date(now.getTime() + 86400000),
    amount: 999999,
  });
  let report = await call("/admin/reports/revenue");
  assert.equal(report.amount, 500000);
  assert.equal(report.count, 1);
  const dateVN = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  report = await call(
    "/admin/reports/revenue?from=" + dateVN + "&to=" + dateVN,
  );
  assert.equal(report.amount, 500000);
  await call("/admin/reports/revenue?from=2026-02-30", "GET", null, 400);
  const expired = await Subscription.create({
    member: member._id,
    package: pkg._id,
    startDate: new Date(now.getTime() - 86400000 * 3),
    endDate: new Date(now.getTime() - 86400000),
    amount: 100,
  });
  await call(
    "/admin/subscriptions/" + expired._id + "/confirm-payment",
    "POST",
    null,
    409,
  );
  const booking = await Booking.create({
    member: member._id,
    trainer: pt.trainerProfile._id,
    subscription: sub._id,
    date: "2020-01-01",
    startTime: "09:00",
    endTime: "10:00",
  });
  await call("/admin/bookings/" + booking._id + "/status", "PATCH", {
    status: "completed",
  });
  await call("/admin/bookings/" + booking._id + "/status", "PATCH", {
    status: "completed",
  });
  await call(
    "/admin/bookings/" + booking._id + "/status",
    "PATCH",
    { status: "cancelled" },
    409,
  );
  const future = await Booking.create({
    member: member._id,
    trainer: pt.trainerProfile._id,
    subscription: sub._id,
    date: "2099-01-01",
    startTime: "09:00",
    endTime: "10:00",
  });
  await call(
    "/admin/bookings/" + future._id + "/status",
    "PATCH",
    { status: "completed" },
    409,
  );
  await call("/admin/bookings/" + future._id + "/status", "PATCH", {
    status: "cancelled",
  });
  assert.equal((await Booking.findById(future._id)).status, "cancelled");
  const list = await call("/admin/bookings?limit=1");
  assert.equal(list.items.length, 1);
  assert.equal(list.total, 2);
  assert.ok(list.items[0].member.fullName);
  await call("/admin/packages?limit=101", "GET", null, 400);
  assert.equal((await call("/admin/dashboard")).revenue, 500000);
  await call("/admin/packages/" + pkg._id, "PATCH", { isActive: false });
  assert.equal(await MembershipPackage.countDocuments({ _id: pkg._id }), 1);
  assert.equal(await TrainerProfile.countDocuments({ user: pt.user._id }), 1);
  console.log(
    "PASS: Admin auth/RBAC, CRUD, safe profiles, validation, literal search, payment idempotency, revenue/date boundaries, booking transitions, pagination and soft locks.",
  );
}
run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (
      mongoose.connection.readyState === 1 &&
      mongoose.connection.name === dbName &&
      /^fitmanager_admin_test_[a-f0-9]{16}$/.test(dbName)
    )
      await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
