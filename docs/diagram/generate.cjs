// Editable draw.io source and matching SVG previews; no generated bitmaps in the source.
const { Diagram } = require('./drawio.cjs');
const fs = require('node:fs');
const P=(d,id,side,f=.5)=>d.port(id,side,f);
const title=(d,text)=>d.node('title',text,35,20,d.width-70,55,'note',{font:25,bold:true});
const subtitle=(d,text,y=80)=>d.node('subtitle',text,35,y,d.width-70,45,'note',{font:16});
function horizontal(d,a,b,text='',opts={}){const af=opts.sf??.5,bf=opts.tf??.5,from=opts.from||'right',to=opts.to||'left';const p=P(d,a,from,af),q=P(d,b,to,bf),x=opts.x??(p[0]+q[0])/2;d.edge(a,b,text,{...opts,from,to,sf:af,tf:bf,via:p[1]===q[1]?[]:[[x,p[1]],[x,q[1]]]});}
function vertical(d,a,b,text='',opts={}){const af=opts.sf??.5,bf=opts.tf??.5,from=opts.from||'bottom',to=opts.to||'top';const p=P(d,a,from,af),q=P(d,b,to,bf),y=opts.y??(p[1]+q[1])/2;d.edge(a,b,text,{...opts,from,to,sf:af,tf:bf,via:p[0]===q[0]?[]:[[p[0],y],[q[0],y]]});}

// DFD level 0: external entities are rectangles; the entire system is one process.
{
 const d=new Diagram('Context diagram — FitManager',1640,1020);title(d,'CONTEXT DIAGRAM · FITMANAGER');subtitle(d,'DFD mức 0 · Mỗi mũi tên là một luồng dữ liệu có hướng · Thanh toán xác nhận thủ công');
 d.node('system','0\nFITMANAGER\nQuản lý phòng tập\nvà huấn luyện viên',670,330,360,360,'process',{bold:true,font:23});
 for(const [id,label,x,y] of [['guest','Khách',70,180],['member','Member / Hội viên',70,730],['trainer','PT / Huấn luyện viên',1330,180],['admin','Admin / Quản trị viên',1330,730]])d.node(id,label,x,y,230,110,'external',{color:'gray',bold:true,font:19});
 function flow(a,b,text,from,to,sf,tf,x,label){const p=P(d,a,from,sf),q=P(d,b,to,tf);d.edge(a,b,text,{from,to,sf,tf,via:[[x,p[1]],[x,q[1]]],label,backing:false});}
 flow('guest','system','Tiêu chí tra cứu; thông tin\nđăng ký / đăng nhập','right','left',.35,.25,540,[420,176]);
 flow('system','guest','Thông tin gói tập;\nkết quả đăng ký / xác thực','left','right',.12,.85,600,[415,302]);
 flow('member','system','Yêu cầu gói / đặt, hủy lịch;\nprofile và đánh giá','right','left',.35,.70,540,[425,708]);
 flow('system','member','Trạng thái gói / lịch;\ngiáo án, tiến độ và kết quả xử lý','left','right',.85,.85,600,[460,855]);
 flow('trainer','system','Profile PT; giáo án / tiến độ;\nkết quả buổi tập','left','right',.35,.25,1170,[1210,165]);
 flow('system','trainer','Lịch và hội viên;\nđánh giá / thống kê','right','left',.12,.85,1110,[1280,312]);
 flow('admin','system','Dữ liệu quản lý;\ntrạng thái lịch;\nxác nhận thanh toán','left','right',.35,.70,1170,[1270,670]);
 flow('system','admin','Danh sách quản lý; doanh thu;\ntrạng thái vận hành','right','left',.85,.85,1110,[1210,855]);
 d.node('legend','Phạm vi: website + API + lưu trữ nội bộ. MongoDB không phải tác nhân ngoài hệ thống.\nGuest chưa đăng nhập; ba role tài khoản: member, trainer (PT), admin.',100,935,1440,65,'note',{font:16});d.write('context');
}

