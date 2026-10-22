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
    includesPT: true,
    sessionLimit: 5,
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

  const attendanceBooking = await Booking.create({member:member._id,trainer:profile._id,subscription:sub._id,date:'2020-01-02',startTime:'09:00',endTime:'10:00'});
  await Booking.create({member:member._id,trainer:profile._id,subscription:sub._id,date:'2020-01-03',startTime:'09:00',endTime:'10:00'});
  // Verify the shared query lifecycle does not let a slower old filter overwrite a newer result.
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.locator("#login-email").fill("pt-e2e@test.example");
  await page.locator("#login-password").fill(password);
  await page.locator("#login-submit-btn").click();
  await page.getByRole('heading',{name:'Tổng quan PT',exact:true}).waitFor();
  await page.locator('article').filter({has:page.getByRole('heading',{name:'Buổi đã hoàn thành',exact:true})}).getByText('1',{exact:true}).waitFor();
  await navigate('Lịch dạy của tôi');
  const attendanceRow=page.getByRole('row').filter({hasText:'2/1/2020'});
  await attendanceRow.getByRole('button',{name:'Hoàn thành buổi',exact:true}).click();
  await page.getByRole('button',{name:'Xác nhận buổi tập',exact:true}).click();
  await attendanceRow.getByText('Đã dạy xong',{exact:true}).waitFor();
  const absentRow=page.getByRole('row').filter({hasText:'3/1/2020'});
  await absentRow.getByRole('button',{name:'Ghi nhận vắng',exact:true}).click();
  await page.getByRole('button',{name:'Xác nhận buổi tập',exact:true}).click();
  await absentRow.getByText('Học viên vắng',{exact:true}).waitFor();
  assert.equal((await Booking.findById(attendanceBooking._id)).status,'completed');
  await navigate('Học viên & Giáo án');
  await page.getByRole('button',{name:'Ghi nhận tiến độ',exact:true}).click();
  const progressRequestIds=[];
  let loseProgressResponse=true;
  await page.route('**/trainer/members/*/progress',async route=>{
    if(route.request().method()!=='POST') {await route.continue();return;}
    progressRequestIds.push(route.request().postDataJSON().requestId);
    if(loseProgressResponse){
      loseProgressResponse=false;
      const saved=await route.fetch();
      assert.equal(saved.status(),201);
      await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({success:false,message:'Mất phản hồi sau khi lưu'})});
    } else await route.continue();
  });
  await page.getByLabel('Cân nặng (kg)',{exact:true}).fill('71.5');
  await page.getByLabel('Tỷ lệ mỡ (%)',{exact:true}).fill('19.2');
  await page.getByLabel('Nhận xét tiến độ',{exact:true}).fill('Progress E2E note');
  await page.getByRole('button',{name:'Lưu tiến độ',exact:true}).click();
  await page.getByRole('alert').filter({hasText:'Mất phản hồi sau khi lưu'}).waitFor();
  assert.equal(await models.ProgressLog.countDocuments({member:member._id}),1);
  await page.getByRole('button',{name:'Lưu tiến độ',exact:true}).click();
  await page.getByText('Đã lưu tiến độ.',{exact:true}).waitFor();
  assert.equal(progressRequestIds.length,2);assert.ok(progressRequestIds[0]);assert.equal(progressRequestIds[0],progressRequestIds[1]);
  assert.equal(await models.ProgressLog.countDocuments({member:member._id}),1);
  await page.unroute('**/trainer/members/*/progress');
  await page.getByRole('button',{name:'Đóng tiến độ',exact:true}).click();
  await page.getByRole('button',{name:'Tạo Giáo Án',exact:true}).click();
  await page.getByPlaceholder('VD: Giảm mỡ - Tháng 1').fill('Member E2E workout');
  await page.locator('.modal input[type=date]').nth(1).fill(new Date(Date.now()+7*86400000).toISOString().slice(0,10));
  await page.getByPlaceholder('Push-up, Squat...').fill('Squat E2E');
  await page.locator('.modal input[type=number]').fill('3');
  await page.getByPlaceholder('12 hoặc 8-12').fill('10');
  await page.locator('#create-plan-submit-btn').click();
  await page.getByRole('dialog').waitFor({state:'hidden'});
  // Reopening a submitted plan must have a clean draft.
  await page.getByRole('button',{name:'Tạo Giáo Án',exact:true}).click();
  assert.equal(await page.getByPlaceholder('VD: Giảm mỡ - Tháng 1').inputValue(),'');
  await page.locator('.modal .btn-close').click();
  await page.getByRole('button',{name:'Xem giáo án',exact:true}).click();
  await page.getByRole('button',{name:'Sửa giáo án',exact:true}).click();
  await page.getByLabel('Tên giáo án',{exact:true}).fill('Member E2E workout revised');
  await page.getByLabel('Số hiệp bài 1',{exact:true}).fill('4');
  await page.getByLabel('Số lần lặp bài 1',{exact:true}).fill('12');
  await page.getByLabel('Trạng thái giáo án',{exact:true}).selectOption('completed');
  await page.getByRole('button',{name:'Lưu giáo án',exact:true}).click();
  await page.getByText('Đã cập nhật giáo án.',{exact:true}).waitFor();
  await page.getByRole('heading',{name:'Member E2E workout revised',exact:true}).waitFor();
  await page.getByRole('button',{name:'Sửa giáo án',exact:true}).click();
  await page.getByLabel('Tên giáo án',{exact:true}).fill('Discarded draft');
  await page.getByRole('button',{name:'Bỏ thay đổi',exact:true}).click();
  await page.getByRole('button',{name:'Sửa giáo án',exact:true}).click();
  assert.equal(await page.getByLabel('Tên giáo án',{exact:true}).inputValue(),'Member E2E workout revised');
  await page.getByRole('button',{name:'Bỏ thay đổi',exact:true}).click();
  await page.getByRole('button',{name:'Đóng giáo án',exact:true}).click();
  await navigate("Lịch dạy của tôi");
  await page.getByText("Member E2E", { exact: true }).first().waitFor();
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
  await page.getByRole('heading',{name:'Tổng quan hội viên',exact:true}).waitFor();
  await page.locator('article').filter({has:page.getByRole('heading',{name:'Buổi đã hoàn thành',exact:true})}).getByText('2',{exact:true}).waitFor();
  await page.getByText(/Cân nặng: 71.5 kg/).waitFor();
  await navigate('Tiến độ & Thể trạng');
  await page.getByText('Progress E2E note',{exact:true}).waitFor();
  await page.getByRole('heading',{name:'Member E2E workout revised',exact:true}).waitFor();
  await page.getByText(/Squat E2E.*4 hiệp × 12 lần/).waitFor();
  await page.screenshot({path:path.join(output,'member-progress-plans.png'),fullPage:true});
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
  await navigate('Đặt lịch PT');
  await page.getByLabel('Gói tập', {exact:true}).selectOption(String(sub._id));
  await page.getByLabel('Huấn luyện viên', {exact:true}).selectOption(String(profile._id));
  await page.getByLabel('Ngày tập', {exact:true}).fill(new Date(Date.now()+2*86400000).toISOString().slice(0,10));
  await page.getByRole('button', {name:'Xác nhận đặt lịch',exact:true}).click();
  await page.getByRole('heading', {name:'Lịch tập của tôi',exact:true}).waitFor();
  await page.getByRole('button', {name:'Hủy lịch',exact:true}).waitFor();
  await page.reload();
  await navigate('Lịch tập');
  await page.getByRole('button', {name:'Hủy lịch',exact:true}).click();
  await page.getByRole('button', {name:'Xác nhận hủy',exact:true}).click();
  await page.locator('article').filter({hasText:'Đã hủy'}).waitFor();
  assert.equal(await Booking.countDocuments({member:member._id,status:'cancelled'}),1);
  assert.equal((await Subscription.findById(sub._id)).reservedSessions,0);
  await page.screenshot({path:path.join(output,'member-booking-cancelled.png'),fullPage:true});
  await navigate('Đánh giá HLV');
  await page.getByLabel('Buổi tập',{exact:true}).selectOption(String(attendanceBooking._id));
  await page.getByLabel('Số sao',{exact:true}).selectOption('4');
  await page.getByLabel('Nhận xét',{exact:true}).fill('Verified E2E review');
  await page.getByRole('button',{name:'Gửi đánh giá',exact:true}).click();
  await page.getByText('Đã gửi đánh giá.',{exact:true}).waitFor();
  await page.getByText('Verified E2E review',{exact:true}).waitFor();
  await page.reload();
  await navigate('Đánh giá HLV');
  await page.getByText('Verified E2E review',{exact:true}).waitFor();
  assert.equal(await page.locator('#review-booking option[value="'+attendanceBooking._id+'"]').count(),0);
  await navigate('Huấn luyện viên');
  const ratedTrainer=page.locator('article').filter({has:page.getByRole('heading',{name:'PT E2E',exact:true})});
  await ratedTrainer.getByText('4/5 sao · 1 đánh giá',{exact:true}).waitFor();
  await ratedTrainer.getByRole('button',{name:'Đặt lịch với PT này',exact:true}).click();
  assert.equal(await page.getByLabel('Huấn luyện viên',{exact:true}).inputValue(),String(profile._id));
  await page.locator('#header-logout-btn').click();
  await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
  await page.locator('#login-email').fill('pt-e2e@test.example');
  await page.locator('#login-password').fill(password);
  await page.locator('#login-submit-btn').click();
  await page.locator('#header-logout-btn').waitFor();
  await page.getByRole('heading',{name:'Tổng quan PT',exact:true}).waitFor();
  await page.getByText('4/5 sao · 1 đánh giá',{exact:true}).waitFor();
  await navigate('Đánh giá từ Học viên');
  await page.getByText('Verified E2E review',{exact:true}).waitFor();
  await page.getByText('1 đánh giá · 4/5 sao',{exact:true}).waitFor();
  await page.screenshot({path:path.join(output,'trainer-verified-reviews.png'),fullPage:true});


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
    "PASS: browser regression: progress retry after committed response loss, PT plan editing and Member updated content, PT completion/absence to member review, live Member/PT dashboards, completed-session reviews and trainer ratings, PT progress/plan assignment and Member visibility, Member package registration/persistence and PT booking/cancellation, Admin CRUD/payment/revenue, session/profile, API error/retry/empty, 390px, stale filter response protection and four shared modal reset/switch flows.",
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
