// Integration suite: only writes to a randomly named disposable database.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
process.env.JWT_SECRET = crypto.randomBytes(48).toString("hex");
const createApp = require("../src/app");
const { signToken } = require("../src/utils/jwt");
const dbName = "fitmanager_trainer_test_" + crypto.randomBytes(8).toString("hex");
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

  const trainerUser = await User.create({fullName:'PT One',email:'pt@test.example',password:'StrongPass123',role:'trainer'});
  const otherUser = await User.create({fullName:'PT Two',email:'other@test.example',password:'StrongPass123',role:'trainer'});
  const trainer = await TrainerProfile.create({user:trainerUser._id,pricePerSession:100000});
  await TrainerProfile.create({user:otherUser._id,pricePerSession:100000});
  const token = signToken({id:trainerUser._id});
  const otherToken = signToken({id:otherUser._id});
  const pkg = await MembershipPackage.create({name:'PT',price:100000,durationDays:30});
  const sub = await Subscription.create({member:member._id,package:pkg._id,startDate:'2026-10-01',endDate:'2026-11-01',amount:100000});
  await Booking.create({member:member._id,trainer:trainer._id,subscription:sub._id,date:'2026-10-23',startTime:'09:00',endTime:'10:00'});
  assert.equal((await call('/trainer/schedule?date=2026-10-23','GET',null,200,token)).bookings.length,1);
  assert.equal((await call('/trainer/schedule?date=2026-10-24','GET',null,200,token)).bookings.length,0);
  await call('/trainer/schedule?date=2026-02-30','GET',null,400,token);
  await call('/trainer/schedule?status=invalid','GET',null,400,token);
  await call('/trainer/schedule','GET',null,403,memberToken);
  const {plan}=await call('/trainer/workout-plans','POST',{memberId:member._id,title:'Strength',startDate:'2026-10-01',endDate:'2026-11-01',items:[]},201,token);
  const path='/trainer/workout-plans/'+plan._id;
  await call(path,'PATCH',{endDate:'2026-09-30'},400,token);
  await call(path,'PATCH',{startDate:'2026-12-01'},400,token);
  await call(path,'PATCH',{title:'Intrusion'},404,otherToken);
  const edited=await call(path,'PATCH',{title:'Updated',member:otherUser._id,trainer:otherUser._id},200,token);
  assert.equal(edited.plan.title,'Updated');
  assert.equal(edited.plan.member._id,String(member._id));
  const result=await call('/trainer/member/workout-plans','GET',null,200,memberToken);
  assert.equal(result.plans.length,1);
  assert.equal(result.plans[0].trainerUser.fullName,'PT One');
  assert.equal(result.plans[0].trainerUser.password,undefined);
  assert.equal(result.plans[0].endDate,'2026-11-01T00:00:00.000Z');
  console.log('PASS: PT calendar filters, role/ownership isolation, partial-update date validation and member trainer details.');
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
      /^fitmanager_trainer_test_[a-f0-9]{16}$/.test(dbName)
    )
      await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