// UML use cases: plain actor associations; mandatory include and conditional extend.
function usecases(file,role,bases,helpers=[]){
 if(file !== 'usecase-guest') bases=[...bases,['logout','UC-02 · Đăng xuất']];
 const height=210+bases.length*130;
 const d=new Diagram('Use case — '+role,1760,height+120);title(d,'USE CASE · '+role.toUpperCase());
 d.node('system','FitManager — ranh giới hệ thống',340,105,1370,height-20,'boundary');
 d.node('actor',role,70,height/2-55,130,110,'actor',{color:'gray',font:20});
 bases.forEach((c,i)=>{d.node(c[0],c[1],430,185+i*130,410,83,'usecase',{color:c[2]||'blue',font:18,parent:'system'});d.edge('actor',c[0],'',{kind:'association',from:'right',to:'left'});});
 helpers.forEach((h,i)=>{
   const base=d.get(h.base),y=h.y??base.y;
   d.node('helper'+i,h.text,1160,y,420,83,'usecase',{color:h.kind==='extend'?'amber':'green',font:17,parent:'system'});
   if(h.kind==='extend')horizontal(d,'helper'+i,h.base,'«extend»\n'+h.guard,{from:'left',to:'right',x:h.x||1010,kind:'extend',label:[1000,y+25]});
   else horizontal(d,h.base,'helper'+i,'«include»',{kind:'include',x:h.x||970,label:[1000,(base.y+y)/2+26]});
 });
 d.node('legend','Association: đường liền không mũi tên. «include»: use case chính → xử lý bắt buộc.\n«extend»: hành vi tùy chọn → use case được mở rộng; điều kiện ghi trong [ ].\nCác thao tác bảo vệ có tiền điều kiện đăng nhập đúng vai trò; không include “Đăng nhập” vào mọi thao tác.',380,height+8,1300,85,'note',{font:15});
 d.write(file);
}
usecases('usecase-guest','Khách',[
 ['packages','Xem danh sách / chi tiết gói tập'],['register','UC-01 · Đăng ký tài khoản Member'],['login','UC-02 · Đăng nhập']
],[{base:'register',text:'Kiểm tra email / mật khẩu\nGán role member'},{base:'login',text:'Kiểm tra tài khoản hoạt động\nvà mật khẩu'}]);
usecases('usecase-member','Member / Hội viên',[
 ['auth','UC-02 · Đăng nhập'],['profile','UC-11 · Xem / cập nhật profile'],['catalog','FR-03 · Xem gói tập và tìm PT'],['subscribe','UC-03 · Đăng ký gói tập'],['my-package','Xem gói / trạng thái thanh toán'],['book','UC-04 · Đặt lịch với PT'],['schedule','UC-05 · Xem lịch của mình'],['plan','UC-07 · Xem giáo án'],['progress','UC-07 · Xem tiến độ tập luyện'],['review','UC-08 · Đánh giá PT'],['dashboard','FR-15 · Xem dashboard cá nhân']
],[{base:'subscribe',text:'Kiểm tra gói hoạt động\nChốt giá / thời hạn'}, {base:'book',text:'Kiểm tra gói paid / active\nNgày hiệu lực và hạn mức buổi',y:795}, {base:'book',text:'Kiểm tra thời gian / xung đột\nPT và hội viên',y:900,x:1040}, {base:'schedule',text:'Hủy lịch của mình',kind:'extend',guard:'[trước giờ bắt đầu]',y:1040}, {base:'review',text:'Kiểm tra booking completed\nĐúng chủ và chưa đánh giá'}]);
usecases('usecase-trainer','PT / Huấn luyện viên',[
 ['auth','UC-02 · Đăng nhập'],['profile','UC-11 · Xem / cập nhật profile PT'],['schedule','FR-09 · Xem lịch của mình'],['result','UC-06 · Xác nhận kết quả buổi tập'],['students','Xem hội viên liên quan'],['plan','UC-07 · Tạo / cập nhật giáo án'],['progress','UC-07 · Cập nhật tiến độ hội viên'],['reviews','Xem đánh giá của hội viên'],['dashboard','FR-15 · Xem dashboard PT']
],[{base:'result',text:'Kiểm tra quyền / giờ kết thúc\nLưu completed hoặc no_show'}, {base:'plan',text:'Kiểm tra hội viên liên quan\nValidate giáo án và khoảng ngày'}, {base:'progress',text:'Kiểm tra quyền cập nhật\nValidate chỉ số cơ thể'}]);
usecases('usecase-admin','Admin / Quản trị viên',[
 ['auth','UC-02 · Đăng nhập'],['profile','UC-11 · Xem / cập nhật profile'],['packages','UC-09 · Quản lý gói tập'],['trainers','UC-09 · Quản lý PT'],['members','UC-09 · Quản lý hội viên'],['schedule','Quản lý lịch và kết quả buổi tập'],['payment','UC-03 · Xác nhận thanh toán'],['revenue','UC-10 · Xem báo cáo doanh thu'],['dashboard','FR-15 · Xem dashboard quản trị']
],[{base:'packages',text:'Vô hiệu hóa gói tập',kind:'extend',guard:'[chọn khóa gói]'}, {base:'trainers',text:'Khóa tài khoản / hồ sơ PT',kind:'extend',guard:'[chọn khóa PT]'}, {base:'members',text:'Khóa tài khoản hội viên',kind:'extend',guard:'[chọn khóa hội viên]'}, {base:'payment',text:'Lưu paid / paidAt\nKích hoạt khi đủ điều kiện'}, {base:'revenue',text:'Lọc paid theo paidAt\nTổng hợp amount theo kỳ'}]);

