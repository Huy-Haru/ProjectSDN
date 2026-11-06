// Integration suite: only writes to a randomly named disposable database.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
process.env.JWT_SECRET = crypto.randomBytes(48).toString("hex");
const createApp = require("../src/app");
const { signToken } = require("../src/utils/jwt");
const dbName = "fitmanager_progress_test_" + crypto.randomBytes(8).toString("hex");
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



  const pt=await User.create({fullName:'PT Progress',email:'pt@test.example',password:'StrongPass123',role:'trainer'});
  const stranger=await User.create({fullName:'PT Other',email:'other-pt@test.example',password:'StrongPass123',role:'trainer'});
  const trainer=await TrainerProfile.create({user:pt._id,pricePerSession:1});
  await TrainerProfile.create({user:stranger._id,pricePerSession:1});
  const ptToken=signToken({id:pt._id}), strangerToken=signToken({id:stranger._id});
  const pkg=await MembershipPackage.create({name:'Progress',price:1,durationDays:30});
  const sub=await Subscription.create({member:member._id,package:pkg._id,startDate:'2020-01-01',endDate:'2020-02-01',amount:1});
  await Booking.create({member:member._id,trainer:trainer._id,subscription:sub._id,date:'2020-01-01',startTime:'09:00',endTime:'10:00',status:'completed'});
  const path='/trainer/members/'+member._id+'/progress';
  await call(path,'POST',{weight:70},403,strangerToken);
  await call(path,'POST',{weight:70},403,memberToken);
  await call(path,'GET',null,403,strangerToken);
  await call(path,'POST',{},400,ptToken);
  await call(path,'POST',{weight:'70'},400,ptToken);
  await call(path,'POST',{weight:-1},400,ptToken);
  await call(path,'POST',{bodyFat:101},400,ptToken);
  await call(path,'POST',{date:'2020-02-30',weight:70},400,ptToken);
  await call(path,'POST',{date:'2999-01-01',weight:70},400,ptToken);
  const {log}=await call(path,'POST',{date:'2020-01-02',weight:70.5,height:175,bodyFat:18.2,note:'Good progress',member:admin._id,trainer:stranger._id,attendedSessions:999},201,ptToken);
  assert.equal(log.member,String(member._id));assert.equal(log.trainer,String(trainer._id));assert.equal(log.attendedSessions,1);
  const earlier=await call(path,'POST',{date:'2019-12-31',note:'Initial consultation'},201,ptToken);
  assert.equal(earlier.log.attendedSessions,0);
  assert.equal(earlier.log.weight,undefined);
  const memberLogs=await call('/member/progress','GET',null,200,memberToken);
  assert.equal(memberLogs.logs.length,2);assert.equal(memberLogs.logs[0].trainer.user.fullName,'PT Progress');
  assert.equal(memberLogs.logs[0].trainer.user.password,undefined);
  const other=await User.create({fullName:'Other Member',email:'other@test.example',password:'StrongPass123'});
  assert.equal((await call('/member/progress','GET',null,200,signToken({id:other._id}))).logs.length,0);
  await Booking.create({member:other._id,trainer:trainer._id,subscription:sub._id,date:'2020-01-03',startTime:'09:00',endTime:'10:00',status:'cancelled'});
  await call('/trainer/members/'+other._id+'/progress','POST',{weight:70},403,ptToken);
  assert.equal((await call(path,'GET',null,200,ptToken)).logs.length,2);
  const payload={date:'2020-01-02',weight:72,note:'Retry safe',requestId:crypto.randomUUID()};
  const first=await call(path,'POST',payload,201,ptToken);
  await Booking.create({member:member._id,trainer:trainer._id,subscription:sub._id,date:'2020-01-02',startTime:'11:00',endTime:'12:00',status:'completed'});
  const again=await call(path,'POST',payload,201,ptToken);
  assert.equal(again.log.attendedSessions,1);
  assert.equal(first.log._id,again.log._id);
  assert.equal(again.log.requestHash,undefined);assert.equal(again.log.requestId,undefined);
  await call(path,'POST',{...payload,weight:73},409,ptToken);
  await call(path,'POST',{...payload,requestId:'bad'},400,ptToken);
  const concurrent={...payload,requestId:crypto.randomUUID()};
  const responses=await Promise.all([1,2].map(()=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+ptToken},body:JSON.stringify(concurrent)})));
  assert.deepEqual(responses.map(r=>r.status),[201,201]);
  const bodies=await Promise.all(responses.map(r=>r.json()));
  assert.equal(bodies[0].data.log._id,bodies[1].data.log._id);
  assert.equal(await require('../src/models').ProgressLog.countDocuments({requestId:concurrent.requestId}),1);
  await TrainerProfile.updateOne({_id:trainer._id},{$set:{isActive:false}});
  await call(path,'POST',{weight:71},403,ptToken);
  console.log('PASS: PT/member progress isolation, related active trainer, measurements/date validation, server-derived attendance and idempotent concurrent retries.');
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
      /^fitmanager_progress_test_[a-f0-9]{16}$/.test(dbName)
    )
      await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
