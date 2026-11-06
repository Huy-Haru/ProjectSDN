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
  const current=(await call(path,'GET',null,200,token)).plan;
  await call(path,'PATCH',{title:'Stale overwrite',expectedVersion:current.__v-1},409,token);
  await call(path,'PATCH',{title:'Bad version',expectedVersion:String(current.__v)},409,token);
  const revised=await call(path,'PATCH',{title:'Revised strength',status:'completed',expectedVersion:current.__v,items:[{exerciseName:'Squat',sets:4,reps:'12',dayOfWeek:'Thứ 2',note:'Control tempo'}]},200,token);
  assert.equal(revised.plan.items[0].sets,4);
  assert.equal(revised.plan.status,'completed');
  assert.ok(revised.plan.__v>current.__v);
  const simultaneous=await Promise.all(['First edit','Second edit'].map(title=>fetch(base+path,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({title,expectedVersion:revised.plan.__v})})));
  assert.deepEqual(simultaneous.map(r=>r.status).sort(),[200,409]);
  const memberUpdated=(await call('/trainer/member/workout-plans','GET',null,200,memberToken)).plans[0];
  assert.equal(memberUpdated.items[0].reps,'12');assert.equal(memberUpdated.status,'completed');
  await call('/trainer/workout-plans','POST',{memberId:member._id,title:123,startDate:'2026-10-01',endDate:'2026-11-01'},400,token);
  await call('/trainer/workout-plans','POST',{memberId:member._id,title:'Bad goal',goal:123,startDate:'2026-10-01',endDate:'2026-11-01'},400,token);
  for(let i=0;i<12;i++) {
    const student=await User.create({fullName:i===0?'Paged [Pro]':'Paged '+String(i).padStart(2,'0'),email:'paged'+i+'@test.example',password:'StrongPass123'});
    const membership=await Subscription.create({member:student._id,package:pkg._id,startDate:'2020-01-01',endDate:'2020-02-01',amount:1});
    await Booking.create({member:student._id,trainer:trainer._id,subscription:membership._id,date:'2020-01-'+String(i+1).padStart(2,'0'),startTime:'09:00',endTime:'10:00'});
  }
  await Booking.create({member:member._id,trainer:trainer._id,subscription:sub._id,date:'2020-06-01',startTime:'09:00',endTime:'10:00',status:'completed'});
  await Booking.create({member:member._id,trainer:trainer._id,subscription:sub._id,date:'2020-07-01',startTime:'09:00',endTime:'10:00',status:'cancelled'});
  const listPath='/trainer/members';
  const first=await call(listPath+'?limit=5','GET',null,200,token);
  const secondPage=await call(listPath+'?limit=5&page=2','GET',null,200,token);
  assert.equal(first.total,13);assert.equal(first.pages,3);assert.equal(first.members.length,5);
  assert.equal(new Set([...first.members,...secondPage.members].map(m=>m._id)).size,10);
  assert.equal((await call(listPath+'?limit=5&page=3','GET',null,200,token)).members.length,3);
  assert.equal((await call(listPath+'?limit=5&page=4','GET',null,200,token)).members.length,0);
  const memberStats=(await call(listPath+'?search=member%40test.example','GET',null,200,token)).members[0];
  assert.equal(memberStats.totalBookings,3);assert.equal(memberStats.completedBookings,1);assert.equal(memberStats.latestBooking.date,'2026-10-23T00:00:00.000Z');
  assert.equal(memberStats.password,undefined);
  assert.equal((await call(listPath+'?search=%5BPro%5D','GET',null,200,token)).total,1);
  assert.equal((await call(listPath+'?search=.*','GET',null,200,token)).total,0);
  assert.equal((await call(listPath,'GET',null,200,otherToken)).total,0);
  for(const query of ['limit=101','page=0','page=1&page=2','search=a&search=b','page=90071992547409910','search='+ 'a'.repeat(121)]) await call(listPath+'?'+query,'GET',null,400,token);
  const WorkoutPlan=require('../src/models/WorkoutPlan');
  for(let i=0;i<12;i++) await WorkoutPlan.create({trainer:trainer._id,member:member._id,title:'Paged plan '+i,startDate:'2020-01-01',endDate:'2020-02-01',status:'active',items:[]});
  const otherProfile=await TrainerProfile.findOne({user:otherUser._id});
  await WorkoutPlan.create({trainer:otherProfile._id,member:member._id,title:'Foreign plan',startDate:'2020-01-01',endDate:'2020-02-01',items:[]});
  const plansPath='/trainer/workout-plans?memberId='+member._id;
  const plans1=await call(plansPath+'&limit=5','GET',null,200,token);
  const plans2=await call(plansPath+'&limit=5&page=2','GET',null,200,token);
  assert.equal(plans1.total,13);assert.equal(plans1.pages,3);
  assert.equal(new Set([...plans1.plans,...plans2.plans].map(p=>p._id)).size,10);
  assert.equal((await call(plansPath+'&limit=5&page=3','GET',null,200,token)).plans.length,3);
  assert.equal((await call(plansPath+'&limit=5&page=4','GET',null,200,token)).plans.length,0);
  assert.equal((await call(plansPath+'&status=active','GET',null,200,token)).total,12);
  const completedPlans=await call(plansPath+'&status=completed','GET',null,200,token);
  assert.equal(completedPlans.total,1);assert.equal(completedPlans.plans[0]._id,plan._id);
  assert.equal(completedPlans.plans[0].member.password,undefined);
  for(const query of ['status=wrong','status=active&status=completed','memberId=bad','limit=101','page=0']) await call('/trainer/workout-plans?'+query,'GET',null,400,token);
  await TrainerProfile.updateOne({_id:trainer._id},{$set:{isActive:false}});
  await call(path,'PATCH',{title:'Locked PT edit'},404,token);
  await call('/trainer/workout-plans','POST',{memberId:member._id,title:'Locked PT plan',startDate:'2026-10-01',endDate:'2026-11-01'},404,token);
  console.log('PASS: paginated/filtered PT plans and paginated PT members with literal search and aggregate stats, PT plan revision races/items/status, calendar filters, role/ownership isolation, partial-update date validation and member trainer details.');
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