function swim(titleText,roles,height){
 const d=new Diagram(titleText,1490,height);title(d,titleText.toUpperCase());subtitle(d,'Activity workflow · Trách nhiệm theo lane · Luồng đã nối API / MongoDB');
 roles.forEach((role,i)=>d.lane('lane'+i,role,40+i*470,140,470,height-210,['blue','green','purple'][i]));
 const n=(id,text,lane,y,kind='activity',opts={})=>{
   const size=kind==='decision'?[270,115]:['initial','final'].includes(kind)?[26,26]:[350,85];
   const x=40+lane*470+(470-size[0])/2;
   return d.node(id,text,x,y,size[0],size[1],kind,{parent:'lane'+lane,color:kind==='decision'?'amber':['blue','green','purple'][lane],...opts});
 };
 return {d,n};
}
{
 const {d,n}=swim('Swimlane — Đăng ký gói và thanh toán',['Member / Hội viên','Hệ thống (React / API / MongoDB)','Admin / Quản trị viên'],2050);
 n('start','',0,230,'initial');n('choose','Chọn gói tập\nGửi yêu cầu đăng ký',0,320);n('validate','Kiểm tra tài khoản, gói hoạt động\nvà thông tin đăng ký',1,475);n('valid','Hợp lệ?',1,625,'decision');
 n('error','Hiển thị lý do từ chối\nSửa thông tin / chọn lại',0,640);n('failed','',0,840,'final');
 n('create','Chốt amount và thời hạn\nLưu Subscription pending / unpaid',1,840);n('collect','Đối chiếu đăng ký\nXác nhận đã thu tiền',2,1010);n('paid','Đã thanh toán?',2,1170,'decision');
 n('pending','Giữ pending / unpaid\nChưa cấp quyền dùng gói',2,1390);n('pending-end','',2,1600,'final');
 n('activate','Lưu paid và paidAt\nKích hoạt khi đủ điều kiện',1,1390);n('show','Xem trạng thái gói đã cập nhật',0,1600);n('end','',0,1810,'final');
 vertical(d,'start','choose');horizontal(d,'choose','validate','Yêu cầu đăng ký',{label:[505,425]});vertical(d,'validate','valid');
 horizontal(d,'valid','error','[Không]',{from:'left',to:'right',label:[500,670]});vertical(d,'error','failed');vertical(d,'valid','create','[Có]',{label:[745,790]});
 horizontal(d,'create','collect','Thông tin đăng ký',{label:[975,960]});vertical(d,'collect','paid');vertical(d,'paid','pending','[Chưa]',{label:[1215,1330]});vertical(d,'pending','pending-end');
 horizontal(d,'paid','activate','[Có]',{from:'left',to:'right',x:1000,label:[1000,1360]});horizontal(d,'activate','show','Kết quả xử lý',{from:'left',to:'right',label:[510,1550]});vertical(d,'show','end');
 d.node('note','Nhánh “chưa thanh toán” kết thúc lần xử lý hiện tại; Admin có thể xác nhận ở lần xử lý sau. Không tích hợp cổng thanh toán ngoài.',55,1980,1370,45,'note',{font:15});d.write('workflow-subscription');
}
{
 const {d,n}=swim('Swimlane — Đặt lịch PT',['Member / Hội viên','Hệ thống (React / API / MongoDB)','PT / Huấn luyện viên'],2520);
 n('start','',0,225,'initial');n('select','Chọn PT / ngày / giờ\nGửi yêu cầu đặt lịch',0,315);n('auth','Kiểm tra phiên / quyền sở hữu\nSubscription và PT liên quan',1,470);n('authorized','Đúng quyền?',1,615,'decision');
 n('error','Hiển thị lỗi điều kiện / quyền\nKhông tạo booking',0,650);n('failed','',0,875,'final');
 n('conditions','Kiểm tra gói paid / active, hạn mức\nNgày trong hạn, giờ hợp lệ / tương lai',1,840);n('valid','Đủ điều kiện?',1,995,'decision');
 n('query','Tra cứu lịch PT và hội viên\nKiểm tra khoảng giờ giao nhau',1,1220);n('conflict','Có xung đột?',1,1380,'decision');n('retry','Hiển thị lỗi (409 nếu trùng lịch)\nSửa thông tin / chọn lại',0,1395);
 n('save','Giữ quota có điều kiện\nLưu Booking booked bằng unique slot',1,1610);n('written','Ghi thành công?',1,1770,'decision');n('return','Trả booking / trạng thái thành công',1,1990);n('confirm','Xem lịch đã đặt',0,2170);n('end','',0,2350,'final');n('pt-view','Tra cứu lịch của mình\nThấy booking mới đã được lưu',2,1980);
 vertical(d,'start','select');horizontal(d,'select','auth','Yêu cầu đặt lịch',{label:[505,420]});vertical(d,'auth','authorized');horizontal(d,'authorized','error','[Không]',{from:'left',to:'right',label:[500,672]});vertical(d,'error','failed');vertical(d,'authorized','conditions','[Có]',{label:[745,790]});vertical(d,'conditions','valid');
 const a=P(d,'valid','left'),b=P(d,'error','right',.8);d.edge('valid','error','[Không]',{from:'left',to:'right',tf:.8,via:[[485,a[1]],[485,b[1]]],label:[475,1020]});
 vertical(d,'valid','query','[Có]',{label:[745,1160]});vertical(d,'query','conflict');horizontal(d,'conflict','retry','[Có]',{from:'left',to:'right',label:[495,1435]});vertical(d,'conflict','save','[Không]',{label:[755,1570]});vertical(d,'save','written');vertical(d,'written','return','[Có]',{label:[745,1940]});
 const s=P(d,'written','left'),t=P(d,'retry','right',.8);d.edge('written','retry','[Cạnh tranh / thất bại]',{from:'left',to:'right',tf:.8,via:[[465,s[1]],[465,t[1]]],label:[345,1770]});
 const r=P(d,'retry','left'),sel=P(d,'select','left',.8);d.edge('retry','select','Chọn lại',{from:'left',to:'left',tf:.8,via:[[70,r[1]],[70,sel[1]]],label:[125,1100]});
 horizontal(d,'return','confirm','Kết quả đặt lịch',{from:'left',to:'right',label:[500,2130]});vertical(d,'confirm','end');horizontal(d,'return','pt-view','Dữ liệu lịch đã lưu',{kind:'data',label:[1010,1970]});
 d.node('note','Ca mới 60 phút tại giờ tròn; unique slot bảo vệ cạnh tranh. MongoDB standalone: đối soát quota sau sự cố (docs/12).',55,2450,1370,45,'note',{font:15});d.write('workflow-booking');
}
{
 const {d,n}=swim('Swimlane — Huấn luyện, tiến độ và đánh giá',['PT / Huấn luyện viên','Hệ thống (React / API / MongoDB)','Member / Hội viên'],3390);
 n('start','',0,225,'initial');n('choose','Chọn hội viên liên quan\nNhập giáo án / mục tiêu',0,315);n('permission','Kiểm tra quan hệ PT – hội viên\nValidate giáo án / khoảng ngày',1,470);n('allowed','Đủ quyền / hợp lệ?',1,630,'decision');n('error','Hiển thị lỗi\nKhông lưu dữ liệu',0,645);n('failed','',0,840,'final');
 n('plan','Lưu WorkoutPlan',1,850);n('view','Xem giáo án\nTham gia buổi tập đã đặt',2,1020);n('result','Sau giờ kết thúc, xác nhận kết quả\n(booked → completed / no_show)',0,1200);n('attended','Đã tham gia?',0,1370,'decision');
 n('noshow','Lưu no_show\nGiữ lịch sử và giữ hạn mức buổi',1,1510);n('noshow-end','',1,1710,'final');
 n('complete','Lưu completed\nKhông tính buổi lặp',1,1870);n('progress','Nhập chỉ số cơ thể / ghi chú\nCập nhật tiến độ',0,2050);n('save-progress','Validate và lưu ProgressLog',1,2210);n('review','Gửi đánh giá?',2,2370,'decision');n('validate-review','Kiểm tra completed / đúng chủ\nChưa có review, rating nguyên 1–5',1,2520);n('review-valid','Đánh giá hợp lệ?',1,2690,'decision');n('review-error','Hiển thị lỗi đánh giá\nKhông tạo Review',2,2705);n('save-review','Lưu Review\nTính ratingAverage / ratingCount',1,2900);n('feedback','Xem kết quả đánh giá',2,3060);n('end','',2,3220,'final');
 vertical(d,'start','choose');horizontal(d,'choose','permission','Yêu cầu lưu',{label:[505,420]});vertical(d,'permission','allowed');horizontal(d,'allowed','error','[Không]',{from:'left',to:'right',label:[500,685]});vertical(d,'error','failed');vertical(d,'allowed','plan','[Có]',{label:[745,800]});horizontal(d,'plan','view','Giáo án',{label:[975,980]});
 const a=P(d,'view','left'),b=P(d,'result','right');d.edge('view','result','Buổi tập diễn ra',{from:'left',to:'right',via:[[970,a[1]],[970,1150],[470,1150],[470,b[1]]],label:[720,1130]});vertical(d,'result','attended');horizontal(d,'attended','noshow','[Không]',{label:[520,1450]});vertical(d,'noshow','noshow-end');
 const c=P(d,'attended','bottom'),e=P(d,'complete','left');d.edge('attended','complete','[Có]',{from:'bottom',to:'left',via:[[c[0],1810],[485,1810],[485,e[1]]],label:[275,1745]});
 horizontal(d,'complete','progress','Kết quả hoàn thành',{from:'left',to:'right',label:[500,2010]});horizontal(d,'progress','save-progress','Chỉ số / ghi chú',{label:[500,2160]});horizontal(d,'save-progress','review','Tiến độ mới',{label:[980,2330]});horizontal(d,'review','validate-review','[Gửi đánh giá]',{from:'left',to:'right',label:[980,2480]});vertical(d,'validate-review','review-valid');vertical(d,'review-valid','save-review','[Có]',{label:[745,2860]});horizontal(d,'review-valid','review-error','[Không]',{label:[985,2730]});horizontal(d,'save-review','feedback','Kết quả đánh giá',{label:[990,3020]});vertical(d,'feedback','end');
 const skip=P(d,'review','right'),end=P(d,'end','right');d.edge('review','end','[Không gửi]',{from:'right',to:'right',via:[[1430,skip[1]],[1430,end[1]]],label:[1410,2540]});
 const er=P(d,'review-error','right');d.edge('review-error','end','Kết thúc lần gửi',{from:'right',to:'right',via:[[1410,er[1]],[1410,end[1]]],label:[1350,2930]});
 d.node('note','Đánh giá chỉ dành cho booking completed; không gửi thì kết thúc. Đánh giá không hợp lệ không tạo dữ liệu mới.\nHủy trước giờ tập: xem workflow-cancellation.drawio. Admin có thể xử lý kết quả theo quyền quản trị.',55,3320,1370,60,'note',{font:15});d.write('workflow-training');
}
{
 const {d,n}=swim('Swimlane — Hủy lịch và giữ lịch sử',['Member / Hội viên','Hệ thống (React / API / MongoDB)','PT / Huấn luyện viên'],1490);
 n('start','',0,225,'initial');n('request','Chọn booking của mình\nGửi yêu cầu hủy',0,325);n('validate','Kiểm tra quyền, trạng thái booked\nvà chưa đến giờ bắt đầu',1,500);n('valid','Cho phép hủy?',1,675,'decision');n('error','Hiển thị lỗi từ chối\nGiữ nguyên trạng thái',0,690);n('failed','',0,900,'final');
 n('cancel','Lưu cancelled; hoàn quota\nGiữ document và lịch sử',1,930);n('view','Xem lịch đã hủy\nCó thể đặt lại chỗ đã giải phóng',0,1120);n('pt-view','Xem lịch cập nhật\nBooking không còn giữ chỗ',2,1120);n('end','',0,1320,'final');
 vertical(d,'start','request');horizontal(d,'request','validate','Yêu cầu hủy',{label:[510,450]});vertical(d,'validate','valid');horizontal(d,'valid','error','[Không]',{from:'left',to:'right',label:[500,715]});vertical(d,'error','failed');vertical(d,'valid','cancel','[Có]',{label:[745,870]});horizontal(d,'cancel','view','Kết quả hủy',{from:'left',to:'right',label:[505,1070]});horizontal(d,'cancel','pt-view','Lịch đã cập nhật',{kind:'data',label:[990,1070]});vertical(d,'view','end');d.write('workflow-cancellation');
}

