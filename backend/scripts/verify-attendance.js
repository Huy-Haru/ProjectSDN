// Integration suite: only writes to a randomly named disposable database.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
process.env.JWT_SECRET = crypto.randomBytes(48).toString("hex");
const createApp = require("../src/app");
const { signToken } = require("../src/utils/jwt");
const dbName = "fitmanager_attendance_test_" + crypto.randomBytes(8).toString("hex");
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



  const pt=await User.create({fullName:'Attendance PT',email:'pt@test.example',password:'StrongPass123',role:'trainer'});
  const other=await User.create({fullName:'Other PT',email:'other@test.example',password:'StrongPass123',role:'trainer'});
  const trainer=await TrainerProfile.create({user:pt._id,pricePerSession:1});
  await TrainerProfile.create({user:other._id,pricePerSession:1});
  const token=signToken({id:pt._id}),otherToken=signToken({id:other._id});
  const pkg=await MembershipPackage.create({name:'Attendance',price:1,durationDays:30});
  const sub=await Subscription.create({member:member._id,package:pkg._id,startDate:'2020-01-01',endDate:'2020-02-01',amount:1,reservedSessions:4});
  const make=(hour,date='2020-01-01',status='booked')=>Booking.create({member:member._id,trainer:trainer._id,subscription:sub._id,date,startTime:hour+':00',endTime:hour+':30',status,quotaReserved:true});
  const done=await make('09'),absent=await make('10'),future=await make('11','2999-01-01'),cancelled=await make('12','2020-01-01','cancelled');
  const path=id=>'/trainer/bookings/'+id+'/status';
  await call(path(done._id),'PATCH',{status:'completed'},403,memberToken);
  await call(path(done._id),'PATCH',{status:'completed'},404,otherToken);
  await call(path(done._id),'PATCH',{status:'cancelled'},400,token);
  await call(path(future._id),'PATCH',{status:'completed'},409,token);
  await call(path(future._id),'PATCH',{status:'no_show'},409,token);
  await call(path(cancelled._id),'PATCH',{status:'completed'},409,token);
  await call(path(done._id),'PATCH',{status:'completed',trainer:other._id},200,token);
  await call(path(done._id),'PATCH',{status:'completed'},200,token);
  await call(path(done._id),'PATCH',{status:'no_show'},409,token);
  await call(path(absent._id),'PATCH',{status:'no_show'},200,token);
  assert.equal((await Subscription.findById(sub._id)).reservedSessions,4);
  const review=await call('/member/reviews','GET',null,200,memberToken);
  assert.deepEqual(review.eligible.map(b=>b._id),[String(done._id)]);
  await call('/member/reviews','POST',{bookingId:String(done._id),rating:5},201,memberToken);
  const progress=await call('/trainer/members/'+member._id+'/progress','POST',{weight:70},201,token);
  assert.equal(progress.log.attendedSessions,1);
  const concurrent=await make('13');
  const responses=await Promise.all(['completed','no_show'].map(status=>fetch(base+path(concurrent._id),{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({status})})));
  assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
  await TrainerProfile.updateOne({_id:trainer._id},{$set:{isActive:false}});
  await call(path(future._id),'PATCH',{status:'completed'},403,token);
  console.log('PASS: PT attendance ownership, time/state guards, idempotency, concurrent transitions and progress/review linkage.');
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
      /^fitmanager_attendance_test_[a-f0-9]{16}$/.test(dbName)
    )
      await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
