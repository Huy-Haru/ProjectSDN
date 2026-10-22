// Integration suite: only writes to a randomly named disposable database.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
process.env.JWT_SECRET = crypto.randomBytes(48).toString("hex");
const createApp = require("../src/app");
const { signToken } = require("../src/utils/jwt");
const dbName = "fitmanager_booking_test_" + crypto.randomBytes(8).toString("hex");
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



  const pt=await User.create({fullName:'Booking PT',email:'pt@test.example',password:'StrongPass123',role:'trainer'});
  const trainer=await TrainerProfile.create({user:pt._id,pricePerSession:100000});
  const pkg=await MembershipPackage.create({name:'PT quota',price:100000,durationDays:30,includesPT:true,sessionLimit:1});
  const other=await User.create({fullName:'Other',email:'other@test.example',password:'StrongPass123'});
  const otherToken=signToken({id:other._id});
  const {subscription:sub}=await call('/member/subscriptions','POST',{packageId:pkg._id},201,memberToken);
  const date=new Date(Date.now()+2*86400000).toISOString().slice(0,10);
  const payload={subscriptionId:sub._id,trainerId:String(trainer._id),date,startTime:'09:00',member:other._id,status:'completed'};
  await call('/member/bookings','POST',payload,409,memberToken);
  await call('/admin/subscriptions/'+sub._id+'/confirm-payment','POST',{});
  assert.equal((await call('/member/trainers','GET',null,200,memberToken)).trainers.length,1);
  await call('/member/bookings','POST',{...payload,startTime:'09:30'},400,memberToken);
  await call('/member/bookings','POST',{...payload,date:'2026-02-30'},400,memberToken);
  await call('/member/bookings','POST',payload,409,otherToken);
  const headers={'Content-Type':'application/json',Authorization:'Bearer '+memberToken};
  const results=await Promise.all(['09:00','10:00'].map(startTime=>fetch(base+'/member/bookings',{method:'POST',headers,body:JSON.stringify({...payload,startTime})})));
  assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);
  const success=await results.find(r=>r.status===201).json();const booking=success.data.booking;
  assert.equal(booking.member,String(member._id));assert.equal(booking.status,'booked');
  assert.equal((await Subscription.findById(sub._id)).reservedSessions,1);
  await call('/member/bookings/'+booking._id+'/cancel','POST',{},404,otherToken);
  await call('/member/bookings/'+booking._id+'/cancel','POST',{},200,memberToken);
  await call('/member/bookings/'+booking._id+'/cancel','POST',{},200,memberToken);
  assert.equal((await Subscription.findById(sub._id)).reservedSessions,0);
  const second=await call('/member/bookings','POST',payload,201,memberToken);
  await call('/admin/bookings/'+second.booking._id+'/status','PATCH',{status:'cancelled'});
  assert.equal((await Subscription.findById(sub._id)).reservedSessions,0);
  const third=await call('/member/bookings','POST',payload,201,memberToken);
  assert.equal((await call('/member/bookings','GET',null,200,otherToken)).bookings.length,0);
  assert.equal((await call('/member/bookings','GET',null,200,memberToken)).bookings[0].trainer.user.fullName,'Booking PT');
  // Another member has quota, but cannot reserve the trainer's occupied slot. No quota leaks.
  const otherSub=await Subscription.create({member:other._id,package:pkg._id,startDate:new Date(Date.now()-86400000),endDate:new Date(Date.now()+30*86400000),amount:1,status:'active',paymentStatus:'paid',paidAt:new Date(),includesPT:true,sessionLimit:1,reservedSessions:0});
  await call('/member/bookings','POST',{...payload,subscriptionId:String(otherSub._id)},409,otherToken);
  assert.equal((await Subscription.findById(otherSub._id)).reservedSessions,0);
  await Booking.updateOne({_id:third.booking._id},{$set:{date:new Date('2020-01-01')}});
  await call('/member/bookings/'+third.booking._id+'/cancel','POST',{},409,memberToken);
  const rival=await User.create({fullName:'Rival',email:'rival@test.example',password:'StrongPass123'});
  const rivalSub=await Subscription.create({member:rival._id,package:pkg._id,startDate:new Date(Date.now()-86400000),endDate:new Date(Date.now()+30*86400000),amount:1,status:'active',paymentStatus:'paid',paidAt:new Date(),includesPT:true,sessionLimit:1,reservedSessions:0});
  const race=await Promise.all([{token:otherToken,sub:otherSub._id},{token:signToken({id:rival._id}),sub:rivalSub._id}].map(item=>fetch(base+'/member/bookings',{method:'POST',headers:{...headers,Authorization:'Bearer '+item.token},body:JSON.stringify({...payload,subscriptionId:String(item.sub),startTime:'11:00'})})));
  assert.deepEqual(race.map(r=>r.status).sort(),[201,409]);
  const counters=await Subscription.find({_id:{$in:[otherSub._id,rivalSub._id]}});
  assert.equal(counters.reduce((sum,s)=>sum+s.reservedSessions,0),1);
  await TrainerProfile.updateOne({_id:trainer._id},{$set:{isActive:false}});
  assert.equal((await call('/member/trainers','GET',null,200,memberToken)).trainers.length,0);
  await call('/member/bookings','POST',{...payload,subscriptionId:String(otherSub._id),startTime:'11:00'},409,otherToken);
  const {reconcile}=require('./reconcile-booking-quota');
  await Subscription.updateOne({_id:sub._id},{$set:{reservedSessions:5}});
  const differences=await reconcile();
  assert.equal(differences.find(d=>d.subscription===sub._id).expected,1);
  assert.equal((await Subscription.findById(sub._id)).reservedSessions,5);
  await assert.rejects(reconcile({apply:true}),/writers/);
  await reconcile({apply:true,writersStopped:true});
  assert.equal((await Subscription.findById(sub._id)).reservedSessions,1);
  assert.equal((await reconcile()).length,0);
  console.log('PASS: member booking ownership, paid PT quota, concurrent reservation, conflicts, cancellation/refund and trainer activity.');
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
      /^fitmanager_booking_test_[a-f0-9]{16}$/.test(dbName)
    )
      await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