const entityFields={
 user:['User / users','_id: ObjectId [PK]','fullName, email [unique], password','phone, gender, dateOfBirth, avatar','role: member | trainer (PT) | admin','isActive: Boolean'],
 trainer:['TrainerProfile / trainerprofiles','_id: ObjectId [PK]','user: ObjectId [ref User, unique]','specialties[], certificates[], bio','experienceYears, pricePerSession','ratingAverage, ratingCount, isActive'],
 pkg:['MembershipPackage / membershippackages','_id: ObjectId [PK]','name, description, durationDays','price, sessionLimit (null = unlimited)','includesPT, isActive'],
 sub:['Subscription / subscriptions','_id: ObjectId [PK]','member: ref User; package: ref Package','startDate, endDate, amount, paidAt','status: pending / active / expired / cancelled','paymentStatus: unpaid / paid','includesPT, sessionLimit; reservedSessions'],
 booking:['Booking / bookings','_id: ObjectId [PK]','member: ref User; trainer: ref TrainerProfile','subscription: ref Subscription','date, startTime, endTime, note','quotaReserved: Boolean','status: booked / completed / cancelled / no_show'],
 plan:['WorkoutPlan / workoutplans','_id: ObjectId [PK]','member: ref User; trainer: ref TrainerProfile','title, goal, startDate, endDate, status','items[]: embedded exercises / sets / reps'],
 progress:['ProgressLog / progresslogs','_id: ObjectId [PK]','member: ref User; trainer?: ref TrainerProfile','date, weight, bodyFat, height','attendedSessions, note'],
 review:['Review / reviews','_id: ObjectId [PK]','member: ref User; trainer: ref TrainerProfile','booking: ref Booking [unique]','rating: integer 1–5; comment'],
};
function erd(physical){
 const d=new Diagram(physical?'Database diagram — MongoDB':'ERD — FitManager',2200,2320);title(d,physical?'DATABASE DIAGRAM · MONGODB':'ENTITY RELATIONSHIP DIAGRAM · FITMANAGER');
 subtitle(d,'Một entity xuất hiện một lần · Crow’s foot: || = 1; O| = 0..1; O< = 0..N · Ref MongoDB không phải khóa ngoại');
 const positions={user:[880,170],trainer:[100,610],pkg:[1610,170],sub:[1610,770],booking:[880,1060],plan:[100,1510],progress:[880,1890],review:[1610,1510]};
 const short={user:['Thông tin chung của Member / PT / Admin','email duy nhất; role kiểm soát quyền'],trainer:['Profile mở rộng riêng của PT','Mỗi User tối đa một TrainerProfile'],pkg:['Danh mục gói tập','Giá / thời hạn / quyền lợi'],sub:['Một lần đăng ký gói của hội viên','Giá chốt, thời hạn, trạng thái thanh toán'],booking:['Một buổi hẹn PT của hội viên','Gắn một Subscription'],plan:['Giáo án cho một hội viên','items[] nhúng trong document'],progress:['Nhật ký chỉ số theo ngày','PT ghi nhận có thể để trống'],review:['Đánh giá một buổi hoàn thành','Mỗi Booking tối đa một Review']};
 for(const [id,fields] of Object.entries(entityFields)){
  const lines=physical?fields:[fields[0].split(' / ')[0],'_id: ObjectId',...short[id]];
  const [x,y]=positions[id];d.node(id,lines.join('\n'),x,y,470,physical?280:225,'entity',{color:'amber',font:physical?17:19});
 }
 // Routes occupy dedicated corridors, not other entity boxes.
 const relation=(a,b,label,kind,from,to,via,at,sf=.5,tf=.5)=>d.edge(a,b,label,{kind,from,to,sf,tf,via,label:at});
 let a=P(d,'user','left',.45),b=P(d,'trainer','top');relation('user','trainer','Có hồ sơ PT','one-optional','left','top',[[700,a[1]],[700,520],[b[0],520]],[510,500],.45);
 a=P(d,'user','right',.7);b=P(d,'sub','left',.3);relation('user','sub','Đăng ký gói','one-many','right','left',[[1490,a[1]],[1490,b[1]]],[1465,650],.7,.3);
 vertical(d,'pkg','sub','Được đăng ký',{kind:'one-many',label:[1870,615]});
 vertical(d,'user','booking','Đặt lịch',{kind:'one-many',sf:.5,tf:.5,label:[1145,700]});
 a=P(d,'trainer','right',.45);b=P(d,'booking','left',.35);relation('trainer','booking','Huấn luyện','one-many','right','left',[[740,a[1]],[740,b[1]]],[725,985],.45,.35);
 a=P(d,'sub','left',.75);b=P(d,'booking','right',.35);relation('sub','booking','Sử dụng gói','one-many','left','right',[[1460,a[1]],[1460,b[1]]],[1460,1070],.75,.35);
 a=P(d,'user','left',.8);b=P(d,'plan','left',.7);relation('user','plan','Nhận giáo án','one-many','left','left',[[45,a[1]],[45,b[1]]],[130,1210],.8,.7);
 vertical(d,'trainer','plan','Tạo giáo án',{kind:'one-many',sf:.35,tf:.35,label:[290,1170]});
 a=P(d,'user','bottom',.2);b=P(d,'progress','left',.65);relation('user','progress','Có nhật ký tiến độ','one-many','bottom','left',[[a[0],470],[820,470],[820,b[1]]],[810,1750],.2,.65);
 a=P(d,'trainer','bottom',.8);b=P(d,'progress','left',.25);relation('trainer','progress','Ghi nhận (PT tùy chọn)','optional-many','bottom','left',[[a[0],1430],[750,1430],[750,b[1]]],[655,1790],.8,.25);
 a=P(d,'booking','right',.8);b=P(d,'review','left',.4);relation('booking','review','Có đánh giá','one-optional','right','left',[[1500,a[1]],[1500,b[1]]],[1485,1410],.8,.4);
 a=P(d,'user','top',.85);b=P(d,'review','right',.7);relation('user','review','Viết đánh giá','one-many','top','right',[[a[0],135],[2145,135],[2145,b[1]]],[2060,1260],.85,.7);
 a=P(d,'trainer','right',.8);b=P(d,'review','top',.5);relation('trainer','review','Được đánh giá','one-many','right','top',[[650,a[1]],[650,1460],[b[0],1460]],[1640,1437],.8,.5);
 d.node('notes','User là profile chung cho ba role; TrainerProfile chỉ mở rộng cho PT. ProgressLog.trainer tùy chọn.\nBooking → Review là 1 → 0..1; User → TrainerProfile là 1 → 0..1. Các quan hệ còn lại có thể chưa có bản ghi con.\n'+(physical?'Tất cả collection có createdAt / updatedAt / __v. Index và validation chi tiết: docs/04-database-design.md và docs/06-mongodb-optimization.md.':'WorkoutPlan.items là embedded array, không phải entity/collection độc lập. Chi tiết thuộc tính xem database.drawio.'),70,2225,2050,90,'note',{font:16});
 d.write(physical?'database':'erd');
}
erd(false);erd(true);
console.log('Generated 11 editable draw.io diagrams and matching SVG previews.');
