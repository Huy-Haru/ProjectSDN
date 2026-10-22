// Integration suite: only writes to a randomly named disposable database.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
process.env.JWT_SECRET = crypto.randomBytes(48).toString("hex");
const createApp = require("../src/app");
const { signToken } = require("../src/utils/jwt");
const dbName = "fitmanager_review_test_" + crypto.randomBytes(8).toString("hex");
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



  const {Review}=require('../src/models');
  const pt=await User.create({fullName:'Review PT',email:'pt@test.example',password:'StrongPass123',role:'trainer'});
  const otherPT=await User.create({fullName:'Other PT',email:'other-pt@test.example',password:'StrongPass123',role:'trainer'});
  const trainer=await TrainerProfile.create({user:pt._id,pricePerSession:1});
  await TrainerProfile.create({user:otherPT._id,pricePerSession:1});
  const other=await User.create({fullName:'Other Member',email:'other@test.example',password:'StrongPass123'});
  const ptToken=signToken({id:pt._id}),otherToken=signToken({id:other._id});
  const pkg=await MembershipPackage.create({name:'Review',price:1,durationDays:30});
  const sub=await Subscription.create({member:member._id,package:pkg._id,startDate:'2020-01-01',endDate:'2020-02-01',amount:1});
  const make=(status,hour,owner=member._id,date='2020-01-01')=>Booking.create({member:owner,trainer:trainer._id,subscription:sub._id,date,startTime:hour+':00',endTime:hour+':30',status});
  const done=await make('completed','09'),second=await make('completed','10');
  const booked=await make('booked','11'),cancelled=await make('cancelled','12'),absent=await make('no_show','13');
  const foreign=await make('completed','14',other._id),future=await make('completed','15',member._id,'2999-01-01');
  assert.equal((await call('/member/reviews','GET',null,200,memberToken)).eligible.length,2);
  await call('/member/reviews','POST',{bookingId:String(done._id),rating:5},403,ptToken);
  for(const booking of [booked,cancelled,absent,future]) await call('/member/reviews','POST',{bookingId:String(booking._id),rating:5},409,memberToken);
  await call('/member/reviews','POST',{bookingId:String(foreign._id),rating:5},404,memberToken);
  for(const rating of [0,6,2.5,'5']) await call('/member/reviews','POST',{bookingId:String(done._id),rating},400,memberToken);
  await call('/member/reviews','POST',{bookingId:String(done._id),rating:5,comment:'x'.repeat(2001)},400,memberToken);
  const payload={bookingId:String(done._id),rating:4,comment:'Verified review',member:other._id,trainer:otherPT._id};
  const results=await Promise.all([1,2].map(()=>fetch(base+'/member/reviews',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+memberToken},body:JSON.stringify(payload)})));
  assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);
  const saved=await Review.findOne({booking:done._id});
  assert.equal(String(saved.member),String(member._id));assert.equal(String(saved.trainer),String(trainer._id));
  await call('/member/reviews','POST',{bookingId:String(second._id),rating:2},201,memberToken);
  const mine=await call('/member/reviews','GET',null,200,memberToken);
  assert.equal(mine.reviews.length,2);assert.equal(mine.eligible.length,0);
  assert.equal((await call('/member/reviews','GET',null,200,otherToken)).reviews.length,0);
  const ptReviews=await call('/trainer/reviews','GET',null,200,ptToken);
  assert.equal(ptReviews.summary.count,2);assert.equal(ptReviews.summary.average,3);
  assert.equal(ptReviews.reviews[0].member.fullName,member.fullName);assert.equal(ptReviews.reviews[0].member.email,undefined);
  assert.equal((await call('/trainer/reviews','GET',null,200,signToken({id:otherPT._id}))).reviews.length,0);
  await TrainerProfile.updateOne({_id:trainer._id},{$set:{ratingCount:999,ratingAverage:5}});
  const listing=await call('/member/trainers','GET',null,200,memberToken);
  const listed=listing.trainers.find(t=>t._id===String(trainer._id));assert.equal(listed.ratingCount,2);assert.equal(listed.ratingAverage,3);
  console.log('PASS: completed-session reviews, ownership/role isolation, duplicate race, validation and canonical trainer rating totals.');
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
      /^fitmanager_review_test_[a-f0-9]{16}$/.test(dbName)
    )
      await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
