// Integration suite: only writes to a randomly named disposable database.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
process.env.JWT_SECRET = crypto.randomBytes(48).toString("hex");
const createApp = require("../src/app");
const { signToken } = require("../src/utils/jwt");
const dbName = "fitmanager_member_test_" + crypto.randomBytes(8).toString("hex");
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


  const pkg=await MembershipPackage.create({name:'Member package',price:350000,durationDays:30,includesPT:true});
  const hidden=await MembershipPackage.create({name:'Hidden',price:1,durationDays:1,isActive:false});
  assert.equal((await call('/member/packages','GET',null,200,null)).packages.length,1);
  await call('/member/subscriptions','GET',null,401,null);
  await call('/member/subscriptions','POST',{packageId:pkg._id},403,adminToken);
  await call('/member/subscriptions','POST',{packageId:hidden._id},404,memberToken);
  await call('/member/subscriptions','POST',{},400,memberToken);
  await call('/member/subscriptions','POST',{packageId:pkg._id,startDate:'2026-02-30'},400,memberToken);
  await call('/member/subscriptions','POST',{packageId:pkg._id,startDate:'2000-01-01'},400,memberToken);
  const {subscription}=await call('/member/subscriptions','POST',{
    packageId:pkg._id,member:admin._id,amount:1,status:'active',paymentStatus:'paid',paidAt:new Date()
  },201,memberToken);
  assert.equal(subscription.amount,350000);
  assert.equal(subscription.member,String(member._id));
  assert.equal(subscription.status,'pending');assert.equal(subscription.paymentStatus,'unpaid');
  assert.equal(new Date(subscription.endDate)-new Date(subscription.startDate),30*86400000);
  assert.equal(new Date(subscription.startDate).getUTCHours(),17);
  await MembershipPackage.updateOne({_id:pkg._id},{$set:{price:900000}});
  assert.equal((await call('/member/subscriptions','GET',null,200,memberToken)).subscriptions[0].amount,350000);
  const other=await User.create({fullName:'Other member',email:'other@test.example',password:'StrongPass123'});
  assert.equal((await call('/member/subscriptions','GET',null,200,signToken({id:other._id}))).subscriptions.length,0);
  const payment=await call('/admin/subscriptions/'+subscription._id+'/confirm-payment','POST',{});
  assert.equal(payment.paymentStatus,'paid');
  assert.equal((await call('/member/subscriptions','GET',null,200,memberToken)).subscriptions[0].status,'active');
  console.log('PASS: public active catalog, member isolation, trusted pricing/dates, pending payment and admin activation.');
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
      /^fitmanager_member_test_[a-f0-9]{16}$/.test(dbName)
    )
      await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
