// Reproducible Admin UAT. Starts isolated servers and writes only to a unique test DB.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const net = require("node:net");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { createRequire } = require("node:module");
const { chromium } = require("playwright");
const frontend = path.resolve(__dirname, "..");
const backend = path.resolve(frontend, "../backend");
const backendRequire = createRequire(path.join(backend, "package.json"));
const mongoose = backendRequire("mongoose");
const dbName = "fitmanager_admin_e2e_" + crypto.randomBytes(8).toString("hex");
const password = crypto.randomBytes(20).toString("hex");
const secret = crypto.randomBytes(48).toString("hex");
const children = [];
let browser;
let context;

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}
function start(args, cwd, env) {
  const child = spawn(process.execPath, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  child.on("error", (error) => {
    child.launchError = error;
  });
  // Keep failure diagnostics in memory; do not expose generated secrets/credentials.
  child.stdout.on("data", () => {});
  child.stderr.on("data", () => {});
  children.push(child);
  return child;
}
async function ready(url) {
  for (let i = 0; i < 100; i++) {
    const failed = children.find((c) => c.launchError || c.exitCode !== null);
    if (failed) throw new Error("An isolated test server failed to start.");
    try {
      if ((await fetch(url, { signal: AbortSignal.timeout(1000) })).ok) return;
    } catch {
      /* retry while server starts */
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("Timed out waiting for isolated test server.");
}
async function stop(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  await new Promise((resolve) => {
    child.once("exit", resolve);
    child.kill();
    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      resolve();
    }, 4000);
    timeout.unref();
  });
}

async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/" + dbName, {
    serverSelectionTimeoutMS: 5000,
  });
  const models = backendRequire("./src/models");
  await Promise.all(Object.values(models).map((m) => m.init()));
  const { User, TrainerProfile, MembershipPackage, Subscription, Booking } =
    models;
  await User.create({
    fullName: "Admin E2E",
    email: "admin-e2e@test.example",
    password,
    role: "admin",
  });
  const member = await User.create({
    fullName: "Member E2E",
    email: "member-e2e@test.example",
    password,
  });
  const pt = await User.create({
    fullName: "PT E2E",
    email: "pt-e2e@test.example",
    password,
    role: "trainer",
  });
  const profile = await TrainerProfile.create({
    user: pt._id,
    pricePerSession: 100000,
  });
  const pkg = await MembershipPackage.create({
    name: "Seed E2E",
    durationDays: 30,
    price: 700000,
  });
  const now = Date.now();
  const sub = await Subscription.create({
    member: member._id,
    package: pkg._id,
    startDate: new Date(now - 86400000),
    endDate: new Date(now + 29 * 86400000),
    amount: 700000,
  });
  const booking = await Booking.create({
    member: member._id,
    trainer: profile._id,
    subscription: sub._id,
    date: "2020-01-01",
    startTime: "09:00",
    endTime: "10:00",
  });

  const apiPort = await freePort();
  let uiPort = await freePort();
  while (uiPort === apiPort) uiPort = await freePort();
  const origin = "http://127.0.0.1:" + uiPort;
  const api = "http://127.0.0.1:" + apiPort + "/api";
  start(["src/server.js"], backend, {
    PORT: String(apiPort),
    MONGODB_URI: "mongodb://127.0.0.1:27017/" + dbName,
    CORS_ORIGIN: origin,
    JWT_SECRET: secret,
    JWT_EXPIRES_IN: "1h",
    NODE_ENV: "test",
  });
  start(
    [
      "node_modules/vite/bin/vite.js",
      "--host",
      "127.0.0.1",
      "--port",
      String(uiPort),
    ],
    frontend,
    { VITE_API_URL: api },
  );
  await ready(api + "/health");
  await ready(origin);
  const output = path.join(frontend, "test-results/admin");
  await fs.mkdir(output, { recursive: true });
  const channel = process.env.PLAYWRIGHT_CHANNEL;
  browser = await chromium.launch({
    headless: true,
    ...(channel ? { channel } : {}),
  });
  context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto(origin);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.locator("#login-email").fill("admin-e2e@test.example");
  await page.locator("#login-password").fill(password);
  await page.locator("#login-submit-btn").click();
  await page.getByRole("heading", { name: "Tổng quan quản trị" }).waitFor();

  const navigate = async (label) =>
    page.getByRole("button", { name: label, exact: true }).click();
  await navigate("Quản lý Gói tập");
  await page.getByRole("button", { name: "Thêm mới", exact: true }).click();
  await page.getByLabel("Tên gói", { exact: true }).fill("Package [E2E]");
  await page.getByLabel("Giá (VND)", { exact: true }).fill("350000");
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await page
    .getByRole("cell", { name: "Package [E2E]", exact: true })
    .waitFor();
  await page.reload();
  await page.getByRole("heading", { name: "Tổng quan quản trị" }).waitFor();
  await navigate("Quản lý Gói tập");
  await page.getByLabel("Tìm kiếm", { exact: true }).fill("[E2E]");
  await page.getByRole("button", { name: "Tìm kiếm", exact: true }).click();
  const row = page.getByRole("row").filter({ hasText: "Package [E2E]" });
  await row.getByRole("button", { name: "Sửa", exact: true }).click();
  await page.getByLabel("Giá (VND)", { exact: true }).fill("450000");
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(
    (await MembershipPackage.findOne({ name: "Package [E2E]" })).price,
    450000,
  );
  await row.getByRole("button", { name: "Khóa", exact: true }).click();
  await row.getByText("Đã khóa", { exact: true }).waitFor();
  assert.equal(
    (await MembershipPackage.findOne({ name: "Package [E2E]" })).isActive,
    false,
  );

  await navigate("Quản lý PT");
  await page.getByRole("cell", { name: "PT E2E", exact: true }).waitFor();
  await page.getByRole("button", { name: "Thêm mới", exact: true }).click();
  await page.getByLabel("Họ tên", { exact: true }).fill("New PT E2E");
  await page
    .getByLabel("Email", { exact: true })
    .fill("new-pt-e2e@test.example");
  await page
    .getByLabel("Mật khẩu ban đầu (ít nhất 8 ký tự)", { exact: true })
    .fill(password);
  await page.getByLabel("Giá mỗi buổi (VND)", { exact: true }).fill("120000");
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await page.getByRole("cell", { name: "New PT E2E", exact: true }).waitFor();
  const newPT = await User.findOne({ email: "new-pt-e2e@test.example" });
  assert.equal(await TrainerProfile.countDocuments({ user: newPT._id }), 1);

  await navigate("Quản lý Học viên");
  await page.getByRole("cell", { name: "Member E2E", exact: true }).waitFor();
  await navigate("Quản lý Lịch tập");
  await page.getByRole("button", { name: "Hoàn thành", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Đã cập nhật lịch" })
    .waitFor();
  assert.equal((await Booking.findById(booking._id)).status, "completed");
  await navigate("Xác nhận Thanh toán");
  await page
    .getByRole("button", { name: "Xác nhận đã thu tiền", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Đã xác nhận thanh toán" })
    .waitFor();
  assert.equal((await Subscription.findById(sub._id)).paymentStatus, "paid");
  await navigate("Thống kê Doanh thu");
  await page
    .getByText(/700\.000/)
    .first()
    .waitFor();
  await page.screenshot({ path: path.join(output, "revenue-desktop.png") });

  await page.setViewportSize({ width: 390, height: 844 });
  const dimensions = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  assert.ok(
    dimensions.scroll <= dimensions.width + 1,
    "Mobile page must not overflow horizontally.",
  );
  await page.screenshot({
    path: path.join(output, "revenue-mobile.png"),
    fullPage: true,
  });
  await page.route("**/admin/reports/revenue*", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ success: false, message: "Lỗi kiểm thử kết nối" }),
    }),
  );
  await page.getByLabel("Từ ngày", { exact: true }).fill("2020-01-01");
  await page
    .getByRole("alert")
    .filter({ hasText: "Lỗi kiểm thử kết nối" })
    .waitFor();
  await page.unroute("**/admin/reports/revenue*");
  await page.getByRole("button", { name: "Thử lại", exact: true }).click();
  await page
    .getByText(/700\.000/)
    .first()
    .waitFor();
  await page.getByLabel("Từ ngày", { exact: true }).fill("2099-01-01");
  await page.getByText("Chưa có khoản thu trong khoảng ngày này").waitFor();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await navigate("Hồ sơ của tôi");
  await page.getByRole("heading", { name: "Hồ Sơ Của Tôi" }).waitFor();
  assert.equal(await page.locator('input[value="Admin E2E"]').count(), 1);
  await page.locator("#header-logout-btn").click();
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).waitFor();

  // Verify the shared query lifecycle does not let a slower old filter overwrite a newer result.
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.locator("#login-email").fill("pt-e2e@test.example");
  await page.locator("#login-password").fill(password);
  await page.locator("#login-submit-btn").click();
  await navigate("Lịch dạy của tôi");
  await page.getByText("Member E2E", { exact: true }).waitFor();
  let finishOld;
  const oldFinished = new Promise((resolve) => {
    finishOld = resolve;
  });
  await page.route("**/trainer/schedule*", async (route) => {
    const status = new URL(route.request().url()).searchParams.get("status");
    if (status === "booked")
      await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          bookings: [
            {
              _id: status,
              member: {
                fullName:
                  status === "booked"
                    ? "Old Filter Result"
                    : "Current Filter Result",
              },
              date: "2020-01-01",
              startTime: "09:00",
              endTime: "10:00",
              status,
            },
          ],
        },
      }),
    });
    if (status === "booked") finishOld();
  });
  const oldRequest = page.waitForRequest((r) =>
    r.url().includes("/trainer/schedule?status=booked"),
  );
  await page.locator("select").first().selectOption("booked");
  await oldRequest;
  await page.locator("select").first().selectOption("completed");
  await page.getByText("Current Filter Result", { exact: true }).waitFor();
  await oldFinished;
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  assert.equal(
    await page.getByText("Old Filter Result", { exact: true }).count(),
    0,
  );
  await page.getByText("Current Filter Result", { exact: true }).waitFor();
  await page.locator("#header-logout-btn").click();
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).waitFor();
  // Real member catalog and registration, persisted across a browser reload.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await page.locator('#login-email').fill('member-e2e@test.example');
  await page.locator('#login-password').fill(password);
  await page.locator('#login-submit-btn').click();
  await page.locator('#header-logout-btn').waitFor();
  await navigate('Danh sách gói tập');
  await page.getByRole('button', { name: 'Đăng ký Seed E2E', exact: true }).click();
  await page.getByLabel('Ngày bắt đầu', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Gửi đăng ký', exact: true }).click();
  await page.getByRole('heading', { name: 'Gói tập của tôi', exact: true }).waitFor();
  const pendingArticle = page.locator('article').filter({hasText:'Chờ xác nhận'});
  await pendingArticle.getByText('Chưa thanh toán', {exact:false}).waitFor();
  const subscriptions = await Subscription.find({member:member._id}).sort({createdAt:-1});
  assert.equal(subscriptions.length,2);
  assert.equal(subscriptions[0].amount,700000);
  assert.equal(subscriptions[0].paymentStatus,'unpaid');
  await page.reload();
  await navigate('Gói tập của tôi');
  await page.locator('article').filter({hasText:'Chờ xác nhận'}).waitFor();
  await page.screenshot({path:path.join(output,'member-subscriptions.png'),fullPage:true});
  await page.locator('#header-logout-btn').click();
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).waitFor();
  const mountModal = async (kind, props = {}) =>
    page.evaluate(
      async ({ kind, props }) => {
        const harness = await import("/tests/modal-harness.jsx");
        harness.mountModal(kind, props);
      },
      { kind, props },
    );
  const closeModal = async () => {
    await page.locator(".modal .btn-close").click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
  };
  await mountModal("package", {
    packageToEdit: {
      id: "p1",
      name: "Original Package",
      priceYear: "100",
      priceMonth: "10",
    },
  });
  await page.getByRole("dialog").waitFor();
  await page.locator(".modal input").first().fill("Unsaved Package");
  await closeModal();
  await mountModal("package");
  assert.equal(await page.locator(".modal input").first().inputValue(), "");
  await closeModal();
  await mountModal("trainer", {
    trainerToEdit: { id: "pt1", name: "Original Trainer" },
  });
  await page.getByRole("dialog").waitFor();
  assert.equal(
    await page.locator(".modal input").first().inputValue(),
    "Original Trainer",
  );
  await mountModal("trainer", {
    trainerToEdit: { id: "pt2", name: "Next Trainer" },
  });
  await page.locator('.modal input[value="Next Trainer"]').waitFor();
  await closeModal();
  await mountModal("review", { trainerIndex: 0 });
  await page.getByRole("dialog").waitFor();
  const firstTrainer = await page.locator(".modal select").inputValue();
  await closeModal();
  await mountModal("review", { trainerIndex: 1 });
  await page.getByRole("dialog").waitFor();
  assert.notEqual(
    await page.locator(".modal select").inputValue(),
    firstTrainer,
  );
  await closeModal();
  await mountModal("progress", {
    student: { id: "s1", name: "Member One", currentWeight: 72, bodyFat: 18 },
  });
  await page.getByRole("dialog").waitFor();
  await page.locator(".modal input").first().fill("99");
  await closeModal();
  await mountModal("progress", {
    student: { id: "s2", name: "Member Two", currentWeight: 65, bodyFat: 15 },
  });
  await page.getByRole("dialog").waitFor();
  assert.equal(await page.locator(".modal input").first().inputValue(), "65");
  await closeModal();
  assert.deepEqual(errors, []);
  console.log(
    "PASS: browser regression: Member package registration/persistence, Admin CRUD/payment/revenue, session/profile, API error/retry/empty, 390px, stale filter response protection and four shared modal reset/switch flows.",
  );
}

run()
  .catch(async (error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) await browser.close();
    await Promise.all(children.map(stop));
    if (
      mongoose.connection.readyState === 1 &&
      mongoose.connection.name === dbName &&
      /^fitmanager_admin_e2e_[a-f0-9]{16}$/.test(dbName)
    )
      await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
